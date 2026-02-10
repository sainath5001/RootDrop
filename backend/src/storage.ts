import * as fs from 'fs';
import * as path from 'path';
import { Campaign, CampaignStatus } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory storage (can be replaced with database)
// Note: Claims are tracked on-chain in the contract, not in backend storage
let campaigns: Map<number, Campaign> = new Map();

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
 * Initialize storage
 */
export function initStorage(): void {
  loadCampaigns();
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
 * Note: Claim tracking has been removed from backend storage.
 * The source of truth for claims is the blockchain contract.
 * Use the contract's isClaimed() function to check claim status.
 * Use event listeners to track claim counts if needed.
 */

