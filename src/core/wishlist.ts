import {
  GET_WISHLIST,
  WISHLIST_ADD_PRODUCT,
  WISHLIST_REMOVE_PRODUCT,
} from "../apollo";
import { setLocalWishlistInCache } from "../apollo/helpers";
import { storage } from "./storage";
import { SaleorClientMethodsProps } from "./types";

export interface WishlistSDK {
  loaded?: boolean;

  items?: any;

  getWishlist?: () => {};
  addItemInWishlist?: (productId: string) => any;
  removeItemInWishlist?: (productId: string) => any;
}

export const wishlist = ({
  apolloClient: client,
}: SaleorClientMethodsProps): WishlistSDK => {
  const addItemInWishlist: WishlistSDK["addItemInWishlist"] = async (
    productId: string
  ) => {
    const res = await client.mutate<any, any>({
      mutation: WISHLIST_ADD_PRODUCT,
      variables: {
        productId: productId,
      },
      update: (_, { data }) => {
        if (data) {
          setLocalWishlistInCache(
            client,
            data?.wishlistAddProduct?.wishlist[0]?.wishlist
          );
          storage.setWishlist(data?.wishlistAddProduct?.wishlist[0]?.wishlist);
        }
      },
    });
    return res?.data?.wishlistAddProduct?.wishlist[0]?.wishlist;
  };

  const getWishlist: WishlistSDK["getWishlist"] = async () => {
    const res = await client.query({
      query: GET_WISHLIST,
      fetchPolicy: "no-cache",
    });
    if (res?.data?.wishlist) {
      await setLocalWishlistInCache(client, res?.data?.wishlist);
      storage.setWishlist(res?.data?.wishlist);
    }
    return res;
  };

  const removeItemInWishlist: WishlistSDK["removeItemInWishlist"] = async (
    productId: string
  ) => {
    const res = await client.mutate<any, any>({
      mutation: WISHLIST_REMOVE_PRODUCT,
      variables: {
        productId: productId,
      },
      update: (_, { data }) => {
        if (data) {
          setLocalWishlistInCache(
            client,
            data?.WishlistRemoveProduct?.wishlist[0]?.wishlist
          );
          storage.setWishlist(
            data?.WishlistRemoveProduct?.wishlist[0]?.wishlist
          );
        }
      },
    });
    return res?.data?.WishlistRemoveProduct?.wishlist[0]?.wishlist;
  };

  return {
    addItemInWishlist,
    getWishlist,
    removeItemInWishlist,
  };
};
