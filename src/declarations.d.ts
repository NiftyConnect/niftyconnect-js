/* eslint-disable import/no-default-export */

declare interface Window {
  BinanceChain?: {
    switchNetwork: (string) => Promise<any>;
  };
  ethereum?: {
    autoRefreshOnNetworkChange: boolean;
    chainId: string;
    request: ({ method: string, params: any }) => Promise<any>;
    on: (name: string, callback: () => void) => void;
  };
}
