# Rootstock ERC-1155 Airdrop Engine

A complete Foundry-based smart contract project for Rootstock that implements an ERC-1155 airdrop engine with Merkle-proof claims, batch distribution, and RUNES token support.

## Features

- **ERC-1155 Token Support**: Full ERC-1155 token contract with minting and batch minting capabilities
- **Merkle Proof Claims**: Secure, gas-efficient eligibility verification using Merkle proofs
- **Batch Distribution**: Admin-controlled batch airdrop functionality for off-chain distribution fallback
- **RUNES Token Support**: Integration with bridged RUNES tokens from Bitcoin
- **Campaign Management**: Create and manage multiple airdrop campaigns with flexible parameters
- **Gas Optimized**: Efficient batch operations and packed storage where possible
- **Access Control**: Role-based access control using OpenZeppelin's AccessControl

## Project Structure

```
contracts/
├── src/
│   ├── AirdropToken.sol          # ERC-1155 token contract
│   ├── AirdropEngine.sol          # Main airdrop engine contract
│   ├── interfaces/
│   │   └── IRUNESToken.sol        # RUNES token interface
│   └── mocks/
│       └── MockRUNESToken.sol     # Mock RUNES token for testing
├── test/
│   ├── AirdropEngine.t.sol        # Comprehensive engine tests
│   └── AirdropToken.t.sol         # Token contract tests
├── script/
│   └── Deploy.s.sol               # Deployment script
└── foundry.toml                   # Foundry configuration
```

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (forge, cast, anvil)
- Solidity ^0.8.19
- OpenZeppelin Contracts v5 (installed as dependency)

## Installation

1. Clone the repository and navigate to the contracts directory:
```bash
cd contracts
```

2. Install dependencies (if not already installed):
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

3. Build the project:
```bash
forge build
```

## Testing

Run all tests:
```bash
forge test
```

Run tests with gas reporting:
```bash
forge test --gas-report
```

Run specific test file:
```bash
forge test --match-path test/AirdropEngine.t.sol
```

Run tests with verbose output:
```bash
forge test -vvv
```

## Deployment

### Environment Setup

Create a `.env` file in the `contracts` directory:
```bash
PRIVATE_KEY=your_private_key_here
RPC_URL=https://public-node.testnet.rsk.co
```

### Deploy to Rootstock Testnet

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### Deploy to Rootstock Mainnet

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://public-node.rsk.co \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## Usage

### 1. Deploy Contracts

Deploy `AirdropToken` and `AirdropEngine` using the deployment script.

### 2. Create a Campaign

```solidity
// For ERC-1155 campaign
uint256[] memory tokenIds = new uint256[](2);
tokenIds[0] = 1;
tokenIds[1] = 2;

bytes32 merkleRoot = 0x...; // Generated off-chain
string memory metadata = '{"name": "Campaign Name"}';
uint256 startTime = block.timestamp;
uint256 endTime = block.timestamp + 30 days;

uint256 campaignId = engine.createCampaign(
    address(token),
    false, // isRunesToken
    tokenIds,
    merkleRoot,
    metadata,
    startTime,
    endTime
);

// For RUNES campaign
uint256[] memory emptyTokenIds = new uint256[](0);
uint256 campaignId = engine.createCampaign(
    address(runesToken),
    true, // isRunesToken
    emptyTokenIds,
    merkleRoot,
    metadata,
    startTime,
    endTime
);
```

### 3. Generate Merkle Tree (Off-chain)

The merkle tree should be generated off-chain. Each leaf is computed as:
```solidity
keccak256(abi.encodePacked(campaignId, userAddress, tokenId, amount))
```

**Example Python script for merkle tree generation:**
```python
from merkletools import MerkleTools
import hashlib

mt = MerkleTools(hash_type="sha3_256")

# For each eligible user
campaign_id = 0
user_address = "0x..."
token_id = 1
amount = 100

# Create leaf
leaf = hashlib.sha3_256(
    abi.encode_packed(campaign_id, user_address, token_id, amount)
).hexdigest()

mt.add_leaf(leaf, do_hash=False)
mt.make_tree()

# Get merkle root
merkle_root = mt.get_merkle_root()

# Get proof for a specific leaf
proof = mt.get_proof(leaf_index)
```

