import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-bold text-white">Rootstock Airdrop</span>
            </div>
            <p className="text-sm text-gray-400">
              The Bitcoin DeFi Layer. Secure airdrop campaigns on Rootstock.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Build</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://rootstock.io/build" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Develop
                </a>
              </li>
              <li>
                <a href="https://docs.rootstock.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Use</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/claim" className="hover:text-blue-400 transition-colors">
                  Claim Airdrop
                </Link>
              </li>
              <li>
                <a href="https://rootstock.io/use" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Get rBTC
                </a>
              </li>
              <li>
                <a href="https://rootstock.io/ecosystem" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Ecosystem
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://rootstock.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Rootstock.io
                </a>
              </li>
              <li>
                <a href="https://explorer.testnet.rsk.co" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Testnet Explorer
                </a>
              </li>
              <li>
                <a href="https://rootstock.io/blog" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 Rootstock Airdrop System. Built on Rootstock - The Bitcoin DeFi Layer.</p>
        </div>
      </div>
    </footer>
  );
}


