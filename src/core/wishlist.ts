import {
  Product,
} from "./../apollo/types";

import { ApolloClient } from "@apollo/client";
import { SaleorClientMethodsProps } from ".";
import { WISHLIST_ADD_PRODUCT } from "../apollo";
export interface WishlistSDK {
  loaded?: boolean;

  items?: any;

  getWishlist?: () => {};
  addItemInWishlist?: (productId: string) => {};
  removeItemInWishlist?: () => {};
}

export const wishlist = ({
  apolloClient: client,
}: SaleorClientMethodsProps): WishlistSDK => {
  const addItemInWishlist: WishlistSDK["addItemInWishlist"] = async (
    productId: string
  ) => {
   return {};
  };
  return {
    addItemInWishlist,
  };
};
