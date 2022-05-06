import { Moment } from 'moment';

export type NiftyConnectOrder = {
  orderHash: string;
  orderPrice: number;
  maker: string;
  taker: string;
  makerRelayerFeeRecipient: string;
  side: number;
  saleKind: number;
  nftAddress: string;
  tokenId: number;
  ipfsHash: string;
  calldata: string;
  replacementPattern: string;
  staticTarget: string;
  staticExtradata: string;
  paymentToken: string;
  extra: string;
  listingTime: number;
  expirationTime: number;
  salt: string;
  isCancelled: boolean;
  isFinalized: boolean;
  txHash: string;
  exchange: string;
};

export type NiftyOrderType = 'Normal' | 'Collection' | 'Trait';
export type Network = 'ETH';
export enum TokenStandard {
  erc1155 = 1,
  erc721 = 0,
}

export enum Side {
  Buy = 0,
  Sell = 1,
}

export enum SellType {
  FixedPrice = 0,
  TimedAuction = 1,
}

export type MakeOrderParams = {
  nftAddress: string;
  paymentToken: string;
  listPrice: string;
  listTime: Moment;
  expireTime: Moment;
  tokenId: string;
  side?: Side;
  saleKind?: SellType;
  tokenStandard: TokenStandard;
  amount: number | string;
  orderType?: NiftyOrderType;
  makerAddress: string;
  makerRelayerFeeRecipient?: string;
  chainId?: number;
};

export type CancelOrderParams = {
  order: NiftyConnectOrder;
  chainId?: number;
  account: string;
};

export type TakeOrderParams = {
  order: NiftyConnectOrder;
  chainId?: number;
  account: string;
  takeRelayerFeeRecipient?: string;
};
