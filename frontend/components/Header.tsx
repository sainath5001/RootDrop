'use client';

import Link from 'next/link';
import { WalletButton } from './WalletButton';

export function Header() {
  return (
    <header className="bg-rsk-secondary/80 backdrop-blur-md border-b border-rsk-border sticky top-0 z-50 transition-colors duration-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            >
              <div className="w-9 h-9 bg-rsk-primary/20 border border-rsk-primary/40 rounded-xl flex items-center justify-center group-hover:shadow-rsk-glow transition-shadow duration-200">
                <span className="text-rsk-primary font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-bold text-rsk-text hidden sm:inline">
                Rootstock Airdrop
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-rsk-muted hover:text-rsk-text hover:bg-rsk-card font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg text-rsk-muted hover:text-rsk-text hover:bg-rsk-card font-medium transition-all duration-200"
              >
                Admin
              </Link>
              <Link
                href="/claim"
                className="px-4 py-2 rounded-lg text-rsk-muted hover:text-rsk-text hover:bg-rsk-card font-medium transition-all duration-200"
              >
                Claim
              </Link>
            </div>
          </div>
          <WalletButton />
        </div>
      </nav>
    </header>
  );
}
