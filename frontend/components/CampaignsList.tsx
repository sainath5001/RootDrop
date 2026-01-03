'use client';

import { useCampaigns, useCampaignStatus } from '@/hooks/useBackendAPI';
import { useCreateCampaign as useCreateCampaignContract } from '@/hooks/useAirdropEngine';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export function CampaignsList() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { address, isConnected } = useAccount();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Campaigns Yet</h3>
        <p className="text-gray-600 mb-6">Create your first airdrop campaign to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Campaigns
        </h2>
        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
          {campaigns.length} {campaigns.length === 1 ? 'Campaign' : 'Campaigns'}
        </span>
      </div>
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">#{campaign.campaignId}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
            Campaign #{campaign.campaignId}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
                {campaign.isRunesToken ? '🪙 RUNES Token' : '🎫 ERC-1155'}
          </p>
            </div>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
            status?.active
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {status?.active ? '✓ Active' : '○ Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Total Recipients</p>
          <p className="text-2xl font-bold text-blue-900">{status?.totalRecipients || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Claimed</p>
          <p className="text-2xl font-bold text-green-900">{status?.claimedCount || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Unclaimed</p>
          <p className="text-2xl font-bold text-orange-900">
            {(status?.totalRecipients || 0) - (status?.claimedCount || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Token Contract</p>
          <p className="text-xs font-mono truncate text-gray-900">{campaign.tokenContract}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Merkle Root</p>
        <p className="text-xs font-mono break-all text-gray-900 bg-white p-2 rounded border">{campaign.merkleRoot}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePushToChain}
          disabled={isPushing || !isConnected}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isPushing ? 'Pushing...' : 'Push Root to Chain'}
        </button>
        <a
          href={`https://explorer.testnet.rsk.co/address/${campaign.tokenContract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on Explorer
        </a>
      </div>
    </div>
  );
}

