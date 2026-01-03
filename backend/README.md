# Rootstock ERC-1155 Airdrop Backend

Node.js backend for the ERC-1155 airdrop system with Merkle tree generation, API server, and Rootstock integration.

## Features

- **Merkle Tree Generation**: Generate Merkle trees from CSV/JSON recipient lists
- **REST API**: Endpoints for campaign management, proof retrieval, and status tracking
- **RUNES Verification**: Verify bridged RUNES tokens (with mock support)
- **Contract Integration**: Script to push merkle roots to smart contracts
- **Persistent Storage**: JSON-based storage for campaigns and claims

## Prerequisites

- Node.js >= 18
- npm or yarn
- Access to Rootstock testnet/mainnet RPC

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure `.env`:
```env
PORT=3000
API_KEY=your-secret-api-key-here

RPC_URL=https://public-node.testnet.rsk.co
PRIVATE_KEY=your-private-key-without-0x-prefix

AIRDROP_ENGINE_ADDRESS=0xe73ed2770E308cA94CB2Ad2E828af3832c19bfb2
AIRDROP_TOKEN_ADDRESS=0x50eDe9B383248648d446646BE0aB44927279d766

BRIDGE_API_KEY=your-bridge-api-key-here
BRIDGE_API_URL=https://api.rootstock.io/bridge/v1
USE_MOCK_RUNES_VERIFICATION=true
```

4. Build TypeScript:
```bash
npm run build
```

## Usage

### 1. Generate Merkle Tree

Create a CSV or JSON file with recipients:

**CSV format** (`recipients.csv`):
```csv
address,tokenId,amount
0x1111111111111111111111111111111111111111,1,100
0x2222222222222222222222222222222222222222,1,200
0x3333333333333333333333333333333333333333,2,150
```

**JSON format** (`recipients.json`):
```json
[
  {
    "address": "0x1111111111111111111111111111111111111111",
    "tokenId": "1",
    "amount": "100"
  },
  {
    "address": "0x2222222222222222222222222222222222222222",
    "tokenId": "1",
    "amount": "200"
  }
]
```

Generate Merkle tree:
```bash
npm run generate-merkle recipients.csv [campaign-id]
```

Output files will be saved in `out/`:
- `merkle-root-{timestamp}.json` - Merkle root and metadata
- `proofs-{timestamp}.json` - Proofs for each address
- `leaves-{timestamp}.json` - All merkle leaves

### 2. Start API Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Server will run on `http://localhost:3000`

### 3. Push Merkle Root to Contract

Create a campaign config file (`campaign-config.json`):
```json
{
  "merkleRoot": "0x...",
  "tokenContract": "0x50eDe9B383248648d446646BE0aB44927279d766",
  "isRunesToken": false,
  "tokenIds": ["1", "2"],
  "metadata": "{\"name\": \"Test Campaign\"}",
  "startTime": 1704067200,
  "endTime": 1704153600
}
```

Push to contract:
```bash
npm run push-root campaign-config.json
```

Or use command line arguments:
```bash
npm run push-root 0x123... 0x456... false "[1,2]" 1704067200 1704153600
```

## API Endpoints

### Health Check
```
GET /health
```

### Create Campaign (Admin)
```
POST /campaigns
Headers:
  X-API-Key: your-api-key
  Content-Type: application/json

Body:
{
  "merkleRoot": "0x...",
  "tokenContract": "0x...",
  "isRunesToken": false,
  "tokenIds": ["1", "2"],
  "metadata": "{}",
  "startTime": 1704067200,
  "endTime": 1704153600
}
```

### Get Proof
```
GET /proof/:campaignId/:address/:tokenId

Example:
GET /proof/0/0x1111111111111111111111111111111111111111/1
```

### Get Campaign Status
```
GET /status/:campaignId

Example:
GET /status/0
```

### Verify RUNES Token
```
POST /verify-runes
Content-Type: application/json

Body:
{
  "tokenAddress": "0x...",
  "runesId": "optional-runes-id"
}
```

### List All Campaigns
```
GET /campaigns
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode:
```bash
npm run test:watch
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Express API server
│   ├── storage.ts         # Campaign and claim storage
│   ├── runes-verification.ts  # RUNES token verification
│   └── types.ts           # TypeScript types
├── scripts/
│   ├── generate-merkle.ts # Merkle tree generation CLI
│   └── push-root.ts       # Push merkle root to contract
├── tests/
│   ├── merkle.test.ts     # Merkle generation tests
│   ├── storage.test.ts    # Storage tests
│   └── runes.test.ts      # RUNES verification tests
├── out/                   # Generated merkle files
├── data/                  # Persistent storage (campaigns, claims)
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `API_KEY` | API key for admin endpoints | Yes |
| `RPC_URL` | Rootstock RPC endpoint | Yes |
| `PRIVATE_KEY` | Private key for contract interactions | Yes |
| `AIRDROP_ENGINE_ADDRESS` | Deployed AirdropEngine address | Yes |
| `AIRDROP_TOKEN_ADDRESS` | Deployed AirdropToken address | No |
| `BRIDGE_API_KEY` | Rootstock Bridge API key | No |
| `BRIDGE_API_URL` | Bridge API endpoint | No |
| `USE_MOCK_RUNES_VERIFICATION` | Use mock RUNES verification | No (default: true) |

## RUNES Verification

The backend supports two modes for RUNES verification:

1. **Mock Mode** (default): Validates address format only. Set `USE_MOCK_RUNES_VERIFICATION=true`
2. **API Mode**: Queries Rootstock Bridge API. Requires `BRIDGE_API_KEY` and `BRIDGE_API_URL`

To use real Bridge API:
1. Get API key from Rootstock
2. Set `USE_MOCK_RUNES_VERIFICATION=false`
3. Set `BRIDGE_API_KEY` and `BRIDGE_API_URL`

## Example Workflow

1. **Prepare recipients list**:
   ```bash
   # Create recipients.csv with eligible addresses
   ```

2. **Generate Merkle tree**:
   ```bash
   npm run generate-merkle recipients.csv 0
   ```

3. **Start API server**:
   ```bash
   npm run dev
   ```

4. **Create campaign via API**:
   ```bash
   curl -X POST http://localhost:3000/campaigns \
     -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     -d @campaign-config.json
   ```

5. **Push merkle root to contract**:
   ```bash
   npm run push-root campaign-config.json
   ```

6. **Users can get their proofs**:
   ```bash
   curl http://localhost:3000/proof/0/0x1111111111111111111111111111111111111111/1
   ```

## License

MIT

