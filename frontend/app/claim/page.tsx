'use client';

import { useAccount } from 'wagmi';
import { WalletButton } from '@/components/WalletButton';
import { ClaimForm } from '@/components/ClaimForm';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

export default function ClaimPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-[calc(100vh-8rem)] py-10 sm:py-12 lg:py-16">
      <Container size="sm" className="px-4">
        <div className="text-center mb-10 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-rsk-accent/20 border border-rsk-accent/40 rounded-2xl mb-5 shadow-rsk-glow-accent">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-rsk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-rsk-text">
            Claim Your Airdrop
          </h1>
          <p className="text-rsk-muted text-base sm:text-lg">
            Connect your wallet and claim your eligible tokens on Rootstock
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          {!isConnected ? (
            <div className="text-center py-10 sm:py-12">
              <div className="w-14 h-14 bg-rsk-secondary border border-rsk-border rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-rsk-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-rsk-text mb-2">Wallet Not Connected</h2>
              <p className="text-rsk-muted mb-6 max-w-sm mx-auto">
                Connect your wallet to check eligibility and claim tokens
              </p>
              <WalletButton />
            </div>
          ) : (
            <ClaimForm />
          )}
        </Card>
      </Container>
    </div>
  );
}
