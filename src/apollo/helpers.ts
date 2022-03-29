import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { storage } from "../core/storage";
import { GET_DISCOUNT_CASHBACK_QUERY, GET_LOCAL_CHECKOUT } from "./queries";
import { CompleteCheckoutMutation } from "./types";
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
      checkoutLoading: false,
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
};
