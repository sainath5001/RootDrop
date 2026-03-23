import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { RootstockLogo } from '@/components/RootstockLogo';

export default function Home() {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-8rem)]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-rsk-shine pointer-events-none" />

      <section className="relative py-16 sm:py-20 lg:py-24 px-4">
        <Container size="lg" className="relative z-10">
          <div className="text-center mb-14 sm:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-rsk-primary/20 border border-rsk-primary/40 rounded-2xl mb-6 p-3 sm:p-4 shadow-rsk-glow animate-fade-in">
              <RootstockLogo width={80} height={80} className="w-full h-full object-contain" priority />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-rsk-text animate-slide-up">
              Rootstock Airdrop System
            </h1>
            <p className="text-rsk-accent text-lg sm:text-xl font-medium max-w-2xl mx-auto mb-2">
              The Bitcoin DeFi Layer
            </p>
            <p className="text-rsk-muted text-base sm:text-lg max-w-2xl mx-auto">
              Secure, gas-efficient ERC-1155 and RUNES token airdrops on Rootstock (RSK)
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-14 sm:mb-16">
            <Card
              variant="elevated"
              padding="lg"
              className="group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 bg-rsk-primary/20 border border-rsk-primary/30 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-rsk-glow transition-shadow">
                <svg className="w-6 h-6 text-rsk-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-rsk-text mb-2">Secure by Design</h3>
              <p className="text-rsk-muted text-sm sm:text-base">
                Merkle proof verification ensures only eligible recipients can claim tokens
              </p>
            </Card>

            <Card
              variant="elevated"
              padding="lg"
              className="group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 bg-rsk-accent/20 border border-rsk-accent/30 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-rsk-glow-accent transition-shadow">
                <svg className="w-6 h-6 text-rsk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-rsk-text mb-2">Gas Optimized</h3>
              <p className="text-rsk-muted text-sm sm:text-base">
                Batch distribution and efficient merkle proofs minimize transaction costs
              </p>
            </Card>

            <Card
              variant="elevated"
              padding="lg"
              className="group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 bg-rsk-primary/20 border border-rsk-primary/30 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-rsk-glow transition-shadow">
                <svg className="w-6 h-6 text-rsk-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-rsk-text mb-2">Multi-Token Support</h3>
              <p className="text-rsk-muted text-sm sm:text-base">
                Support for ERC-1155 tokens and bridged RUNES from Bitcoin
              </p>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <Link href="/admin" className="block group">
              <Card
                variant="elevated"
                padding="lg"
                className="h-full bg-rsk-secondary/60 border-rsk-primary/20 hover:border-rsk-primary/40 hover:shadow-rsk-glow transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-rsk-shine rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-rsk-primary/20 border border-rsk-primary/40 rounded-xl flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-rsk-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-rsk-text mb-2">Admin Dashboard</h2>
                  <p className="text-rsk-muted text-base mb-4">
                    Create and manage airdrop campaigns with merkle proof verification
                  </p>
                  <span className="inline-flex items-center gap-2 text-rsk-primary font-semibold group-hover:gap-3 transition-all">
                    Get Started
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Card>
            </Link>

            <Link href="/claim" className="block group">
              <Card
                variant="elevated"
                padding="lg"
                className="h-full bg-rsk-secondary/60 border-rsk-accent/20 hover:border-rsk-accent/40 hover:shadow-rsk-glow-accent transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-rsk-accent/20 border border-rsk-accent/40 rounded-xl flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-rsk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-rsk-text mb-2">Claim Tokens</h2>
                  <p className="text-rsk-muted text-base mb-4">
                    Connect your wallet and claim your eligible airdrop tokens
                  </p>
                  <span className="inline-flex items-center gap-2 text-rsk-accent font-semibold group-hover:gap-3 transition-all">
                    Claim Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
