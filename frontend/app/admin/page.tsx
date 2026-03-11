'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CreateCampaignForm } from '@/components/CreateCampaignForm';
import { CampaignsList } from '@/components/CampaignsList';
import { useHasAdminRole } from '@/hooks/useAirdropEngine';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const { address, isConnected } = useAccount();
  const { data: hasAdminRole, isLoading: isLoadingRole } = useHasAdminRole(address);

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 sm:py-16">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-rsk-text mb-3">Connect Your Wallet</h2>
            <p className="text-rsk-muted">Connect your wallet to access the admin dashboard.</p>
          </Card>
        </Container>
      </div>
    );
  }

  if (isLoadingRole) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 sm:py-16">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="inline-block w-10 h-10 border-2 border-rsk-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-rsk-muted">Verifying admin role...</p>
          </Card>
        </Container>
      </div>
    );
  }

  if (!hasAdminRole) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 sm:py-16">
        <Container size="md">
          <Alert variant="error" title="Access Denied">
            <p className="mb-1">Your wallet does not have admin role.</p>
            <p className="text-sm opacity-90">Only addresses with ADMIN_ROLE can access this page.</p>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-10 sm:py-12">
      <Container size="lg">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-rsk-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-rsk-muted text-base sm:text-lg">
            Manage airdrop campaigns and track distribution on Rootstock
          </p>
        </div>

        <div className="mb-8">
          <div className="inline-flex p-1.5 rounded-xl bg-rsk-secondary border border-rsk-border gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-rsk-primary text-rsk-bg shadow-rsk-glow'
                  : 'text-rsk-muted hover:text-rsk-text hover:bg-rsk-card'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-rsk-primary text-rsk-bg shadow-rsk-glow'
                  : 'text-rsk-muted hover:text-rsk-text hover:bg-rsk-card'
              }`}
            >
              Create Campaign
            </button>
          </div>
        </div>

        <Card variant="elevated" padding="lg">
          {activeTab === 'create' && <CreateCampaignForm />}
          {activeTab === 'list' && <CampaignsList />}
        </Card>
      </Container>
    </div>
  );
}
