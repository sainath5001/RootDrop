'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { WalletButton } from '@/components/WalletButton';
import { ClaimForm } from '@/components/ClaimForm';
import Link from 'next/link';

export default function ClaimPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold">
              Claim Airdrop
            </Link>
            <WalletButton />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Claim Your Airdrop</h1>

          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Please connect your wallet to claim tokens
              </p>
              <WalletButton />
            </div>
          ) : (
            <ClaimForm />
          )}
        </div>
      </div>
    </div>
  );
}

