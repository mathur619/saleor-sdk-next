import {
  Product,
  WishlistAddProductMutation,
  WishlistAddProductMutationVariables,
} from "./../apollo/types";
import { storage } from "./storage";
import { ApolloClient } from "@apollo/client";
import { SaleorClientMethodsProps, WishlistAddProductResult } from ".";
import { WISHLIST_ADD_PRODUCT } from "../apollo";
export interface WishlistSDK {
  loaded?: boolean;

  items?: any;

  getWishlist?: () => {};
  addItemInWishlist?: (productId: string) => WishlistAddProductResult;
  removeItemInWishlist?: () => {};
}

export const wishlist = ({
  apolloClient: client,
}: SaleorClientMethodsProps): WishlistSDK => {
  const addItemInWishlist: WishlistSDK["addItemInWishlist"] = async (
    productId: string
  ) => {
    const res = await client.mutate<
      WishlistAddProductMutation,
      WishlistAddProductMutationVariables
    >({
      mutation: WISHLIST_ADD_PRODUCT,
      variables: {
        productId: productId,
      },
      update: (_, { data }) => {
        if (data?.wishlist) {
          storage.setWishlist(data?.wishlist);
        }
      },
    });
    return res;
  };
  return {
    addItemInWishlist,
  };
};
