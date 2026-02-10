'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CreateCampaignForm } from '@/components/CreateCampaignForm';
import { CampaignsList } from '@/components/CampaignsList';
import { useHasAdminRole } from '@/hooks/useAirdropEngine';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const { address, isConnected } = useAccount();
  const { data: hasAdminRole, isLoading: isLoadingRole } = useHasAdminRole(address);

  // Check if user has admin role
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingRole) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-600">Verifying admin role...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAdminRole) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-2">Your wallet does not have admin role.</p>
            <p className="text-sm text-gray-500">Only addresses with ADMIN_ROLE can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your airdrop campaigns and track distribution
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2 inline-flex space-x-2">
              <button
                onClick={() => setActiveTab('list')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'create'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Create Campaign
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        {activeTab === 'create' && <CreateCampaignForm />}
        {activeTab === 'list' && <CampaignsList />}
        </div>
      </div>
    </div>
  );
}

