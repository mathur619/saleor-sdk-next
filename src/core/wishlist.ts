import { GraphQLError } from "graphql";
import { GET_WISHLIST, WISHLIST_ADD_VARIANT, WISHLIST_REMOVE_VARIANT, wishlistItemsVar } from "../apollo";
import { SaleorClientMethodsProps } from "./types";

export interface WishlistSDK {
  loaded?: boolean;

  items?: any;

  getWishlistItems?: (() => {}) | undefined;
  addVariantInWishlist?: (variantId: string) => Promise<{ data: any; wishlistErrors: any; errors: 
    readonly GraphQLError[] | undefined; } | undefined>;
  removeVariantFromWishlist?: (variantId: string) => Promise<{ data: any; wishlistErrors: any; errors: 
    readonly GraphQLError[] | undefined; } | undefined>;
}

export const wishlist = ({
  apolloClient: client,
}: SaleorClientMethodsProps): WishlistSDK => {

  let items = wishlistItemsVar();
  const addVariantInWishlist: WishlistSDK["addVariantInWishlist"] = async (variantId:string) => {
    if(variantId) {
      const res = await client.mutate<any,any>({
        mutation: WISHLIST_ADD_VARIANT,
        variables: {
          variantId,
        },
        update: (_,{data}) => {
          console.log('addVariantInWishlist',data)
        }
      });

      return {
        data: res?.data?.WishlistAddVariant?.wishlist,
        wishlistErrors:res?.data?.WishlistAddVariant?.errors,
        errors: res?.errors,
      }
    }
  }

  const removeVariantFromWishlist: WishlistSDK["removeVariantFromWishlist"] = async (variantId:string) => {
    if(variantId) {
      const res = await client.mutate<any,any>({
        mutation: WISHLIST_REMOVE_VARIANT,
        variables: {
          variantId,
        },
        update: (_,{data}) => {
          console.log('removeVariantFromWishlist',data)
        }
      });

      return {
        data: res?.data?.WishlistRemoveVariant?.wishlist,
        wishlistErrors:res?.data?.WishlistRemoveVariant?.errors,
        errors: res?.errors,
      }
    }
  };

  const getWishlistItems: WishlistSDK["getWishlistItems"] = async () => {
    const res = await client.query<any,any>({
      query: GET_WISHLIST,
    });

    return {
      data: res?.data?.Wishlist?.wishlist,
      wishlistErrors: res?.data?.Wishlist?.errors,
      error: res?.error,
      errors: res?.errors
    }
  }


  return {
    items,
    addVariantInWishlist,
    removeVariantFromWishlist,
    getWishlistItems
  }
}
