import { gql } from "@apollo/client";
import {
  checkoutFragment,
  checkoutLineFragment,
  userFragment,
} from "./fragments";

export const USER = gql`
  ${userFragment}
  query UserDetails {
    user: me {
      ...UserFragment
    }
    authenticated @client
    authenticating @client
  }
`;

export const CHECKOUT_DETAILS = gql`
  ${checkoutFragment}
  query CheckoutDetails($token: UUID) {
    checkout(token: $token) {
      ...Checkout
    }
    checkoutUpdated @client
  }
`;

export const GET_CART_ITEMS = gql`
  ${checkoutLineFragment}
  query GetCartItems {
    cartItems @client {
      ...CheckoutLine
    }
  }
`;
export const GET_LOCAL_CHECKOUT = gql`
  ${checkoutFragment}
  query GetLocalCheckout {
    localCheckout @client {
      ...Checkout
    }

    localCheckoutDiscounts @client {
      prepaidDiscount
      couponDiscount
      cashbackDiscount
    }
    localCashback @client {
      amount
      willAddOn
    }
    useCashback @client
    checkoutLoading @client
  }
`;

export const GET_DISCOUNT_CASHBACK_QUERY = gql`
  query DiscountsAndCashbackQuery($token: UUID!) {
    checkoutDiscounts(token: $token) {
      prepaidDiscount
      couponDiscount
      cashbackDiscount
    }
    cashback(checkoutToken: $token) {
      amount
      willAddOn
    }
  }
`;

export const USER_CHECKOUT_DETAILS = gql`
  ${checkoutFragment}
  query UserCheckoutDetails {
    me {
      id
      checkout {
        ...Checkout
      }
    }
  }
`;

export const GET_CITY_STATE_FROM_PINCODE = gql`
  query Pincode($pin: String) {
    pincode(pin: $pin) {
      city
      state
      serviceable
    }
  }
`;
