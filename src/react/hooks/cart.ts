import { GET_LOCAL_CHECKOUT } from "../../apollo/queries";
import {
  GetLocalCheckoutQuery,
  GetLocalCheckoutQueryVariables,
} from "../../apollo/types";
import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";
import { createTaxedPriceFromAmount } from "../utils/utils";

const defaultPrice = {
  __typename: "TaxedMoney",
  gross: {
    __typename: "Money",
    amount: 0,
    currency: "INR",
  },
  net: {
    __typename: "Money",
    amount: 0,
    currency: "INR",
  },
};

export const useCart = hookFactory("cart");

export const useCartState = () => {
  const { data } = hookStateFactory<
    GetLocalCheckoutQuery,
    GetLocalCheckoutQueryVariables
  >(GET_LOCAL_CHECKOUT);
  console.log("useCartState sdk 1000", data);
  if (!data) {
    throw new Error(
      "Cache query result is undefined. Invalid cache configuration."
    );
  }
  const cartState = {
    items: data?.localCheckout?.lines || [],
    totalPrice: data?.localCheckout?.totalPrice || defaultPrice,
    subtotalPrice: data?.localCheckout?.subtotalPrice || defaultPrice,
    shippingPrice: data?.localCheckout?.shippingPrice || defaultPrice,
    discount: data.localCheckout?.discount,
    mrp: data?.localCheckout?.totalPrice || defaultPrice,
    netPrice: data?.localCheckout?.totalPrice || defaultPrice,
    itemDiscount: data?.localCheckout?.totalPrice || defaultPrice,
    offerDiscount: data?.localCheckout?.totalPrice || defaultPrice,
    prepaidDiscount:
      createTaxedPriceFromAmount(
        data?.localCheckoutDiscounts?.prepaidDiscount
      ) || defaultPrice,
    cashbackDiscount:
      createTaxedPriceFromAmount(
        data?.localCheckoutDiscounts?.cashbackDiscount
      ) || defaultPrice,
    cashbackRecieve: data?.localCashback || { amount: 0, willAddOn: null },
  };
  console.log("cartState", cartState);
  return cartState;
};
