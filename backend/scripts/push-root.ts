#!/usr/bin/env ts-node
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// ABI for AirdropEngine contract
const AIRDROP_ENGINE_ABI = [
  "function createCampaign(address tokenContract, bool isRunesToken, uint256[] memory tokenIds, bytes32 merkleRoot, string memory metadata, uint256 startTime, uint256 endTime) public returns (uint256)",
  "function campaignCounter() public view returns (uint256)",
  "function getCampaign(uint256 campaignId) public view returns (tuple(address tokenContract, bool isRunesToken, uint256[] tokenIds, bytes32 merkleRoot, string metadata, uint256 startTime, uint256 endTime, bool active, uint256 totalClaimed))"
];

interface CampaignConfig {
  merkleRoot: string;
  tokenContract: string;
  isRunesToken: boolean;
  tokenIds: string[];
  metadata: string;
  startTime: number;
  endTime: number;
}

/**
 * Load campaign config from file or use command line arguments
 */
function loadCampaignConfig(): CampaignConfig {
  const args = process.argv.slice(2);
  
  // Try to load from file first
  if (args[0] && fs.existsSync(args[0])) {
    const content = fs.readFileSync(args[0], 'utf-8');
    return JSON.parse(content);
  }

  // Otherwise use command line arguments
  if (args.length < 6) {
    console.error('Usage: ts-node push-root.ts [config-file.json] OR');
    console.error('       ts-node push-root.ts <merkleRoot> <tokenContract> <isRunesToken> <tokenIds> <startTime> <endTime> [metadata]');
    console.error('');
    console.error('Example:');
    console.error('  ts-node push-root.ts 0x123... 0x456... false "[1,2]" 1704067200 1704153600');
    process.exit(1);
  }

  const [merkleRoot, tokenContract, isRunesTokenStr, tokenIdsStr, startTimeStr, endTimeStr, metadata] = args;
  
  let tokenIds: string[] = [];
  try {
    tokenIds = JSON.parse(tokenIdsStr);
  } catch {
    tokenIds = tokenIdsStr.split(',').map(t => t.trim()).filter(t => t);
  }

  return {
    merkleRoot,
    tokenContract,
    isRunesToken: isRunesTokenStr.toLowerCase() === 'true',
    tokenIds,
    metadata: metadata || '{}',
    startTime: parseInt(startTimeStr, 10),
    endTime: parseInt(endTimeStr, 10)
  };
}

/**
 * Main function
 */
async function main() {
  try {
    // Load environment variables
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.AIRDROP_ENGINE_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      console.error('Error: Missing required environment variables');
      console.error('Required: RPC_URL, PRIVATE_KEY, AIRDROP_ENGINE_ADDRESS');
      process.exit(1);
    }

    // Load campaign config
    const config = loadCampaignConfig();
    console.log('Campaign Configuration:');
    console.log(`  Merkle Root: ${config.merkleRoot}`);
    console.log(`  Token Contract: ${config.tokenContract}`);
    console.log(`  Is RUNES Token: ${config.isRunesToken}`);
    console.log(`  Token IDs: ${config.tokenIds.join(', ') || 'None (RUNES)'}`);
    console.log(`  Start Time: ${new Date(config.startTime * 1000).toISOString()}`);
    console.log(`  End Time: ${new Date(config.endTime * 1000).toISOString()}`);
    console.log('');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`, provider);

    console.log(`Deployer: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} RBTC`);
    console.log('');

    if (balance === 0n) {
      console.error('Error: Insufficient balance for transaction');
      process.exit(1);
    }

    // Connect to contract
    const contract = new ethers.Contract(contractAddress, AIRDROP_ENGINE_ABI, wallet);
    console.log(`Contract: ${contractAddress}`);
    console.log('');

    // Get current campaign counter
    const currentCounter = await contract.campaignCounter();
    console.log(`Current campaign counter: ${currentCounter.toString()}`);
    console.log('');

    // Prepare transaction
    console.log('Creating campaign transaction...');
    const tokenIdsArray = config.tokenIds.map(id => ethers.parseUnits(id, 0));
    
    const tx = await contract.createCampaign(
      config.tokenContract,
      config.isRunesToken,
      config.tokenIds.length > 0 ? tokenIdsArray : [],
      config.merkleRoot,
      config.metadata,
      config.startTime,
      config.endTime
    );

    console.log(`Transaction hash: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    // Wait for transaction
    const receipt = await tx.wait();
    
    console.log('');
    console.log('=== Transaction Confirmed ===');
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log('');

    // Get new campaign ID
    const newCounter = await contract.campaignCounter();
    const campaignId = newCounter - 1n;
    
    console.log(`✅ Campaign created with ID: ${campaignId.toString()}`);
    console.log(`   View on explorer: https://explorer.testnet.rsk.co/tx/${tx.hash}`);
    console.log('');

    // Save campaign info
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const campaignInfo = {
      campaignId: campaignId.toString(),
      merkleRoot: config.merkleRoot,
      tokenContract: config.tokenContract,
      isRunesToken: config.isRunesToken,
      tokenIds: config.tokenIds,
      metadata: config.metadata,
      startTime: config.startTime,
      endTime: config.endTime,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber.toString(),
      createdAt: new Date().toISOString()
    };

    const infoFile = path.join(outDir, `campaign-${campaignId}-info.json`);
    fs.writeFileSync(infoFile, JSON.stringify(campaignInfo, null, 2));
    console.log(`Campaign info saved to: ${infoFile}`);

  } catch (error: any) {
    console.error('Error:', error.message || error);
    if (error.transaction) {
      console.error('Transaction:', error.transaction);
    }
    if (error.receipt) {
      console.error('Receipt:', error.receipt);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

