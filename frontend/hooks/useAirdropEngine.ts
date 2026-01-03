import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AIRDROP_ENGINE_ADDRESS } from '@/contracts/addresses';
import AirdropEngineABI from '@/contracts/abis/AirdropEngine.json';

export function useCampaignCounter() {
  return useReadContract({
    address: AIRDROP_ENGINE_ADDRESS,
    abi: AirdropEngineABI,
    functionName: 'campaignCounter',
  });
}

export function useGetCampaign(campaignId: bigint) {
  return useReadContract({
    address: AIRDROP_ENGINE_ADDRESS,
    abi: AirdropEngineABI,
    functionName: 'getCampaign',
    args: [campaignId],
  });
}

export function useCreateCampaign() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const createCampaign = async (
    tokenContract: `0x${string}`,
    isRunesToken: boolean,
    tokenIds: bigint[],
    merkleRoot: `0x${string}`,
    metadata: string,
    startTime: bigint,
    endTime: bigint
  ) => {
    writeContract({
      address: AIRDROP_ENGINE_ADDRESS,
      abi: AirdropEngineABI,
      functionName: 'createCampaign',
      args: [tokenContract, isRunesToken, tokenIds, merkleRoot, metadata, startTime, endTime],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createCampaign,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const claim = async (
    campaignId: bigint,
    tokenId: bigint,
    amount: bigint,
    merkleProof: `0x${string}`[]
  ) => {
    writeContract({
      address: AIRDROP_ENGINE_ADDRESS,
      abi: AirdropEngineABI,
      functionName: 'claim',
      args: [campaignId, tokenId, amount, merkleProof],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useIsClaimed(campaignId: bigint, leafHash: `0x${string}`) {
  return useReadContract({
    address: AIRDROP_ENGINE_ADDRESS,
    abi: AirdropEngineABI,
    functionName: 'isClaimed',
    args: [campaignId, leafHash],
  });
}

