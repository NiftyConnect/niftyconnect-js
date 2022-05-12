import BigNumber from 'bignumber.js';
import secureRandom from 'secure-random';
import { NiftyConnectExchangeAbi } from './abis';
import { contracts, ZERO_ADDRESS } from './constants';
import {
  CancelOrderParams,
  MakeOrderParams,
  SellType,
  Side,
  TakeOrderParams,
  TokenStandard,
} from './types';
import {
  approveAllowance,
  buildCalldata,
  buildContract,
  decodeCalldata,
  encodeFunctionAbi,
  getErc20Allowance,
  getMerkleValidatorSelector,
  getReplacementPattern,
  getReplacementPatternFromReplacementPattern,
} from './utils';

export const makeOrder = async (params: MakeOrderParams) => {
  const {
    nftAddress,
    paymentToken,
    listPrice,
    listTime,
    expireTime,
    tokenId,
    amount,
    side = Side.Sell,
    saleKind = SellType.FixedPrice,
    tokenStandard,
    makerAddress,
    makerRelayerFeeRecipient = ZERO_ADDRESS,
    orderType = 'Normal',
    chainId = 1,
  } = params;

  const addrs = [
    contracts.NiftyConnectExchange[chainId], // exchange
    makerAddress, // maker
    ZERO_ADDRESS, // taker
    makerRelayerFeeRecipient, // makerRelayerFeeRecipient
    nftAddress, // nftAddress
    ZERO_ADDRESS, // staticTarget
    paymentToken, // paymentToken
    side === Side.Buy ? ZERO_ADDRESS : makerAddress, //from
    side === Side.Buy ? makerAddress : ZERO_ADDRESS, // to
  ];

  const salt = `0x${secureRandom(32, { type: 'Buffer' }).toString('hex')}`;

  const merkleValidatorSelector = getMerkleValidatorSelector({
    tokenStandard: tokenStandard as TokenStandard,
    paymentToken: paymentToken,
  });

  const tokenIdHex = `0x${new BigNumber(tokenId)
    .toString(16)
    .padStart(64, '0')}`;

  const uints = [
    `0x${new BigNumber(listPrice as string).times(10 ** 18).toString(16)}`, // basePrice
    '0x00', // extra
    new BigNumber(listTime.unix()).toString(), // listingTime
    new BigNumber(expireTime.unix()).toString(), // expirationTime
    salt, // salt
    merkleValidatorSelector, // merkleValidatorSelector
    tokenIdHex, //tokenId
    amount, // amount
    0, // totalLeaf
  ];

  const replacementPattern = getReplacementPattern({
    side,
    orderType,
    tokenStandard,
  });

  const staticExtra: any = [];
  const merkleData = [
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  ];

  if (side === Side.Buy && paymentToken !== ZERO_ADDRESS) {
    const allowance = await getErc20Allowance({
      address: makerAddress,
      contractAddress: contracts.NiftyConnectTokenTransferProxy[chainId],
      tokenAddress: paymentToken,
    });

    if (Number(allowance) <= 0) {
      await approveAllowance({
        contractAddress: contracts.NiftyConnectTokenTransferProxy[chainId],
        tokenAddress: paymentToken,
      });
    }
  }

  const contract = buildContract({
    abi: NiftyConnectExchangeAbi,
    contractAddress: contracts.NiftyConnectExchange[chainId],
  });

  return await contract.makeOrder_(
    addrs,
    uints,
    side,
    saleKind,
    replacementPattern,
    staticExtra,
    merkleData
  );
};

