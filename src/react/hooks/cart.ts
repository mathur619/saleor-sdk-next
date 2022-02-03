import { GET_LOCAL_CHECKOUT } from "../../apollo/queries";
import {
  GetLocalCheckoutQuery,
  GetLocalCheckoutQueryVariables,
} from "../../apollo/types";
import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

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
    items: data?.localCheckout?.lines,
    totalPrice: data?.localCheckout?.totalPrice,
    subtotalPrice: data?.localCheckout?.subtotalPrice,
    shippingPrice: data?.localCheckout?.shippingPrice,
  };
  return cartState;
};
