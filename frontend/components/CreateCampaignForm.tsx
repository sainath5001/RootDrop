'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCreateCampaignMutation, useVerifyRunes } from '@/hooks/useBackendAPI';
import { useCreateCampaign as useCreateCampaignContract } from '@/hooks/useAirdropEngine';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

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

  useEffect(() => {
    if (createCampaignContract.isSuccess && createCampaignContract.hash && pendingFormData) {
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
    try {
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
      const tokenIds = formData.tokenIds
        ? formData.tokenIds.split(',').map(id => BigInt(id.trim()))
        : [];

      if (formData.isRunesToken && formData.runesTokenAddress) {
        await verifyRunes.mutateAsync(formData.runesTokenAddress);
      }

      const merkleRoot = formData.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000';
      const startTime = BigInt(Math.floor(new Date(formData.startTime).getTime() / 1000));
      const endTime = BigInt(Math.floor(new Date(formData.endTime).getTime() / 1000));
      const metadata = JSON.stringify({ name: formData.campaignName });

      setPendingFormData({ ...formData });

      createCampaignContract.createCampaign(
        formData.tokenContract as `0x${string}`,
        formData.isRunesToken,
        tokenIds,
        merkleRoot as `0x${string}`,
        metadata,
        startTime,
        endTime
      );
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert(`Error: ${error.message || 'Failed to create campaign'}`);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-rsk-secondary border border-rsk-border rounded-xl text-rsk-text placeholder-rsk-muted/60 focus:ring-2 focus:ring-rsk-primary/50 focus:border-rsk-primary/50 transition-all duration-200';
  const labelClass = 'block text-sm font-semibold text-rsk-muted mb-2';

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-rsk-text mb-8">
        Create New Campaign
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>Campaign Name</label>
          <input
            type="text"
            value={formData.campaignName}
            onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-runes"
            checked={formData.isRunesToken}
            onChange={(e) => setFormData({ ...formData, isRunesToken: e.target.checked })}
            className="w-4 h-4 rounded border-rsk-border bg-rsk-secondary text-rsk-primary focus:ring-rsk-primary/50"
          />
          <label htmlFor="is-runes" className="text-sm font-semibold text-rsk-muted">
            RUNES Token Campaign
          </label>
        </div>

        {formData.isRunesToken ? (
          <div>
            <label className={labelClass}>RUNES Token Address</label>
            <input
              type="text"
              value={formData.runesTokenAddress}
              onChange={(e) => setFormData({ ...formData, runesTokenAddress: e.target.value })}
              className={inputClass}
              placeholder="0x..."
              required={formData.isRunesToken}
            />
          </div>
        ) : (
          <>
            <div>
              <label className={labelClass}>Token Contract Address</label>
              <input
                type="text"
                value={formData.tokenContract}
                onChange={(e) => setFormData({ ...formData, tokenContract: e.target.value })}
                className={inputClass}
                placeholder="0x..."
                required={!formData.isRunesToken}
              />
            </div>

            <div>
              <label className={labelClass}>Token IDs (comma-separated)</label>
              <input
                type="text"
                value={formData.tokenIds}
                onChange={(e) => setFormData({ ...formData, tokenIds: e.target.value })}
                className={inputClass}
                placeholder="1, 2, 3"
                required={!formData.isRunesToken}
              />
            </div>
          </>
        )}

        <div>
          <label className={labelClass}>Merkle Root</label>
          <input
            type="text"
            value={formData.merkleRoot}
            onChange={(e) => setFormData({ ...formData, merkleRoot: e.target.value })}
            className={inputClass}
            placeholder="0xf1f143a9cd214014a785fdde0c5061743f403e16a9115f33468537236d5afdc5"
            required
          />
          <p className="mt-1.5 text-sm text-rsk-muted">
            Paste the merkle root from the backend generate-merkle command
          </p>
        </div>

        <div>
          <label className={labelClass}>Recipients CSV File (Optional)</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-4 py-3 bg-rsk-secondary border border-rsk-border rounded-xl text-rsk-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-rsk-primary/20 file:text-rsk-primary file:font-medium file:cursor-pointer focus:ring-2 focus:ring-rsk-primary/50 focus:border-rsk-primary/50"
          />
          <p className="mt-1.5 text-sm text-rsk-muted">Format: address,tokenId,amount</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>End Time</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>

        {createCampaignContract.error && (
          <Alert variant="error" title="Error">
            {createCampaignContract.error.message || 'Transaction failed'}
          </Alert>
        )}

        {createCampaignContract.isPending && (
          <Alert variant="info" title="Waiting for approval">
            Please confirm the transaction in your wallet (MetaMask).
          </Alert>
        )}

        {createCampaignContract.isConfirming && (
          <Alert variant="warning" title="Confirming">
            Transaction submitted. Waiting for confirmation on Rootstock...
          </Alert>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={createCampaignContract.isPending || createCampaignContract.isConfirming || createCampaignAPI.isPending}
          isLoading={createCampaignContract.isPending || createCampaignContract.isConfirming}
        >
          {createCampaignContract.isPending
            ? 'Waiting for wallet...'
            : createCampaignContract.isConfirming
              ? 'Confirming...'
              : createCampaignContract.isSuccess
                ? 'Campaign created!'
                : 'Create Campaign'}
        </Button>
      </form>
    </div>
  );
}
