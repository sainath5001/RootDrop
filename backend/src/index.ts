import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import { initStorage, createCampaign, getCampaign, getCampaigns, getNextCampaignId, getClaimCount, markClaimed, isClaimed } from './storage';
import { verifyRunes } from './runes-verification';
import { Campaign, CreateCampaignRequest, ProofResponse, CampaignStatus } from './types';
import { keccak256, solidityPacked } from 'ethers';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || '';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Initialize storage
initStorage();

/**
 * Middleware to verify API key for admin endpoints
 */
function verifyApiKey(req: Request, res: Response, next: NextFunction) {
  const providedKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API_KEY not configured' });
  }

  if (providedKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
}

/**
 * POST /campaigns - Create a new campaign (admin only)
 */
app.post('/campaigns', verifyApiKey, async (req: Request, res: Response) => {
  try {
    const body: CreateCampaignRequest = req.body;

    // Validate required fields
    if (!body.merkleRoot || !body.tokenContract || body.startTime === undefined || body.endTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (body.startTime >= body.endTime) {
      return res.status(400).json({ error: 'Invalid time range' });
    }

    if (!body.isRunesToken && (!body.tokenIds || body.tokenIds.length === 0)) {
      return res.status(400).json({ error: 'ERC1155 campaigns must have tokenIds' });
    }

    if (body.isRunesToken && body.tokenIds && body.tokenIds.length > 0) {
      return res.status(400).json({ error: 'RUNES campaigns should have empty tokenIds' });
    }

    const campaignId = getNextCampaignId();
    const campaign: Campaign = {
      campaignId,
      merkleRoot: body.merkleRoot,
      tokenContract: body.tokenContract,
      isRunesToken: body.isRunesToken || false,
      tokenIds: body.tokenIds || [],
      metadata: body.metadata || '{}',
      startTime: body.startTime,
      endTime: body.endTime,
      createdAt: new Date().toISOString()
    };

    createCampaign(campaign);

    res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /proof/:campaignId/:address/:tokenId - Get proof for a user
 */
app.get('/proof/:campaignId/:address/:tokenId', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    const address = req.params.address.toLowerCase();
    const tokenId = req.params.tokenId;

    const campaign = getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Load proofs from out directory
    const outDir = path.join(process.cwd(), 'out');
    const proofFiles = fs.readdirSync(outDir)
      .filter(f => f.startsWith('proofs-') && f.endsWith('.json'))
      .sort()
      .reverse(); // Get most recent first

    let proofData: any = null;
    for (const file of proofFiles) {
      try {
        const content = fs.readFileSync(path.join(outDir, file), 'utf-8');
        const proofs = JSON.parse(content);
        if (proofs[address] && proofs[address].tokenId === tokenId) {
          proofData = proofs[address];
          break;
        }
      } catch (error) {
        // Continue to next file
      }
    }

    if (!proofData) {
      return res.status(404).json({ error: 'Proof not found for this address and tokenId' });
    }

    // Verify the leaf matches the campaign's merkle root
    const leaf = keccak256(
      solidityPacked(
        ['uint256', 'address', 'uint256', 'uint256'],
        [campaignId, address, tokenId, proofData.amount]
      )
    );

    if (proofData.leaf !== leaf) {
      return res.status(400).json({ error: 'Proof does not match campaign' });
    }

    const response: ProofResponse = {
      campaignId,
      address,
      tokenId: proofData.tokenId,
      amount: proofData.amount,
      proof: proofData.proof,
      leaf: proofData.leaf,
      merkleRoot: campaign.merkleRoot
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting proof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /status/:campaignId - Get campaign status
 */
app.get('/status/:campaignId', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    const campaign = getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Count total recipients from leaves file
    const outDir = path.join(process.cwd(), 'out');
    const leavesFiles = fs.readdirSync(outDir)
      .filter(f => f.startsWith('leaves-') && f.endsWith('.json'))
      .sort()
      .reverse();

    let totalRecipients = 0;
    if (leavesFiles.length > 0) {
      try {
        const content = fs.readFileSync(path.join(outDir, leavesFiles[0]), 'utf-8');
        const data = JSON.parse(content);
        totalRecipients = data.totalLeaves || 0;
      } catch (error) {
        // Use claim count as fallback
      }
    }

    const claimedCount = getClaimCount(campaignId);
    const now = Math.floor(Date.now() / 1000);

    const status: CampaignStatus = {
      campaignId,
      totalRecipients,
      claimedCount,
      active: campaign.startTime <= now && now <= campaign.endTime,
      startTime: campaign.startTime,
      endTime: campaign.endTime
    };

    res.json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /verify-runes - Verify a RUNES token
 */
app.post('/verify-runes', async (req: Request, res: Response) => {
  try {
    const { tokenAddress, runesId } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({ error: 'tokenAddress is required' });
    }

    const result = await verifyRunes(tokenAddress, runesId);
    res.json(result);
  } catch (error) {
    console.error('Error verifying RUNES:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /campaigns - List all campaigns
 */
app.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const campaigns = getCampaigns();
    res.json({ campaigns });
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /health - Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Airdrop Backend Server running on port ${PORT}`);
  console.log(`📝 API Key required for admin endpoints`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

