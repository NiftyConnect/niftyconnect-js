import { ethers } from 'ethers';
import { Erc20Abi } from '../abis';

export const buildContract = ({
  contractAddress,
  abi,
}: {
  contractAddress: string;
  abi: any;
}) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  return new ethers.Contract(contractAddress, abi, provider.getSigner());
};

export const getErc20Allowance = async ({
  address,
  contractAddress,
  tokenAddress,
}: {
  address: string;
  contractAddress: string;
  tokenAddress: string;
}) => {
  const erc20Contract = buildContract({
    contractAddress: tokenAddress,
    abi: Erc20Abi,
  });

  const allowance = await erc20Contract.allowance(address, contractAddress);
  return ethers.utils.formatUnits(allowance, 18);
};

export const approveAllowance = async ({
  contractAddress,
  tokenAddress,
}: {
  contractAddress: string;
  tokenAddress: string;
}) => {
  const erc20Contract = buildContract({
    contractAddress: tokenAddress,
    abi: Erc20Abi,
  });
  const tx = await erc20Contract.approve(
    contractAddress,
    ethers.constants.MaxUint256
  );
  return await tx.wait();
};

export const encodeFunctionAbi = (abi: any, func: string, params: any) => {
  const iface = new ethers.utils.Interface(abi);
  return iface.encodeFunctionData(func, params);
};
