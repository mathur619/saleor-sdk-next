import {
  GetLocalWishlistQuery,
  GetLocalWishlistQueryVariables,
  GET_LOCAL_WISHLIST,
} from "../../apollo";

import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

export const useWishlist = hookFactory("wishlist");

export const useWishlistState = () => {
  const res = hookStateFactory<
    GetLocalWishlistQuery,
    GetLocalWishlistQueryVariables
  >(GET_LOCAL_WISHLIST);
  console.log("useWishlistState res", res);

  return res.data?.localWishlist?.items?.edges;
};
