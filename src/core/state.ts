import { CHECKOUT_DETAILS, USER } from "../apollo/queries";
import { CheckoutDetailsQuery, UserDetailsQuery } from "../apollo/types";
import { storage } from "./storage";
import { SaleorClientInternals } from "./types";

export type State = UserDetailsQuery | null;
export type CheckoutState = CheckoutDetailsQuery | null;

export const getState = (
  client: SaleorClientInternals["apolloClient"]
): State =>
  client.readQuery<UserDetailsQuery>({
    query: USER,
  });

export const getCheckout = (
  client: SaleorClientInternals["apolloClient"]
): CheckoutState =>
  client.readQuery<CheckoutDetailsQuery>({
    query: CHECKOUT_DETAILS,
  });

export const getToken = () => storage.getAccessToken();
