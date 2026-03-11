'use client';

import { useCampaigns, useCampaignStatus } from '@/hooks/useBackendAPI';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CampaignsList() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { address, isConnected } = useAccount();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-2 border-rsk-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-rsk-muted">Loading campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card variant="bordered" padding="lg" className="text-center">
        <div className="w-14 h-14 bg-rsk-primary/20 border border-rsk-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-rsk-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-rsk-text mb-2">No Campaigns Yet</h3>
        <p className="text-rsk-muted">Create your first airdrop campaign to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-rsk-text">
          Campaigns
        </h2>
        <span className="px-4 py-2 bg-rsk-primary/15 border border-rsk-primary/30 rounded-xl text-rsk-primary font-semibold text-sm">
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
  const { isConnected } = useAccount();

  const handlePushToChain = async () => {
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }
    setIsPushing(true);
    try {
      alert('Push to chain functionality - integrate with push-root script');
    } catch (error) {
      console.error('Error pushing to chain:', error);
      alert('Error pushing to chain');
    } finally {
      setIsPushing(false);
    }
  };

  const statBoxClass = 'rounded-xl p-4 border border-rsk-border bg-rsk-secondary/50';

  return (
    <Card variant="elevated" padding="md" className="hover:border-rsk-primary/20 transition-colors duration-300">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rsk-primary/20 border border-rsk-primary/30 rounded-xl flex items-center justify-center">
            <span className="text-rsk-primary font-bold">#{campaign.campaignId}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-rsk-text">
              Campaign #{campaign.campaignId}
            </h3>
            <p className="text-sm text-rsk-muted mt-0.5">
              {campaign.isRunesToken ? 'RUNES Token' : 'ERC-1155'}
            </p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            status?.active
              ? 'bg-rsk-primary/15 border border-rsk-primary/30 text-rsk-primary'
              : 'bg-rsk-secondary border border-rsk-border text-rsk-muted'
          }`}
        >
          {status?.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={statBoxClass}>
          <p className="text-xs font-semibold text-rsk-muted uppercase mb-1">Total Recipients</p>
          <p className="text-xl font-bold text-rsk-text">{status?.totalRecipients || 0}</p>
        </div>
        <div className={statBoxClass}>
          <p className="text-xs font-semibold text-rsk-muted uppercase mb-1">Claimed</p>
          <p className="text-xl font-bold text-rsk-primary">{status?.claimedCount || 0}</p>
        </div>
        <div className={statBoxClass}>
          <p className="text-xs font-semibold text-rsk-muted uppercase mb-1">Unclaimed</p>
          <p className="text-xl font-bold text-rsk-accent">
            {(status?.totalRecipients || 0) - (status?.claimedCount || 0)}
          </p>
        </div>
        <div className={`${statBoxClass} col-span-2 md:col-span-1`}>
          <p className="text-xs font-semibold text-rsk-muted uppercase mb-1">Token Contract</p>
          <p className="text-xs font-mono text-rsk-muted truncate" title={campaign.tokenContract}>
            {campaign.tokenContract}
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-rsk-secondary rounded-xl border border-rsk-border">
        <p className="text-xs font-semibold text-rsk-muted uppercase mb-2">Merkle Root</p>
        <p className="text-xs font-mono text-rsk-muted break-all bg-rsk-bg/50 p-3 rounded-lg border border-rsk-border">
          {campaign.merkleRoot}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handlePushToChain}
          disabled={isPushing || !isConnected}
          isLoading={isPushing}
        >
          Push Root to Chain
        </Button>
        <a
          href={`https://explorer.testnet.rsk.co/address/${campaign.tokenContract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-transparent text-rsk-primary border border-rsk-primary/60 hover:bg-rsk-primary/10 transition-all duration-200 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on Explorer
        </a>
      </div>
    </Card>
  );
}
