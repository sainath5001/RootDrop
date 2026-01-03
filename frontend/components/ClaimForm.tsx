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
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Campaign ID
        </label>
        <input
          type="number"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Token ID
        </label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
          placeholder="1"
        />
      </div>

      {!address && campaignId && tokenId && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-yellow-800 font-bold text-lg">
              Wallet Not Connected
            </p>
          </div>
          <p className="text-sm text-yellow-700 mb-2">
            You've entered Campaign ID: <span className="font-semibold">{campaignId}</span> and Token ID: <span className="font-semibold">{tokenId}</span>
          </p>
          <p className="text-sm text-yellow-700">
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
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
          >
            🔧 Test API Connection
          </button>

          {isLoadingProof ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-lg font-semibold text-gray-900">Loading proof...</p>
              <p className="text-sm text-gray-500 mt-2">
                Checking eligibility for address: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                If this takes too long, click "Test API Connection" above
              </p>
            </div>
          ) : proofError ? (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-800 font-bold text-lg">
                  {proofError.message || 'Not eligible for this airdrop'}
                </p>
              </div>
              <p className="text-sm text-red-700">
                Make sure your wallet address matches the one in the campaign CSV file.
              </p>
            </div>
          ) : proofData ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-bold text-xl">
                      You are eligible for this airdrop!
                    </p>
                    <p className="text-lg text-green-700 font-semibold mt-1">
                      Amount: {proofData.amount} tokens
                    </p>
                  </div>
                </div>
              </div>

              {isClaimedData ? (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-yellow-800 font-bold text-lg">
                      You have already claimed this airdrop
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {balance !== undefined && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
                      <p className="text-blue-800 font-semibold">
                        Current Balance: <span className="text-xl font-bold">{balance?.toString() || '0'}</span> tokens
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleClaim}
                    disabled={claim.isPending || claim.isConfirming}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
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
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold">
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

