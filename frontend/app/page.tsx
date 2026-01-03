import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Rootstock Airdrop System
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/admin"
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">
              Create and manage airdrop campaigns, push merkle roots to chain
            </p>
          </Link>

          <Link
            href="/claim"
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Claim Tokens</h2>
            <p className="text-gray-600">
              Connect wallet and claim your airdrop tokens
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

