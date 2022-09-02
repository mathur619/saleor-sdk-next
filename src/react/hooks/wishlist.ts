import {
  // GetLocalWishlistQuery,
  // GetLocalWishlistQueryVariables,
  GET_LOCAL_WISHLIST,
} from "../../apollo";

import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

export const useWishlist = hookFactory("wishlist");

export const useWishlistState = () => {
  try {
    const res = hookStateFactory<
      // GetLocalWishlistQuery,
      // GetLocalWishlistQueryVariables
      any,
      any
    >(GET_LOCAL_WISHLIST);
    console.log("useWishlistState res", res);

    const { data } = res;

    const resData = res?.client.readQuery({
      query: GET_LOCAL_WISHLIST,
    });

    console.log("resData readQuery", resData);
    return {
      wishlist: data?.localWishlist || {},
      items: data?.localWishlist?.items?.edges || [],
    };
  } catch (e) {
    console.log("errorrrrrrrrrr", e);
  }

  return {};
};
