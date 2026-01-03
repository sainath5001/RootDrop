#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import { MerkleTree } from 'merkletreejs';
import { keccak256, solidityPacked } from 'ethers';

interface Recipient {
  address: string;
  tokenId: string | number;
  amount: string | number;
}

interface MerkleOutput {
  merkleRoot: string;
  totalRecipients: number;
  leaves: string[];
  proofs: Record<string, {
    proof: string[];
    tokenId: string;
    amount: string;
    leaf: string;
  }>;
}

/**
 * Generate Merkle tree from recipients data
 */
function generateMerkleTree(recipients: Recipient[], campaignId: number = 0): MerkleOutput {
  // Create leaves: keccak256(abi.encodePacked(campaignId, address, tokenId, amount))
  const leaves: string[] = [];
  const leafMap: Map<string, { tokenId: string; amount: string; address: string }> = new Map();

  for (const recipient of recipients) {
    const address = recipient.address.toLowerCase();
    const tokenId = recipient.tokenId.toString();
    const amount = recipient.amount.toString();

    // Create leaf: keccak256(abi.encodePacked(campaignId, address, tokenId, amount))
    const leaf = keccak256(
      solidityPacked(
        ['uint256', 'address', 'uint256', 'uint256'],
        [campaignId, address, tokenId, amount]
      )
    );

    leaves.push(leaf);
    leafMap.set(leaf, { tokenId, amount, address });
  }

  // Sort leaves for consistent tree structure (OpenZeppelin uses sorted pairs)
  leaves.sort();

  // Build Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = tree.getHexRoot();

  // Generate proofs for each recipient
  const proofs: Record<string, {
    proof: string[];
    tokenId: string;
    amount: string;
    leaf: string;
  }> = {};

  for (const recipient of recipients) {
    const address = recipient.address.toLowerCase();
    const tokenId = recipient.tokenId.toString();
    const amount = recipient.amount.toString();

    const leaf = keccak256(
      solidityPacked(
        ['uint256', 'address', 'uint256', 'uint256'],
        [campaignId, address, tokenId, amount]
      )
    );

    const proof = tree.getHexProof(leaf);
    proofs[address] = {
      proof,
      tokenId,
      amount,
      leaf
    };
  }

  return {
    merkleRoot,
    totalRecipients: recipients.length,
    leaves,
    proofs
  };
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): Recipient[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const addressIndex = headers.indexOf('address');
  const tokenIdIndex = headers.indexOf('tokenid') !== -1 ? headers.indexOf('tokenid') : headers.indexOf('token_id');
  const amountIndex = headers.indexOf('amount');

  if (addressIndex === -1 || tokenIdIndex === -1 || amountIndex === -1) {
    throw new Error('CSV must contain columns: address, tokenId (or token_id), amount');
  }

  const recipients: Recipient[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 3) {
      recipients.push({
        address: values[addressIndex],
        tokenId: values[tokenIdIndex],
        amount: values[amountIndex]
      });
    }
  }

  return recipients;
}

/**
 * Parse JSON file
 */
function parseJSON(filePath: string): Recipient[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of recipients');
  }

  return data.map(item => ({
    address: item.address || item.Address,
    tokenId: item.tokenId || item.token_id || item.TokenId,
    amount: item.amount || item.Amount
  }));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: ts-node generate-merkle.ts <input-file> [campaign-id]');
    console.error('  input-file: CSV or JSON file with recipients');
    console.error('  campaign-id: Optional campaign ID (default: 0)');
    process.exit(1);
  }

  const inputFile = args[0];
  const campaignId = args[1] ? parseInt(args[1], 10) : 0;

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log(`Reading recipients from: ${inputFile}`);
  console.log(`Campaign ID: ${campaignId}`);

  // Parse input file
  let recipients: Recipient[];
  const ext = path.extname(inputFile).toLowerCase();
  
  try {
    if (ext === '.csv') {
      recipients = parseCSV(inputFile);
    } else if (ext === '.json') {
      recipients = parseJSON(inputFile);
    } else {
      throw new Error('Unsupported file format. Use CSV or JSON.');
    }

    console.log(`Found ${recipients.length} recipients`);

    // Generate Merkle tree
    console.log('Generating Merkle tree...');
    const output = generateMerkleTree(recipients, campaignId);

    // Create output directory
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Save outputs
    const timestamp = Date.now();
    const merkleRootFile = path.join(outDir, `merkle-root-${timestamp}.json`);
    const proofsFile = path.join(outDir, `proofs-${timestamp}.json`);
    const leavesFile = path.join(outDir, `leaves-${timestamp}.json`);

    // Save merkle root and metadata
    fs.writeFileSync(
      merkleRootFile,
      JSON.stringify({
        campaignId,
        merkleRoot: output.merkleRoot,
        totalRecipients: output.totalRecipients,
        timestamp: new Date().toISOString()
      }, null, 2)
    );

    // Save proofs mapping
    fs.writeFileSync(
      proofsFile,
      JSON.stringify(output.proofs, null, 2)
    );

    // Save leaves (compact format)
    fs.writeFileSync(
      leavesFile,
      JSON.stringify({
        leaves: output.leaves,
        totalLeaves: output.leaves.length
      }, null, 2)
    );

    console.log('\n=== Merkle Tree Generated ===');
    console.log(`Merkle Root: ${output.merkleRoot}`);
    console.log(`Total Recipients: ${output.totalRecipients}`);
    console.log(`\nOutput files:`);
    console.log(`  - Merkle Root: ${merkleRootFile}`);
    console.log(`  - Proofs: ${proofsFile}`);
    console.log(`  - Leaves: ${leavesFile}`);
    console.log('\n✅ Success!');

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateMerkleTree, parseCSV, parseJSON, Recipient, MerkleOutput };