export const cancelOrder = async ({
  order,
  chainId = 1,
  account,
}: CancelOrderParams) => {
  const {
    maker,
    taker,
    makerRelayerFeeRecipient,
    nftAddress,
    staticTarget,
    paymentToken,
    tokenId,
    listingTime,
    expirationTime,
    orderPrice,
    extra,
    salt,
    replacementPattern,
    saleKind,
    calldata,
    staticExtradata,
  } = order;

  const side = Number(order.side);
  const tokenStandard = calldata.startsWith('0x96809f9') ? 1 : 0;

  const decodedCalldata = decodeCalldata({
    tokenStandard,
    paymentToken,
    calldata,
  });

  const nftAmount = decodedCalldata?.amount?.toString() || 1;

  const addrs = [
    contracts.NiftyConnectExchange[chainId], // exchange
    maker, // maker
    taker, // taker
    makerRelayerFeeRecipient, // makerRelayerFeeRecipient
    nftAddress, // nftAddress
    staticTarget, // staticTarget
    paymentToken, // paymentToken
    side === Side.Buy ? ZERO_ADDRESS : account, //from
    side === Side.Buy ? account : ZERO_ADDRESS, // to
  ];

  const merkleValidatorSelector = getMerkleValidatorSelector({
    tokenStandard,
    paymentToken,
  });

  const uints = [
    orderPrice, // basePrice
    extra, // extra
    listingTime, // listingTime
    expirationTime, // expirationTime
    salt, // salt
    merkleValidatorSelector, // merkleValidatorSelector
    tokenId, //tokenId
    nftAmount, // amount
    0, // totalLeaf
  ];

  const contract = buildContract({
    abi: NiftyConnectExchangeAbi,
    contractAddress: contracts.NiftyConnectExchange[chainId],
  });

  return await contract.cancelOrder_(
    addrs,
    uints,
    side,
    saleKind,
    replacementPattern,
    staticExtradata,
    '0x'.padEnd(66, '0')
  );
};

