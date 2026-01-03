export interface Campaign {
  campaignId: number;
  merkleRoot: string;
  tokenContract: string;
  isRunesToken: boolean;
  tokenIds: string[];
  metadata: string;
  startTime: number;
  endTime: number;
  createdAt: string;
}

export interface CampaignStatus {
  campaignId: number;
  totalRecipients: number;
  claimedCount: number;
  active: boolean;
  startTime: number;
  endTime: number;
}

export interface ProofResponse {
  campaignId: number;
  address: string;
  tokenId: string;
  amount: string;
  proof: string[];
  leaf: string;
  merkleRoot: string;
}

export interface CreateCampaignRequest {
  merkleRoot: string;
  tokenContract: string;
  isRunesToken: boolean;
  tokenIds: string[];
  metadata: string;
  startTime: number;
  endTime: number;
}

export interface VerifyRunesRequest {
  tokenAddress: string;
  runesId?: string;
}

