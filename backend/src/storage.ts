import * as fs from 'fs';
import * as path from 'path';
import { Campaign, CampaignStatus } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const CLAIMS_FILE = path.join(DATA_DIR, 'claims.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory storage (can be replaced with database)
let campaigns: Map<number, Campaign> = new Map();
let claims: Map<number, Set<string>> = new Map(); // campaignId -> Set of claimed leaves

/**
 * Load campaigns from file
 */
export function loadCampaigns(): void {
  if (fs.existsSync(CAMPAIGNS_FILE)) {
    try {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
      const campaignsArray: Campaign[] = JSON.parse(data);
      campaigns = new Map(campaignsArray.map(c => [c.campaignId, c]));
    } catch (error) {
      console.error('Error loading campaigns:', error);
      campaigns = new Map();
    }
  }
}

/**
 * Save campaigns to file
 */
export function saveCampaigns(): void {
  try {
    const campaignsArray = Array.from(campaigns.values());
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaignsArray, null, 2));
  } catch (error) {
    console.error('Error saving campaigns:', error);
  }
}

/**
 * Load claims from file
 */
export function loadClaims(): void {
  if (fs.existsSync(CLAIMS_FILE)) {
    try {
      const data = fs.readFileSync(CLAIMS_FILE, 'utf-8');
      const claimsData: Record<string, string[]> = JSON.parse(data);
      claims = new Map(
        Object.entries(claimsData).map(([campaignId, leaves]) => [
          parseInt(campaignId, 10),
          new Set(leaves)
        ])
      );
    } catch (error) {
      console.error('Error loading claims:', error);
      claims = new Map();
    }
  }
}

/**
 * Save claims to file
 */
export function saveClaims(): void {
  try {
    const claimsData: Record<string, string[]> = {};
    claims.forEach((leaves, campaignId) => {
      claimsData[campaignId.toString()] = Array.from(leaves);
    });
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claimsData, null, 2));
  } catch (error) {
    console.error('Error saving claims:', error);
  }
}

/**
 * Initialize storage
 */
export function initStorage(): void {
  loadCampaigns();
  loadClaims();
}

/**
 * Get all campaigns
 */
export function getCampaigns(): Campaign[] {
  return Array.from(campaigns.values());
}

/**
 * Get campaign by ID
 */
export function getCampaign(campaignId: number): Campaign | undefined {
  return campaigns.get(campaignId);
}

/**
 * Create a new campaign
 */
export function createCampaign(campaign: Campaign): void {
  campaigns.set(campaign.campaignId, campaign);
  saveCampaigns();
}

/**
 * Get next campaign ID
 */
export function getNextCampaignId(): number {
  if (campaigns.size === 0) return 0;
  return Math.max(...Array.from(campaigns.keys())) + 1;
}

/**
 * Mark a claim
 */
export function markClaimed(campaignId: number, leaf: string): void {
  if (!claims.has(campaignId)) {
    claims.set(campaignId, new Set());
  }
  claims.get(campaignId)!.add(leaf);
  saveClaims();
}

/**
 * Check if a claim is already made
 */
export function isClaimed(campaignId: number, leaf: string): boolean {
  return claims.get(campaignId)?.has(leaf) || false;
}

/**
 * Get claim count for a campaign
 */
export function getClaimCount(campaignId: number): number {
  return claims.get(campaignId)?.size || 0;
}

