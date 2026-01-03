'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useProof } from '@/hooks/useBackendAPI';
import { useClaim, useIsClaimed } from '@/hooks/useAirdropEngine';
import { useTokenBalance } from '@/hooks/useAirdropToken';
import { keccak256, encodePacked } from 'viem';

export function ClaimForm() {
  const { address } = useAccount();
  const [campaignId, setCampaignId] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');

  const { data: proofData, isLoading: isLoadingProof, error: proofError } = useProof(
    campaignId ? parseInt(campaignId) : 0,
    address ? address.toLowerCase() : '',
    tokenId
  );

  // Debug logging
  useEffect(() => {
    if (campaignId && tokenId && address) {
      console.log('ClaimForm Debug:', {
        campaignId,
        tokenId,
        address: address.toLowerCase(),
        isLoadingProof,
        proofError,
        proofData,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      });
    }
  }, [campaignId, tokenId, address, isLoadingProof, proofError, proofData]);

  const claim = useClaim();
  const { data: balance } = useTokenBalance(tokenId ? BigInt(tokenId) : 0n);

  // Calculate leaf hash to check if already claimed
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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign ID
        </label>
        <input
          type="number"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token ID
        </label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="1"
        />
      </div>

      {!address && campaignId && tokenId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Wallet Not Connected
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            You've entered Campaign ID: {campaignId} and Token ID: {tokenId}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Please connect your wallet using the button in the top right corner to check eligibility.
          </p>
        </div>
      )}

      {campaignId && tokenId && address && (
        <div className="mt-6">
          {/* Test button to manually check */}
          <button
            onClick={async () => {
              try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const url = `${apiUrl}/proof/${campaignId}/${address.toLowerCase()}/${tokenId}`;
                console.log('Testing API:', url);
                const response = await fetch(url);
                const data = await response.json();
                console.log('API Response:', data);
                alert(`API Test: ${response.status === 200 ? 'SUCCESS' : 'FAILED'}\n\nResponse: ${JSON.stringify(data, null, 2)}`);
              } catch (error: any) {
                console.error('API Test Error:', error);
                alert(`API Test FAILED: ${error.message}`);
              }
            }}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🔧 Test API Connection
          </button>

          {isLoadingProof ? (
            <div className="text-center py-4">
              <p>Loading proof...</p>
              <p className="text-sm text-gray-500 mt-2">
                Checking eligibility for address: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                If this takes too long, click "Test API Connection" above
              </p>
            </div>
          ) : proofError ? (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800">
                {proofError.message || 'Not eligible for this airdrop'}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Make sure your wallet address matches the one in the campaign CSV file.
              </p>
            </div>
          ) : proofData ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-semibold mb-2">
                  ✓ You are eligible for this airdrop!
                </p>
                <p className="text-sm text-green-700">
                  Amount: {proofData.amount} tokens
                </p>
              </div>

              {isClaimedData ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-yellow-800 font-semibold">
                    ⚠️ You have already claimed this airdrop
                  </p>
                </div>
              ) : (
                <>
                  {balance !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-blue-800">
                        Current Balance: {balance?.toString() || '0'} tokens
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleClaim}
                    disabled={claim.isPending || claim.isConfirming}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                  >
                    {claim.isPending
                      ? 'Preparing transaction...'
                      : claim.isConfirming
                        ? 'Confirming transaction...'
                        : claim.isSuccess
                          ? 'Claimed Successfully!'
                          : 'Claim Tokens'}
                  </button>

                  {claim.hash && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                      <a
                        href={`https://explorer.testnet.rsk.co/tx/${claim.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                      >
                        {claim.hash}
                      </a>
                    </div>
                  )}

                  {claim.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <p className="text-red-800">
                        Error: {claim.error.message || 'Transaction failed'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="text-gray-600">
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

