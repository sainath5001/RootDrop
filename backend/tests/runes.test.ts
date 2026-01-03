import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyRunes } from '../src/runes-verification';

describe('RUNES Verification', () => {
  beforeEach(() => {
    // Set mock mode
    process.env.USE_MOCK_RUNES_VERIFICATION = 'true';
  });

  it('should verify valid address in mock mode', async () => {
    const result = await verifyRunes('0x1234567890123456789012345678901234567890');
    
    expect(result.isValid).toBe(true);
    expect(result.tokenAddress).toBe('0x1234567890123456789012345678901234567890');
  });

  it('should reject invalid address format', async () => {
    const result = await verifyRunes('invalid-address');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle missing address', async () => {
    const result = await verifyRunes('');
    
    expect(result.isValid).toBe(false);
  });
});

