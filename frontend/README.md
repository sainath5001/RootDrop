# Rootstock Airdrop Frontend

Next.js frontend for the ERC-1155 airdrop system with admin dashboard and user claim interface.

## Features

- **Admin Dashboard**: Create campaigns, view campaign status, push merkle roots to chain
- **User Claim Page**: Connect wallet, check eligibility, claim tokens
- **Wallet Integration**: wagmi + viem with WalletConnect support
- **Real-time Updates**: React Query for data fetching
- **Contract Interaction**: Direct contract calls via wagmi hooks

## Prerequisites

- Node.js >= 18
- npm or yarn
- Backend server running (see backend README)
- Deployed smart contracts

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.local.example .env.local
```

3. Configure `.env.local`:
```env
NEXT_PUBLIC_RPC_URL=https://public-node.testnet.rsk.co
NEXT_PUBLIC_CHAIN_ID=31

NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=your-secret-api-key-change-this

NEXT_PUBLIC_AIRDROP_ENGINE_ADDRESS=0xe73ed2770E308cA94CB2Ad2E828af3832c19bfb2
NEXT_PUBLIC_AIRDROP_TOKEN_ADDRESS=0x50eDe9B383248648d446646BE0aB44927279d766

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

4. Extract ABIs from contracts:
```bash
# Make sure contracts are compiled
cd ../contracts
forge build

# ABIs should be automatically extracted, or copy manually:
# contracts/out/AirdropEngine.sol/AirdropEngine.json -> frontend/contracts/abis/AirdropEngine.json
# contracts/out/AirdropToken.sol/AirdropToken.json -> frontend/contracts/abis/AirdropToken.json
```

## Development

Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── admin/
│   │   └── page.tsx        # Admin dashboard
│   └── claim/
│       └── page.tsx        # User claim page
├── components/
│   ├── WalletButton.tsx    # Wallet connection component
│   ├── CreateCampaignForm.tsx
│   ├── CampaignsList.tsx
│   └── ClaimForm.tsx
├── hooks/
│   ├── useAirdropEngine.ts # Contract interaction hooks
│   ├── useAirdropToken.ts
│   └── useBackendAPI.ts    # Backend API hooks
├── contracts/
│   ├── abis/               # Contract ABIs
│   └── addresses.ts        # Contract addresses
└── lib/
    └── wagmi.ts            # Wagmi configuration
```

## Usage

### Admin Dashboard

1. Navigate to `/admin`
2. Connect wallet (must be admin)
3. Create campaign:
   - Fill in campaign details
   - Upload CSV with recipients
   - Generate merkle tree (via backend)
   - Create campaign on-chain
4. View campaigns:
   - See all campaigns
   - View status (total recipients, claimed count)
   - Push merkle root to chain

### User Claim

1. Navigate to `/claim`
2. Connect wallet
3. Enter campaign ID and token ID
4. System fetches proof from backend
5. Click "Claim Tokens" to claim on-chain
6. View transaction on explorer

## WalletConnect Setup

1. Get project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Add to `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

## Building for Production

```bash
npm run build
npm start
```

## Integration with Backend

The frontend expects the backend API to be running on `NEXT_PUBLIC_API_URL`. Make sure:

1. Backend server is running (see backend README)
2. API key is configured correctly
3. CORS is enabled on backend for frontend origin

## Contract Addresses

Update contract addresses in `.env.local` after deployment:

- `NEXT_PUBLIC_AIRDROP_ENGINE_ADDRESS`: AirdropEngine contract
- `NEXT_PUBLIC_AIRDROP_TOKEN_ADDRESS`: AirdropToken contract

## Troubleshooting

### Wallet Connection Issues
- Make sure you're on Rootstock testnet/mainnet
- Check RPC URL is correct
- Verify WalletConnect project ID if using WalletConnect

### Contract Interaction Errors
- Verify contract addresses in `.env.local`
- Check ABIs are in `contracts/abis/`
- Ensure wallet is connected and on correct network

### API Errors
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify API key matches backend configuration

## License

MIT

