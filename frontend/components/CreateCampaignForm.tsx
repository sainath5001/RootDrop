'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCreateCampaignMutation, useVerifyRunes } from '@/hooks/useBackendAPI';
import { useCreateCampaign as useCreateCampaignContract } from '@/hooks/useAirdropEngine';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function CreateCampaignForm() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    campaignName: '',
    tokenContract: '',
    isRunesToken: false,
    tokenIds: '',
    runesTokenAddress: '',
    merkleRoot: '',
    startTime: '',
    endTime: '',
    csvFile: null as File | null,
  });

  const createCampaignAPI = useCreateCampaignMutation();
  const verifyRunes = useVerifyRunes();
  const createCampaignContract = useCreateCampaignContract();
  const [pendingFormData, setPendingFormData] = useState<typeof formData | null>(null);

  // Handle successful transaction
  useEffect(() => {
    if (createCampaignContract.isSuccess && createCampaignContract.hash && pendingFormData) {
      // Create in backend
      const tokenIds = pendingFormData.tokenIds
        ? pendingFormData.tokenIds.split(',').map(id => id.trim())
        : [];
      
      createCampaignAPI.mutateAsync({
        merkleRoot: pendingFormData.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000',
        tokenContract: pendingFormData.tokenContract,
        isRunesToken: pendingFormData.isRunesToken,
        tokenIds,
        metadata: JSON.stringify({ name: pendingFormData.campaignName }),
        startTime: Math.floor(new Date(pendingFormData.startTime).getTime() / 1000),
        endTime: Math.floor(new Date(pendingFormData.endTime).getTime() / 1000),
      }).catch((backendError) => {
        console.warn('Backend campaign creation failed, but contract was created:', backendError);
      });

      alert(`Campaign created successfully on blockchain!\nTransaction: ${createCampaignContract.hash}\n\nView on explorer: https://explorer.testnet.rsk.co/tx/${createCampaignContract.hash}`);
      
      // Reset form
      setFormData({
        campaignName: '',
        tokenContract: '',
        isRunesToken: false,
        tokenIds: '',
        runesTokenAddress: '',
        merkleRoot: '',
        startTime: '',
        endTime: '',
        csvFile: null,
      });
      setPendingFormData(null);
    }
  }, [createCampaignContract.isSuccess, createCampaignContract.hash, pendingFormData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, csvFile: e.target.files[0] });
    }
  };

  const handleGenerateMerkle = async () => {
    if (!formData.csvFile) {
      alert('Please upload a CSV file');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('file', formData.csvFile);

    try {
      // In a real implementation, you'd call the backend generate-merkle endpoint
      // For now, we'll use the local script approach
      alert('Please generate merkle tree using: npm run generate-merkle in backend directory');
    } catch (error) {
      console.error('Error generating merkle:', error);
      alert('Error generating merkle tree');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Parse token IDs
      const tokenIds = formData.tokenIds
        ? formData.tokenIds.split(',').map(id => BigInt(id.trim()))
        : [];

      // Verify RUNES token if needed
      if (formData.isRunesToken && formData.runesTokenAddress) {
        await verifyRunes.mutateAsync(formData.runesTokenAddress);
      }

      // Use the merkle root from form or placeholder
      const merkleRoot = formData.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000';

      const startTime = BigInt(Math.floor(new Date(formData.startTime).getTime() / 1000));
      const endTime = BigInt(Math.floor(new Date(formData.endTime).getTime() / 1000));

      const metadata = JSON.stringify({ name: formData.campaignName });

      // Save form data for later use when transaction succeeds
      setPendingFormData({ ...formData });

      // Create campaign on contract - this will trigger MetaMask to open
      // MetaMask will pop up for user to approve
      createCampaignContract.createCampaign(
        formData.tokenContract as `0x${string}`,
        formData.isRunesToken,
        tokenIds,
        merkleRoot as `0x${string}`,
        metadata,
        startTime,
        endTime
      );

      // Don't reset form yet - wait for transaction to succeed
      // The useEffect will handle success and reset the form
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert(`Error: ${error.message || 'Failed to create campaign'}`);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        Create New Campaign
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={formData.campaignName}
            onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isRunesToken}
              onChange={(e) => setFormData({ ...formData, isRunesToken: e.target.checked })}
            />
            <span className="text-sm font-semibold text-gray-700">RUNES Token Campaign</span>
          </label>
        </div>

        {formData.isRunesToken ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              RUNES Token Address
            </label>
            <input
              type="text"
              value={formData.runesTokenAddress}
              onChange={(e) => setFormData({ ...formData, runesTokenAddress: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="0x..."
              required={formData.isRunesToken}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Token Contract Address
              </label>
              <input
                type="text"
                value={formData.tokenContract}
                onChange={(e) => setFormData({ ...formData, tokenContract: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0x..."
                required={!formData.isRunesToken}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Token IDs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tokenIds}
                onChange={(e) => setFormData({ ...formData, tokenIds: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="1, 2, 3"
                required={!formData.isRunesToken}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Merkle Root
          </label>
          <input
            type="text"
            value={formData.merkleRoot}
            onChange={(e) => setFormData({ ...formData, merkleRoot: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="0xf1f143a9cd214014a785fdde0c5061743f403e16a9115f33468537236d5afdc5"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Paste the merkle root from the backend generate-merkle command
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Recipients CSV File (Optional - for reference)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <p className="mt-1 text-sm text-gray-500">
            Format: address,tokenId,amount
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {createCampaignContract.error && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-800 font-bold">
                Error: {createCampaignContract.error.message || 'Transaction failed'}
              </p>
            </div>
          </div>
        )}

        {createCampaignContract.isPending && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-blue-800 font-semibold">
                Waiting for MetaMask approval... Please check your MetaMask window.
              </p>
            </div>
          </div>
        )}

        {createCampaignContract.isConfirming && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-spin">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-yellow-800 font-semibold">
                Transaction submitted! Waiting for confirmation...
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={createCampaignContract.isPending || createCampaignContract.isConfirming || createCampaignAPI.isPending}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {createCampaignContract.isPending
            ? 'Waiting for MetaMask...'
            : createCampaignContract.isConfirming
            ? 'Confirming Transaction...'
            : createCampaignContract.isSuccess
            ? 'Campaign Created!'
            : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}

