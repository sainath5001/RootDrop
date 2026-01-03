import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  initStorage,
  createCampaign,
  getCampaign,
  getCampaigns,
  getNextCampaignId,
  markClaimed,
  isClaimed,
  getClaimCount
} from '../src/storage';
import { Campaign } from '../src/types';

describe('Storage', () => {
  beforeEach(() => {
    // Clean up test data
    const dataDir = path.join(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
      const campaignsFile = path.join(dataDir, 'campaigns.json');
      const claimsFile = path.join(dataDir, 'claims.json');
      if (fs.existsSync(campaignsFile)) fs.unlinkSync(campaignsFile);
      if (fs.existsSync(claimsFile)) fs.unlinkSync(claimsFile);
    }
    initStorage();
  });

  it('should initialize storage', () => {
    expect(() => initStorage()).not.toThrow();
  });

  it('should create and retrieve campaigns', () => {
    const campaign: Campaign = {
      campaignId: 0,
      merkleRoot: '0x123',
      tokenContract: '0x456',
      isRunesToken: false,
      tokenIds: ['1', '2'],
      metadata: '{}',
      startTime: 1000,
      endTime: 2000,
      createdAt: new Date().toISOString()
    };

    createCampaign(campaign);
    const retrieved = getCampaign(0);

    expect(retrieved).toBeDefined();
    expect(retrieved?.merkleRoot).toBe('0x123');
    expect(retrieved?.tokenContract).toBe('0x456');
  });

  it('should get next campaign ID', () => {
    const campaigns = getCampaigns();
    const currentMaxId = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.campaignId)) : -1;
    const expectedNextId = currentMaxId + 1;
    
    const id1 = getNextCampaignId();
    expect(id1).toBe(expectedNextId);

    const campaign: Campaign = {
      campaignId: id1,
      merkleRoot: '0x123',
      tokenContract: '0x456',
      isRunesToken: false,
      tokenIds: [],
      metadata: '{}',
      startTime: 1000,
      endTime: 2000,
      createdAt: new Date().toISOString()
    };

    createCampaign(campaign);
    const id2 = getNextCampaignId();
    expect(id2).toBe(id1 + 1);
  });

  it('should track claims', () => {
    const campaignId = 0;
    const leaf = '0xabc123';

    expect(isClaimed(campaignId, leaf)).toBe(false);
    expect(getClaimCount(campaignId)).toBe(0);

    markClaimed(campaignId, leaf);

    expect(isClaimed(campaignId, leaf)).toBe(true);
    expect(getClaimCount(campaignId)).toBe(1);
  });

  it('should get all campaigns', () => {
    const campaign1: Campaign = {
      campaignId: 0,
      merkleRoot: '0x123',
      tokenContract: '0x456',
      isRunesToken: false,
      tokenIds: [],
      metadata: '{}',
      startTime: 1000,
      endTime: 2000,
      createdAt: new Date().toISOString()
    };

    const campaign2: Campaign = {
      campaignId: 1,
      merkleRoot: '0x789',
      tokenContract: '0xabc',
      isRunesToken: true,
      tokenIds: [],
      metadata: '{}',
      startTime: 2000,
      endTime: 3000,
      createdAt: new Date().toISOString()
    };

    createCampaign(campaign1);
    createCampaign(campaign2);

    const campaigns = getCampaigns();
    expect(campaigns.length).toBe(2);
  });
});

