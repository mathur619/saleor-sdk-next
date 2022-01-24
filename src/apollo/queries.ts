import { gql } from "@apollo/client";
import { checkoutFragment, userFragment } from "./fragments";

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

export const USER_CHECKOUT = gql`
  ${checkoutFragment}
  query UserCheckoutDetails {
    checkout: me {
      id
      checkout {
        ...Checkout
      }
    }
  }
`;
