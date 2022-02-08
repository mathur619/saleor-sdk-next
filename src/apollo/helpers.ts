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
  fetchDiscount?: boolean
) => {
  console.log("setLocalCheckoutInCache in helper");
  if (fetchDiscount) {
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
      },
    });
  }
  client.writeQuery({
    query: GET_LOCAL_CHECKOUT,
    data: {
      localCheckout: checkout,
    },
  });
};