export const takeOrder = async ({
  order,
  chainId = 1,
  account,
  takeRelayerFeeRecipient = ZERO_ADDRESS,
}: TakeOrderParams) => {
  const {
    maker,
    taker,
    makerRelayerFeeRecipient,
    nftAddress,
    staticTarget,
    paymentToken,
    listingTime,
    expirationTime,
    orderPrice,
    extra,
    salt,
    saleKind,
    tokenId,
    replacementPattern,
    calldata,
  } = order;

  const side = Number(order.side);
  const token_standard = calldata.startsWith('0x96809f9') ? 1 : 0;

  const decodedCalldata = decodeCalldata({
    tokenStandard: token_standard,
    paymentToken,
    calldata,
  });

  const nftAmount = decodedCalldata?.amount?.toString() || 1;

  if (paymentToken !== ZERO_ADDRESS) {
    const allowance = await getErc20Allowance({
      address: account as string,
      contractAddress: contracts.NiftyConnectTokenTransferProxy[chainId],
      tokenAddress: paymentToken,
    });

    if (Number(allowance) <= 0) {
      await approveAllowance({
        contractAddress: contracts.NiftyConnectTokenTransferProxy[chainId],
        tokenAddress: paymentToken,
      });
    }
  }

  const buyMaker = side === Side.Buy ? maker : account;
  const buyTaker = side === Side.Buy ? taker : maker;

  const sellMaker = side === Side.Buy ? account : maker;
  const sellTaker = side === Side.Buy ? maker : taker;

  const buyMakerRelayerFeeRecipient =
    side === Side.Buy ? makerRelayerFeeRecipient : '0x'.padEnd(42, '0');
  const buyTakerRealyerFeeRecipient =
    side === Side.Buy ? '0x'.padEnd(42, '0') : takeRelayerFeeRecipient;

  const sellMakerRelayerFeeRecipient =
    side === Side.Buy ? '0x'.padEnd(42, '0') : makerRelayerFeeRecipient;
  const sellTakerRelayerFeeRecipient =
    side === Side.Buy ? takeRelayerFeeRecipient : '0x'.padEnd(42, '0');

  const addrs = [
    // buy
    contracts.NiftyConnectExchange[chainId], // exchange
    buyMaker, // maker
    buyTaker, // taker
    buyMakerRelayerFeeRecipient, // makerRelayerFeeRecipient
    buyTakerRealyerFeeRecipient, // takerRelayerFeeRecipient
    nftAddress, // nftAddress
    staticTarget, // staticTarget
    paymentToken, // paymentToken

    //sell
    contracts.NiftyConnectExchange[chainId], // exchange
    sellMaker, // maker
    sellTaker, // taker
    sellMakerRelayerFeeRecipient, // makerRelayerFeeRecipient
    sellTakerRelayerFeeRecipient, // takerRelayerFeeRecipient
    nftAddress, // nftAddress
    staticTarget, // staticTarget
    paymentToken, // paymentToken
  ];

  const uints = [
    //buy
    orderPrice, // basePrice
    extra, // extra
    listingTime, // listingTime
    expirationTime, // expirationTime
    salt, // salt
    tokenId, //tokenId

    //sell
    orderPrice, // basePrice
    extra, // extra
    listingTime, // listingTime
    expirationTime, // expirationTime
    salt, // salt
    tokenId, //tokenId
  ];

  const sidesKindsHowToCalls = [Side.Buy, saleKind, Side.Sell, saleKind]; // sidesKindsHowToCalls,

  const sellCalldata =
    side === Side.Sell
      ? calldata
      : buildCalldata({
          tokenStandard: token_standard,
          paymentToken,
          from: account as string,
          to: maker,
          nftAddress,
          nftAmount,
          merkleRoot: '0x'.padEnd(66, '0'),
          tokenId,
        });

  const buyCalldata =
    side === Side.Buy
      ? calldata
      : buildCalldata({
          tokenStandard: token_standard,
          paymentToken,
          from: ZERO_ADDRESS,
          to: account as string,
          nftAddress,
          nftAmount,
          merkleRoot: '0x'.padEnd(66, '0'),
          tokenId,
        });

  const buyReplacePattern = getReplacementPatternFromReplacementPattern({
    tokenStandard: token_standard,
    side: Side.Buy,
    replacementPattern,
  });

  const sellReplacePattern = getReplacementPatternFromReplacementPattern({
    tokenStandard: token_standard,
    side: Side.Sell,
    replacementPattern,
  });

  const contract = buildContract({
    abi: NiftyConnectExchangeAbi,
    contractAddress: contracts.NiftyConnectExchange[chainId],
  });

  const data = encodeFunctionAbi(NiftyConnectExchangeAbi, 'takeOrder_', [
    addrs,
    uints,
    sidesKindsHowToCalls,
    buyCalldata,
    sellCalldata,
    buyReplacePattern, // bytes replacementPatternSell,
    sellReplacePattern, // bytes replacementPatternBuy,
    [], // bytes staticExtradataBuy
    [], // bytes staticExtradataSell
    '0x'.padEnd(66, '0'), // bytes32 rssMetadata
  ]);

  console.log(data);

  if (paymentToken === ZERO_ADDRESS) {
    return await contract.takeOrder_(
      addrs,
      uints,
      sidesKindsHowToCalls,
      buyCalldata,
      sellCalldata,
      buyReplacePattern, // bytes replacementPatternSell,
      sellReplacePattern, // bytes replacementPatternBuy,
      [], // bytes staticExtradataBuy
      [], // bytes staticExtradataSell
      '0x'.padEnd(66, '0'), // bytes32 rssMetadata
      { value: orderPrice }
    );
  } else {
    return await contract.takeOrder_(
      addrs,
      uints,
      sidesKindsHowToCalls,
      buyCalldata,
      sellCalldata,
      buyReplacePattern, // bytes replacementPatternSell,
      replacementPattern, // bytes replacementPatternBuy,
      [], // bytes staticExtradataBuy
      [], // bytes staticExtradataSell
      '0x'.padEnd(66, '0') // bytes32 rssMetadata
    );
  }
};
