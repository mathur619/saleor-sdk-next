import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION } from ".";
import { storage } from "../core/storage";
import {
  GET_DISCOUNT_CASHBACK_QUERY,
  GET_LOCAL_CHECKOUT,
  GET_LOCAL_WISHLIST,
} from "./queries";
import {
  CompleteCheckoutMutation,
  UpdateCheckoutShippingMethodMutation,
  UpdateCheckoutShippingMethodMutationVariables,
} from "./types";
import {
  DiscountsAndCashbackQuery,
  DiscountsAndCashbackQueryVariables,
} from "./types/DiscountsAndCashbackQuery";

export const setLocalCheckoutInCache = async (
  client: ApolloClient<NormalizedCacheObject>,
  checkout: any,
  fetchDiscount?: boolean,
  orderPlaced?: CompleteCheckoutMutation | null | undefined
) => {
  console.log("setLocalCheckoutInCache", checkout);
  client.writeQuery({
    query: GET_LOCAL_CHECKOUT,
    data: {
      localCheckout: checkout,
    },
  });

  if (orderPlaced) {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        recentOrder: orderPlaced.checkoutComplete?.order,
      },
    });
  }

  if (
    checkout &&
    Object.keys(checkout).length === 0 &&
    Object.getPrototypeOf(checkout) === Object.prototype
  ) {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        localCheckout: {
          items: [],
          totalPrice: 0,
          subtotalPrice: 0,
          shippingPrice: 0,
        },
        localCheckoutDiscounts: {
          prepaidDiscount: "0",
          couponDiscount: "0",
          cashbackDiscount: "0",
        },
        localCashback: {
          amount: "0",
          willAddOn: null,
        },
      },
    });
  } else if (fetchDiscount && checkout?.token) {
    if (checkout.availableShippingMethods[0]?.id) {
      const variables: UpdateCheckoutShippingMethodMutationVariables = {
        checkoutId: checkout?.id,
        shippingMethodId: checkout.availableShippingMethods[0]?.id,
      };

      try {
        const resShipping = await client.mutate<
          UpdateCheckoutShippingMethodMutation,
          UpdateCheckoutShippingMethodMutationVariables
        >({
          mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION,
          variables,
        });

        // if (
        //   resShipping.data?.checkoutShippingMethodUpdate?.errors &&
        //   resShipping.data?.checkoutShippingMethodUpdate?.errors[0]?.code ===
        //   "NOT_FOUND" &&
        //   resShipping.data?.checkoutShippingMethodUpdate?.errors[0]?.field ===
        //   "checkoutId" &&
        //   typeof window !== "undefined"
        // ) {
        //   window.localStorage?.clear();
        //   console.log("cart reload helper");
        //   window.location?.reload();
        //   return;
        // }

        const res = await client.query<
          DiscountsAndCashbackQuery,
          DiscountsAndCashbackQueryVariables
        >({
          query: GET_DISCOUNT_CASHBACK_QUERY,
          variables: {
            token: checkout?.token,
          },
          fetchPolicy: "network-only",
        });

        storage.setDiscounts(res.data);
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            localCheckout:
              resShipping.data?.checkoutShippingMethodUpdate?.checkout,
            localCheckoutDiscounts: res.data.checkoutDiscounts,
            localCashback: res.data.cashback,
          },
        });
      } catch (e) {
        console.log("error:", e)
      }
    } else {
      const res = await client.query<
        DiscountsAndCashbackQuery,
        DiscountsAndCashbackQueryVariables
      >({
        query: GET_DISCOUNT_CASHBACK_QUERY,
        variables: {
          token: checkout?.token,
        },
        fetchPolicy: "network-only",
      });

      storage.setDiscounts(res.data);
      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          localCheckout: checkout,
          localCheckoutDiscounts: res.data.checkoutDiscounts,
          localCashback: res.data.cashback,
        },
      });
    }
  }

  client.writeQuery({
    query: GET_LOCAL_CHECKOUT,
    data: {
      checkoutLoading: false,
    },
  });
};

export const setLocalWishlistInCache = async (
  client: ApolloClient<NormalizedCacheObject>,
  wishlist: any
) => {
  console.log("wishlist setLocalWishlistInCache", wishlist);
  client.writeQuery({
    query: GET_LOCAL_WISHLIST,
    data: {
      wishlist: wishlist,
    },
  });
};
