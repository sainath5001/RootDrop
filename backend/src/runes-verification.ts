import axios from 'axios';

const BRIDGE_API_URL = process.env.BRIDGE_API_URL || 'https://api.rootstock.io/bridge/v1';
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;
const USE_MOCK = process.env.USE_MOCK_RUNES_VERIFICATION === 'true' || !BRIDGE_API_KEY;

interface RunesVerificationResult {
  isValid: boolean;
  tokenAddress: string;
  runesId?: string;
  bridgeInfo?: {
    bridgeAddress: string;
    originalChain: string;
    bridgedAt?: string;
  };
  error?: string;
}

/**
 * Mock RUNES verification (for testing without API key)
 */
async function mockVerifyRunes(tokenAddress: string, runesId?: string): Promise<RunesVerificationResult> {
  // Mock validation: check if address is a valid Ethereum address format
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenAddress);
  
  if (!isValidAddress) {
    return {
      isValid: false,
      tokenAddress,
      error: 'Invalid token address format'
    };
  }

  // Mock: accept any valid address as a bridged RUNES token
  // In production, this would query the actual bridge API
  return {
    isValid: true,
    tokenAddress,
    runesId: runesId || 'MOCK_RUNES_ID',
    bridgeInfo: {
      bridgeAddress: tokenAddress,
      originalChain: 'bitcoin',
      bridgedAt: new Date().toISOString()
    }
  };
}

/**
 * Verify RUNES token via Rootstock Bridge API
 */
async function verifyRunesAPI(tokenAddress: string, runesId?: string): Promise<RunesVerificationResult> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (BRIDGE_API_KEY) {
      headers['Authorization'] = `Bearer ${BRIDGE_API_KEY}`;
    }

    // Query bridge API for token information
    const response = await axios.get(
      `${BRIDGE_API_URL}/tokens/${tokenAddress}`,
      { headers, timeout: 10000 }
    );

    if (response.data && response.data.isBridged) {
      return {
        isValid: true,
        tokenAddress,
        runesId: response.data.runesId || runesId,
        bridgeInfo: {
          bridgeAddress: response.data.bridgeAddress || tokenAddress,
          originalChain: response.data.originalChain || 'bitcoin',
          bridgedAt: response.data.bridgedAt
        }
      };
    }

    return {
      isValid: false,
      tokenAddress,
      error: 'Token is not a bridged RUNES token'
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        isValid: false,
        tokenAddress,
        error: 'Token not found in bridge registry'
      };
    }

    return {
      isValid: false,
      tokenAddress,
      error: error.message || 'Bridge API error'
    };
  }
}

/**
 * Verify a RUNES token
 */
export async function verifyRunes(tokenAddress: string, runesId?: string): Promise<RunesVerificationResult> {
  if (USE_MOCK) {
    console.log('Using mock RUNES verification');
    return mockVerifyRunes(tokenAddress, runesId);
  }

  return verifyRunesAPI(tokenAddress, runesId);
}

export { RunesVerificationResult };

