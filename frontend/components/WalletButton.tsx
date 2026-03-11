'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/Button';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <div className="h-10 w-24 rounded-xl bg-rsk-secondary border border-rsk-border animate-pulse" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rsk-primary/15 border border-rsk-primary/30 text-rsk-primary font-medium">
          <div className="w-2 h-2 bg-rsk-primary rounded-full animate-pulse-soft" />
          <span className="text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="text-rsk-muted hover:text-rsk-text"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          variant="primary"
          size="md"
          isLoading={isPending}
          disabled={isPending}
          onClick={() => connect({ connector })}
          className="min-w-[140px]"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </Button>
      ))}
    </div>
  );
}
