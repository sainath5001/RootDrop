#!/bin/bash

# Deployment script for Rootstock Airdrop Contracts
# Usage: ./deploy.sh [testnet|mainnet]

set -e

NETWORK=${1:-testnet}

if [ "$NETWORK" = "testnet" ]; then
    RPC_URL="https://public-node.testnet.rsk.co"
    CHAIN_ID=31
    EXPLORER="https://explorer.testnet.rsk.co"
elif [ "$NETWORK" = "mainnet" ]; then
    RPC_URL="https://public-node.rsk.co"
    CHAIN_ID=30
    EXPLORER="https://explorer.rsk.co"
else
    echo "Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

echo "🚀 Deploying to Rootstock $NETWORK..."
echo "RPC URL: $RPC_URL"
echo "Chain ID: $CHAIN_ID"
echo ""

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo "Set it with: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Deploy contracts
echo "📦 Deploying contracts..."
forge script script/Deploy.s.sol \
    --rpc-url "$RPC_URL" \
    --broadcast \
    --private-key "$PRIVATE_KEY" \
    --legacy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Contract addresses are in: contracts/broadcast/Deploy.s.sol/$CHAIN_ID/run-latest.json"
echo ""
echo "To extract addresses, run:"
echo "  jq '.transactions[] | select(.contractName == \"AirdropEngine\") | .contractAddress' contracts/broadcast/Deploy.s.sol/$CHAIN_ID/run-latest.json"
echo "  jq '.transactions[] | select(.contractName == \"AirdropToken\") | .contractAddress' contracts/broadcast/Deploy.s.sol/$CHAIN_ID/run-latest.json"

