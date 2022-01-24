import { USER_CHECKOUT } from "../../apollo/queries";
import {
  UserCheckoutDetailsQuery,
  UserCheckoutDetailsQueryVariables,
} from "../../apollo/types";
import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

export const useCart = hookFactory("cart");

export const useCartState = (): UserCheckoutDetailsQuery => {
  const { data } = hookStateFactory<
    UserCheckoutDetailsQuery,
    UserCheckoutDetailsQueryVariables
  >(USER_CHECKOUT);

  if (!data) {
    throw new Error(
      "Cache query result is undefined. Invalid cache configuration."
    );
  }

  return data;
};
