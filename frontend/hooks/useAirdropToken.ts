import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { AIRDROP_TOKEN_ADDRESS } from '@/contracts/addresses';
import AirdropTokenABI from '@/contracts/abis/AirdropToken.json';

export function useTokenBalance(tokenId: bigint) {
  const { address } = useAccount();
  
  return useReadContract({
    address: AIRDROP_TOKEN_ADDRESS,
    abi: AirdropTokenABI,
    functionName: 'balanceOf',
    args: address ? [address, tokenId] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useTokenURI(tokenId: bigint) {
  return useReadContract({
    address: AIRDROP_TOKEN_ADDRESS,
    abi: AirdropTokenABI,
    functionName: 'uri',
    args: [tokenId],
  });
}

