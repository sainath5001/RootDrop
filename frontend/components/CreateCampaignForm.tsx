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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={formData.campaignName}
            onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            <span className="text-sm font-medium text-gray-700">RUNES Token Campaign</span>
          </label>
        </div>

        {formData.isRunesToken ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUNES Token Address
            </label>
            <input
              type="text"
              value={formData.runesTokenAddress}
              onChange={(e) => setFormData({ ...formData, runesTokenAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0x..."
              required={formData.isRunesToken}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Contract Address
              </label>
              <input
                type="text"
                value={formData.tokenContract}
                onChange={(e) => setFormData({ ...formData, tokenContract: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0x..."
                required={!formData.isRunesToken}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token IDs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tokenIds}
                onChange={(e) => setFormData({ ...formData, tokenIds: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1, 2, 3"
                required={!formData.isRunesToken}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Merkle Root
          </label>
          <input
            type="text"
            value={formData.merkleRoot}
            onChange={(e) => setFormData({ ...formData, merkleRoot: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="0xf1f143a9cd214014a785fdde0c5061743f403e16a9115f33468537236d5afdc5"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Paste the merkle root from the backend generate-merkle command
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients CSV File (Optional - for reference)
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-sm text-gray-500">
            Format: address,tokenId,amount
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {createCampaignContract.error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">
              Error: {createCampaignContract.error.message || 'Transaction failed'}
            </p>
          </div>
        )}

        {createCampaignContract.isPending && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800">
              ⏳ Waiting for MetaMask approval... Please check your MetaMask window.
            </p>
          </div>
        )}

        {createCampaignContract.isConfirming && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800">
              ⏳ Transaction submitted! Waiting for confirmation...
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={createCampaignContract.isPending || createCampaignContract.isConfirming || createCampaignAPI.isPending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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

