import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT, wishlistVar } from ".";
import { storage } from "../core/storage";
import {
  CHECKOUT_DETAILS_NEXT,
  GET_DISCOUNT_CASHBACK_QUERY,
  GET_LOCAL_CHECKOUT,
  GET_WISHLIST,
} from "./queries";
import {
  CheckoutDetailsNextQuery,
  CheckoutDetailsNextQueryVariables,
  CompleteCheckoutMutation,
  UpdateCheckoutShippingMethodNextMutation,
  UpdateCheckoutShippingMethodNextMutationVariables,
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
      const variables: UpdateCheckoutShippingMethodNextMutationVariables = {
        checkoutId: checkout?.id,
        shippingMethodId: checkout.availableShippingMethods[0]?.id,
      };

      try {
        const resShipping = await client.mutate<
          UpdateCheckoutShippingMethodNextMutation,
          UpdateCheckoutShippingMethodNextMutationVariables
        >({
          mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
          variables,
        });

        if (
          resShipping.data?.checkoutShippingMethodUpdate?.errors &&
          resShipping.data?.checkoutShippingMethodUpdate?.errors[0]?.code ===
            "NOT_FOUND" &&
          resShipping.data?.checkoutShippingMethodUpdate?.errors[0]?.field ===
            "checkoutId" &&
          typeof window !== "undefined"
        ) {
          window.localStorage?.clear();
          window.location?.reload();
          return;
        }

        if (!resShipping.data?.checkoutShippingMethodUpdate?.checkout?.id) {
          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              checkoutLoading: false,
            },
          });
          return;
        }

        // const res = await client.query<
        //   DiscountsAndCashbackQuery,
        //   DiscountsAndCashbackQueryVariables
        // >({
        //   query: GET_DISCOUNT_CASHBACK_QUERY,
        //   variables: {
        //     token: checkout?.token,
        //   },
        //   fetchPolicy: "network-only",
        // });

        const res = {
          data: {
            checkoutDiscounts: {
              __typename: "DiscountsType",
              prepaidDiscount:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout
                  ?.paymentMethod?.prepaidDiscountAmount,
              couponDiscount:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout
                  ?.paymentMethod?.couponDiscount,
              cashbackDiscount:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout
                  ?.paymentMethod?.cashbackDiscountAmount,
            },
            cashback:
              resShipping.data?.checkoutShippingMethodUpdate?.checkout
                ?.cashback,
          },
        };

        storage.setCheckout(
          resShipping.data?.checkoutShippingMethodUpdate?.checkout
        );
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
      } catch {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });
        return;
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

export const getLatestCheckout = async (
  client: ApolloClient<NormalizedCacheObject>,
  checkout: any
) => {
  const checkoutDetailRes = await client.query<
    CheckoutDetailsNextQuery,
    CheckoutDetailsNextQueryVariables
  >({
    query: CHECKOUT_DETAILS_NEXT,
    variables: {
      token: checkout?.token,
    },
    fetchPolicy: "no-cache",
  });

  if (checkoutDetailRes?.data?.checkout?.id) {
    storage.setCheckout(checkoutDetailRes?.data?.checkout);
    const res = {
      data: {
        checkoutDiscounts: {
          __typename: "DiscountsType",
          prepaidDiscount:
            checkoutDetailRes?.data?.checkout?.paymentMethod
              ?.prepaidDiscountAmount,
          couponDiscount:
            checkoutDetailRes?.data?.checkout?.paymentMethod?.couponDiscount,
          cashbackDiscount:
            checkoutDetailRes?.data?.checkout?.paymentMethod
              ?.cashbackDiscountAmount,
        },
        cashback: checkoutDetailRes?.data?.checkout?.cashback,
      },
    };

    storage.setDiscounts(res.data);

    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        localCheckout: checkoutDetailRes?.data?.checkout,
        localCheckoutDiscounts: res.data.checkoutDiscounts,
        localCashback: res.data.cashback,
      },
    });
  }
  // @ts-ignore
  var returnObject = {
    data: checkoutDetailRes?.data?.checkout,
    errors: checkoutDetailRes?.errors,
  };

  return returnObject;
};

export const setLocalWishlistInCache = async (
  client: ApolloClient<NormalizedCacheObject>,
  wishlist: any
) => {
  wishlistVar(wishlist);
  client.writeQuery({
    query: GET_WISHLIST,
    data: {
      wishlist: wishlist,
    },
  });
};
