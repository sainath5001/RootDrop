'use client';

import Link from 'next/link';
import { WalletButton } from './WalletButton';

export function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Rootstock Airdrop
              </span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/admin"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Admin
              </Link>
              <Link
                href="/claim"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
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




