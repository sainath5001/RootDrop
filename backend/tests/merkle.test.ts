import { describe, it, expect } from 'vitest';
import { generateMerkleTree, parseCSV, parseJSON, Recipient } from '../scripts/generate-merkle';
import { keccak256, solidityPacked } from 'ethers';
import { MerkleTree } from 'merkletreejs';

describe('Merkle Tree Generation', () => {
  const sampleRecipients: Recipient[] = [
    { address: '0x1111111111111111111111111111111111111111', tokenId: '1', amount: '100' },
    { address: '0x2222222222222222222222222222222222222222', tokenId: '1', amount: '200' },
    { address: '0x3333333333333333333333333333333333333333', tokenId: '2', amount: '150' }
  ];

  it('should generate a valid merkle tree', () => {
    const result = generateMerkleTree(sampleRecipients, 0);
    
    expect(result.merkleRoot).toBeDefined();
    expect(result.merkleRoot).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(result.totalRecipients).toBe(3);
    expect(result.leaves.length).toBe(3);
    expect(Object.keys(result.proofs).length).toBe(3);
  });

  it('should generate correct leaves', () => {
    const result = generateMerkleTree(sampleRecipients, 0);
    
    // Verify first recipient's leaf
    const firstRecipient = sampleRecipients[0];
    const expectedLeaf = keccak256(
      solidityPacked(
        ['uint256', 'address', 'uint256', 'uint256'],
        [0, firstRecipient.address.toLowerCase(), firstRecipient.tokenId, firstRecipient.amount]
      )
    );
    
    expect(result.proofs[firstRecipient.address.toLowerCase()].leaf).toBe(expectedLeaf);
  });

  it('should generate valid proofs', () => {
    const result = generateMerkleTree(sampleRecipients, 0);
    
    // Verify proof for first recipient
    const firstRecipient = sampleRecipients[0];
    const proofData = result.proofs[firstRecipient.address.toLowerCase()];
    
    expect(proofData.proof).toBeDefined();
    expect(Array.isArray(proofData.proof)).toBe(true);
    expect(proofData.tokenId).toBe(firstRecipient.tokenId);
    expect(proofData.amount).toBe(firstRecipient.amount);
  });

  it('should verify proofs against merkle root', () => {
    const result = generateMerkleTree(sampleRecipients, 0);
    const tree = new MerkleTree(result.leaves, keccak256, { sortPairs: true });
    
    // Verify each proof
    for (const recipient of sampleRecipients) {
      const address = recipient.address.toLowerCase();
      const proofData = result.proofs[address];
      const isValid = tree.verify(proofData.proof, proofData.leaf, result.merkleRoot);
      expect(isValid).toBe(true);
    }
  });

  it('should handle different campaign IDs', () => {
    const result1 = generateMerkleTree(sampleRecipients, 0);
    const result2 = generateMerkleTree(sampleRecipients, 1);
    
    // Different campaign IDs should produce different roots
    expect(result1.merkleRoot).not.toBe(result2.merkleRoot);
  });

  it('should parse CSV correctly', () => {
    const csvContent = `address,tokenId,amount
0x1111111111111111111111111111111111111111,1,100
0x2222222222222222222222222222222222222222,2,200`;

    // Create temporary file
    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(__dirname, 'temp-test.csv');
    fs.writeFileSync(tempFile, csvContent);

    try {
      const recipients = parseCSV(tempFile);
      expect(recipients.length).toBe(2);
      expect(recipients[0].address).toBe('0x1111111111111111111111111111111111111111');
      expect(recipients[0].tokenId).toBe('1');
      expect(recipients[0].amount).toBe('100');
    } finally {
      fs.unlinkSync(tempFile);
    }
  });

  it('should parse JSON correctly', () => {
    const jsonContent = [
      { address: '0x1111111111111111111111111111111111111111', tokenId: '1', amount: '100' },
      { address: '0x2222222222222222222222222222222222222222', tokenId: '2', amount: '200' }
    ];

    const fs = require('fs');
    const path = require('path');
    const tempFile = path.join(__dirname, 'temp-test.json');
    fs.writeFileSync(tempFile, JSON.stringify(jsonContent));

    try {
      const recipients = parseJSON(tempFile);
      expect(recipients.length).toBe(2);
      expect(recipients[0].address).toBe('0x1111111111111111111111111111111111111111');
    } finally {
      fs.unlinkSync(tempFile);
    }
  });
});

