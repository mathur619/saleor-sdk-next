import { useReactiveVar } from "@apollo/client";
import { GET_WISHLIST, wishlistVar } from "../../apollo";
import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

export const useWishlist = hookFactory("wishlist");

export const useWishlistState = () => {
  try {
    const res = hookStateFactory<any, any>(GET_WISHLIST);

    const wishlistRes = useReactiveVar(wishlistVar);

    return {
      wishlist: wishlistRes || {} || res?.data,
      items: wishlistRes?.items?.edges || [],
    };
  } catch (e) {
    console.log("errorrrrrrrrrr", e);
  }

  return {};
};