**JavaScript example using merkletreejs:**
```javascript
const { MerkleTree } = require('merkletreejs');
const { keccak256 } = require('ethers').utils;

const leaves = eligibleUsers.map(user => 
  keccak256(
    ethers.utils.solidityPack(
      ['uint256', 'address', 'uint256', 'uint256'],
      [campaignId, user.address, user.tokenId, user.amount]
    )
  )
);

const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const root = tree.getHexRoot();

// Get proof for user
const leaf = keccak256(
  ethers.utils.solidityPack(
    ['uint256', 'address', 'uint256', 'uint256'],
    [campaignId, user.address, user.tokenId, user.amount]
  )
);
const proof = tree.getHexProof(leaf);
```

### 4. Fund the Engine

Before users can claim, transfer tokens to the `AirdropEngine` contract:

```solidity
// For ERC-1155
token.safeTransferFrom(
    msg.sender,
    address(engine),
    tokenId,
    amount,
    ""
);

// For RUNES
runesToken.transfer(address(engine), amount);
```

### 5. User Claims

Users can claim their tokens using the merkle proof:

```solidity
engine.claim(
    campaignId,
    tokenId, // For ERC-1155: actual token ID, For RUNES: 0
    amount,
    merkleProof
);
```

### 6. Batch Airdrop (Admin Only)

As a fallback, admins can batch distribute tokens:

```solidity
address[] memory recipients = new address[](3);
recipients[0] = address(0x1);
recipients[1] = address(0x2);
recipients[2] = address(0x3);

uint256[] memory tokenIds = new uint256[](3);
tokenIds[0] = 1;
tokenIds[1] = 1;
tokenIds[2] = 2;

uint256[] memory amounts = new uint256[](3);
amounts[0] = 100;
amounts[1] = 200;
amounts[2] = 150;

engine.batchAirdrop(campaignId, recipients, tokenIds, amounts);
```

## Merkle Tree Format

The merkle tree uses the following leaf format:

```
leaf = keccak256(abi.encodePacked(campaignId, userAddress, tokenId, amount))
```

Where:
- `campaignId`: The campaign ID (uint256)
- `userAddress`: The eligible user's address (address)
- `tokenId`: The token ID to claim (uint256). For RUNES tokens, use `0`
- `amount`: The amount of tokens to claim (uint256)

The merkle root is stored in the campaign and used to verify claims on-chain.

## Gas Optimization

The contracts include several gas optimizations:

1. **Packed Storage**: Campaign struct uses efficient storage layout
2. **Batch Operations**: `batchMintToMany` and `batchAirdrop` reduce gas costs
3. **Unchecked Arithmetic**: Safe unchecked increments in loops
4. **Efficient Merkle Verification**: Uses OpenZeppelin's optimized MerkleProof library

## Security Considerations

- **Access Control**: Only admins can create campaigns and operators can batch airdrop
- **Double-Claim Prevention**: Each leaf can only be claimed once
- **Time Validation**: Campaigns have start and end times
- **Merkle Proof Verification**: All claims are verified against the merkle root
- **Token Validation**: Token IDs are validated against campaign configuration

## Events

### CampaignCreated
Emitted when a new campaign is created:
```solidity
event CampaignCreated(
    uint256 indexed campaignId,
    address indexed tokenContract,
    bool isRunesToken,
    uint256[] tokenIds,
    bytes32 merkleRoot,
    uint256 startTime,
    uint256 endTime,
    string metadata
);
```

### Claimed
Emitted when a user successfully claims tokens:
```solidity
event Claimed(
    uint256 indexed campaignId,
    address indexed claimant,
    uint256 tokenId,
    uint256 amount,
    bytes32 leafHash
);
```

### BatchDistributed
Emitted when admin performs batch airdrop:
```solidity
event BatchDistributed(
    uint256 indexed campaignId,
    address[] recipients,
    uint256[] tokenIds,
    uint256[] amounts
);
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions, please open an issue on the repository.
