'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useProof } from '@/hooks/useBackendAPI';
import { useClaim, useIsClaimed } from '@/hooks/useAirdropEngine';
import { useTokenBalance } from '@/hooks/useAirdropToken';
import { keccak256, encodePacked } from 'viem';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function ClaimForm() {
  const { address } = useAccount();
  const [campaignId, setCampaignId] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');

  const { data: proofData, isLoading: isLoadingProof, error: proofError } = useProof(
    campaignId ? parseInt(campaignId) : 0,
    address ? address.toLowerCase() : '',
    tokenId
  );

  const claim = useClaim();
  const { data: balance } = useTokenBalance(tokenId ? BigInt(tokenId) : 0n);

  const leafHash = campaignId && address && tokenId && proofData
    ? keccak256(
        encodePacked(
          ['uint256', 'address', 'uint256', 'uint256'],
          [BigInt(campaignId), address as `0x${string}`, BigInt(tokenId), BigInt(proofData.amount)]
        )
      )
    : undefined;

  const { data: isClaimedData } = useIsClaimed(
    campaignId ? BigInt(campaignId) : 0n,
    (leafHash || '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`
  );

  const handleClaim = async () => {
    if (!proofData || !campaignId || !tokenId) {
      alert('Please enter campaign ID and token ID');
      return;
    }

    try {
      await claim.claim(
        BigInt(campaignId),
        BigInt(tokenId),
        BigInt(proofData.amount),
        proofData.proof as `0x${string}`[]
      );
    } catch (error: any) {
      console.error('Claim error:', error);
      alert(`Error: ${error.message || 'Failed to claim'}`);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-rsk-secondary border border-rsk-border rounded-xl text-rsk-text placeholder-rsk-muted/60 focus:ring-2 focus:ring-rsk-primary/50 focus:border-rsk-primary/50 transition-all duration-200';

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-rsk-muted mb-2">
          Campaign ID
        </label>
        <input
          type="number"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className={inputClass}
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-rsk-muted mb-2">
          Token ID
        </label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className={inputClass}
          placeholder="1"
        />
      </div>

      {!address && campaignId && tokenId && (
        <Alert variant="warning" title="Wallet Not Connected">
          <p className="mb-1">
            You&apos;ve entered Campaign ID: <span className="font-semibold text-rsk-text">{campaignId}</span> and Token ID: <span className="font-semibold text-rsk-text">{tokenId}</span>.
          </p>
          <p>Connect your wallet using the button in the header to check eligibility.</p>
        </Alert>
      )}

      {campaignId && tokenId && address && (
        <div className="mt-6 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const url = `${apiUrl}/proof/${campaignId}/${address.toLowerCase()}/${tokenId}`;
                const response = await fetch(url);
                const data = await response.json();
                alert(`API Test: ${response.status === 200 ? 'SUCCESS' : 'FAILED'}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
              } catch (error: any) {
                alert(`API Test FAILED: ${error.message}`);
              }
            }}
            className="text-rsk-muted"
          >
            🔧 Test API Connection
          </Button>

          {isLoadingProof ? (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-2 border-rsk-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-rsk-text font-semibold">Loading proof...</p>
              <p className="text-sm text-rsk-muted mt-2">
                Checking eligibility for {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs text-rsk-muted mt-2">
                If this takes too long, click &quot;Test API Connection&quot; above
              </p>
            </div>
          ) : proofError ? (
            <Alert variant="error" title={proofError.message || 'Not eligible for this airdrop'}>
              Make sure your wallet address matches the one in the campaign CSV file.
            </Alert>
          ) : proofData ? (
            <div className="space-y-4">
              <Alert variant="success" title="You are eligible for this airdrop!">
                <p className="font-semibold text-rsk-text">Amount: {proofData.amount} tokens</p>
              </Alert>

              {isClaimedData ? (
                <Alert variant="warning" title="Already claimed">
                  You have already claimed this airdrop.
                </Alert>
              ) : (
                <>
                  {balance !== undefined && (
                    <div className="bg-rsk-accent/10 border border-rsk-accent/30 rounded-xl p-4">
                      <p className="text-rsk-muted text-sm">
                        Current Balance: <span className="text-rsk-text font-bold text-lg">{balance?.toString() || '0'}</span> tokens
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={claim.isPending || claim.isConfirming}
                    disabled={claim.isPending || claim.isConfirming}
                    onClick={handleClaim}
                  >
                    {claim.isPending
                      ? 'Preparing transaction...'
                      : claim.isConfirming
                        ? 'Confirming...'
                        : claim.isSuccess
                          ? 'Claimed successfully!'
                          : 'Claim Tokens'}
                  </Button>

                  {claim.hash && (
                    <div className="mt-4 p-4 bg-rsk-secondary rounded-xl border border-rsk-border">
                      <p className="text-sm text-rsk-muted mb-2">Transaction</p>
                      <a
                        href={`https://explorer.testnet.rsk.co/tx/${claim.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rsk-accent hover:underline break-all text-sm font-mono"
                      >
                        {claim.hash}
                      </a>
                    </div>
                  )}

                  {claim.error && (
                    <Alert variant="error" title="Transaction failed">
                      {claim.error.message || 'Transaction failed'}
                    </Alert>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-rsk-border bg-rsk-secondary/50 p-6 text-center">
              <div className="w-12 h-12 bg-rsk-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-rsk-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-rsk-muted font-medium">
                {!campaignId && !tokenId
                  ? 'Enter campaign ID and token ID to check eligibility'
                  : !address
                    ? 'Waiting for wallet connection...'
                    : 'Checking eligibility...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
