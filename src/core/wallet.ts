import { SaleorClientMethodsProps } from "./types";

export interface WalletSDK {
  loaded?: any;

  getWalletAmount?: () => {};
}

export const wallet = ({
  apolloClient: client,
}: SaleorClientMethodsProps): WalletSDK => {
  return {};
};
