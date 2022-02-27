import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { storage } from "../core/storage";
import { GET_DISCOUNT_CASHBACK_QUERY, GET_LOCAL_CHECKOUT } from "./queries";
import {
  DiscountsAndCashbackQuery,
  DiscountsAndCashbackQueryVariables,
} from "./types/DiscountsAndCashbackQuery";

export const setLocalCheckoutInCache = async (
  client: ApolloClient<NormalizedCacheObject>,
  checkout: any,
  fetchDiscount?: boolean,
  useCashback?: boolean
) => {
  client.writeQuery({
    query: GET_LOCAL_CHECKOUT,
    data: {
      localCheckout: checkout,
      useCashback,
    },
  });

  if (
    checkout &&
    Object.keys(checkout).length === 0 &&
    Object.getPrototypeOf(checkout) === Object.prototype
  ) {
    console.log(
      "checkout empty yes",
      Object.getPrototypeOf(checkout),
      Object.prototype
    );
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
        useCashback,
      },
    });
  } else if (fetchDiscount) {
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
    console.log("DiscountsAndCashbackQuery", res);
    storage.setDiscounts(res.data);
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        localCheckout: checkout,
        localCheckoutDiscounts: res.data.checkoutDiscounts,
        localCashback: res.data.cashback,
        useCashback,
      },
    });
  }
};
