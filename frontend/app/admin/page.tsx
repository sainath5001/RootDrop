'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletButton } from '@/components/WalletButton';
import { CreateCampaignForm } from '@/components/CreateCampaignForm';
import { CampaignsList } from '@/components/CampaignsList';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold">
              Airdrop Admin
            </Link>
            <WalletButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Campaign
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'create' && <CreateCampaignForm />}
        {activeTab === 'list' && <CampaignsList />}
      </div>
    </div>
  );
}

