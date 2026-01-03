import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

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

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data } = await api.get<{ campaigns: Campaign[] }>('/campaigns');
      return data.campaigns;
    },
  });
}

export function useCampaignStatus(campaignId: number) {
  return useQuery({
    queryKey: ['campaign-status', campaignId],
    queryFn: async () => {
      const { data } = await api.get<CampaignStatus>(`/status/${campaignId}`);
      return data;
    },
    enabled: campaignId !== undefined,
  });
}

export function useProof(campaignId: number, address: string, tokenId: string) {
  return useQuery({
    queryKey: ['proof', campaignId, address.toLowerCase(), tokenId],
    queryFn: async () => {
      const { data } = await api.get<ProofResponse>(
        `/proof/${campaignId}/${address.toLowerCase()}/${tokenId}`
      );
      return data;
    },
    enabled: !!campaignId && !!address && !!tokenId,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useCreateCampaignMutation() {
  return useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'campaignId' | 'createdAt'>) => {
      const { data } = await api.post<{ success: boolean; campaign: Campaign }>(
        '/campaigns',
        campaign,
        {
          headers: {
            'X-API-Key': API_KEY,
          },
        }
      );
      return data;
    },
  });
}

export function useVerifyRunes() {
  return useMutation({
    mutationFn: async (tokenAddress: string) => {
      const { data } = await api.post('/verify-runes', { tokenAddress });
      return data;
    },
  });
}

