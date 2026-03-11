import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-rsk-secondary border-t border-rsk-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-rsk-primary/20 border border-rsk-primary/40 rounded-xl flex items-center justify-center">
                <span className="text-rsk-primary font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-semibold text-rsk-text">Rootstock Airdrop</span>
            </div>
            <p className="text-sm text-rsk-muted">
              The Bitcoin DeFi Layer. Secure airdrop campaigns on Rootstock (RSK).
            </p>
          </div>

          <div>
            <h3 className="text-rsk-text font-semibold mb-4">Build</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://rootstock.io/build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Develop
                </a>
              </li>
              <li>
                <a
                  href="https://docs.rootstock.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Docs
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-rsk-muted hover:text-rsk-accent transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-rsk-text font-semibold mb-4">Use</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/claim" className="text-rsk-muted hover:text-rsk-accent transition-colors">
                  Claim Airdrop
                </Link>
              </li>
              <li>
                <a
                  href="https://rootstock.io/use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Get rBTC
                </a>
              </li>
              <li>
                <a
                  href="https://rootstock.io/ecosystem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Ecosystem
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-rsk-text font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://rootstock.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Rootstock.io
                </a>
              </li>
              <li>
                <a
                  href="https://explorer.testnet.rsk.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Testnet Explorer
                </a>
              </li>
              <li>
                <a
                  href="https://rootstock.io/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rsk-muted hover:text-rsk-accent transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-rsk-border mt-8 pt-8 text-center text-sm text-rsk-muted">
          <p>© {new Date().getFullYear()} Rootstock Airdrop System. Built on Rootstock — The Bitcoin DeFi Layer.</p>
        </div>
      </div>
    </footer>
  );
}
