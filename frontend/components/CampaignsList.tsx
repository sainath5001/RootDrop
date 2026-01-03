'use client';

import { useCampaigns, useCampaignStatus } from '@/hooks/useBackendAPI';
import { useCreateCampaign as useCreateCampaignContract } from '@/hooks/useAirdropEngine';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export function CampaignsList() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { address, isConnected } = useAccount();

  if (isLoading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No campaigns found. Create your first campaign!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.campaignId} campaign={campaign} />
      ))}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: any }) {
  const { data: status } = useCampaignStatus(campaign.campaignId);
  const [isPushing, setIsPushing] = useState(false);
  const { address, isConnected } = useAccount();

  const handlePushToChain = async () => {
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    setIsPushing(true);
    try {
      // This would call the push-root script or contract directly
      alert('Push to chain functionality - integrate with push-root script');
    } catch (error) {
      console.error('Error pushing to chain:', error);
      alert('Error pushing to chain');
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">
            Campaign #{campaign.campaignId}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {campaign.isRunesToken ? 'RUNES Token' : 'ERC-1155'}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            status?.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status?.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Total Recipients</p>
          <p className="text-lg font-semibold">{status?.totalRecipients || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Claimed</p>
          <p className="text-lg font-semibold">{status?.claimedCount || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Unclaimed</p>
          <p className="text-lg font-semibold">
            {(status?.totalRecipients || 0) - (status?.claimedCount || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Token Contract</p>
          <p className="text-xs font-mono truncate">{campaign.tokenContract}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Merkle Root</p>
        <p className="text-xs font-mono break-all">{campaign.merkleRoot}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePushToChain}
          disabled={isPushing || !isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isPushing ? 'Pushing...' : 'Push Root to Chain'}
        </button>
        <a
          href={`https://explorer.testnet.rsk.co/address/${campaign.tokenContract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
}

