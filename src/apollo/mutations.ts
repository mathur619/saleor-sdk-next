import { gql } from "@apollo/client";

import {
  // accountErrorFragment,
  // addressFragment,
  checkoutErrorFragment,
  checkoutFragment,
  // userFragment,
} from "./fragments";

// export const LOGIN = gql`
//   ${accountErrorFragment}
//   ${userFragment}
//   mutation login($email: String!, $password: String!) {
//     tokenCreate(email: $email, password: $password) {
//       csrfToken
//       token
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const REGISTER = gql`
//   ${accountErrorFragment}
//   mutation register($input: AccountRegisterInput!) {
//     accountRegister(input: $input) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       requiresConfirmation
//     }
//   }
// `;

// export const REFRESH_TOKEN = gql`
//   ${accountErrorFragment}
//   mutation refreshToken($csrfToken: String!) {
//     tokenRefresh(csrfToken: $csrfToken) {
//       token
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// // separate mutation so the request payload is minimal when user is not needed
// // used for initial authentication
// export const REFRESH_TOKEN_WITH_USER = gql`
//   ${accountErrorFragment}
//   ${userFragment}
//   mutation refreshTokenWithUser($csrfToken: String!) {
//     tokenRefresh(csrfToken: $csrfToken) {
//       token
//       user {
//         ...UserFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const VERIFY_TOKEN = gql`
//   ${accountErrorFragment}
//   ${userFragment}
//   mutation verifyToken($token: String!) {
//     tokenVerify(token: $token) {
//       isValid
//       payload
//       user {
//         ...UserFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const EXTERNAL_AUTHENTICATION_URL = gql`
//   ${accountErrorFragment}
//   mutation externalAuthenticationUrl(
//     $pluginId: String = "mirumee.authentication.openidconnect"
//     $input: JSONString!
//   ) {
//     externalAuthenticationUrl(pluginId: $pluginId, input: $input) {
//       authenticationData
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const OBTAIN_EXTERNAL_ACCESS_TOKEN = gql`
//   ${accountErrorFragment}
//   ${userFragment}
//   mutation externalObtainAccessTokens(
//     $pluginId: String = "mirumee.authentication.openidconnect"
//     $input: JSONString!
//   ) {
//     externalObtainAccessTokens(pluginId: $pluginId, input: $input) {
//       token
//       csrfToken
//       user {
//         ...UserFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const EXTERNAL_REFRESH = gql`
//   ${accountErrorFragment}
//   mutation externalRefresh(
//     $pluginId: String = "mirumee.authentication.openidconnect"
//     $input: JSONString!
//   ) {
//     externalRefresh(pluginId: $pluginId, input: $input) {
//       token
//       csrfToken
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const EXTERNAL_REFRESH_WITH_USER = gql`
//   ${accountErrorFragment}
//   ${userFragment}
//   mutation externalRefreshWithUser(
//     $pluginId: String = "mirumee.authentication.openidconnect"
//     $input: JSONString!
//   ) {
//     externalRefresh(pluginId: $pluginId, input: $input) {
//       token
//       csrfToken
//       user {
//         ...UserFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const EXTERNAL_VERIFY_TOKEN = gql`
//   ${accountErrorFragment}
//   ${userFragment}
//   mutation externalVerify(
//     $pluginId: String = "mirumee.authentication.openidconnect"
//     $input: JSONString!
//   ) {
//     externalVerify(pluginId: $pluginId, input: $input) {
//       isValid
//       verifyData
//       user {
//         ...UserFragment
//         userPermissions {
//           code
//           name
//         }
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const EXTERNAL_LOGOUT = gql`
//   ${accountErrorFragment}
//   mutation externalLogout(
//     $pluginId: String = "mirumee.authentication.openidconnect"
//     $input: JSONString!
//   ) {
//     externalLogout(pluginId: $pluginId, input: $input) {
//       logoutData
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const CHANGE_USER_PASSWORD = gql`
//   ${accountErrorFragment}
//   mutation passwordChange($newPassword: String!, $oldPassword: String!) {
//     passwordChange(newPassword: $newPassword, oldPassword: $oldPassword) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const REQUEST_PASSWORD_RESET = gql`
//   ${accountErrorFragment}
//   mutation requestPasswordReset(
//     $email: String!
//     $redirectUrl: String!
//     $channel: String!
//   ) {
//     requestPasswordReset(
//       email: $email
//       redirectUrl: $redirectUrl
//       channel: $channel
//     ) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const SET_PASSWORD = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation setPassword($token: String!, $email: String!, $password: String!) {
//     setPassword(token: $token, email: $email, password: $password) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       token
//       csrfToken
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const REQUEST_EMAIL_CHANGE = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation requestEmailChange(
//     $channel: String!
//     $newEmail: String!
//     $password: String!
//     $redirectUrl: String!
//   ) {
//     requestEmailChange(
//       channel: $channel
//       newEmail: $newEmail
//       password: $password
//       redirectUrl: $redirectUrl
//     ) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const CONFIRM_EMAIL_CHANGE = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation confirmEmailChange($channel: String!, $token: String!) {
//     confirmEmailChange(channel: $channel, token: $token) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const REQUEST_DELETE_ACCOUNT = gql`
//   ${accountErrorFragment}
//   mutation accountRequestDeletion($channel: String!, $redirectUrl: String!) {
//     accountRequestDeletion(channel: $channel, redirectUrl: $redirectUrl) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

// export const DELETE_ACCOUNT = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation accountDelete($token: String!) {
//     accountDelete(token: $token) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const UPDATE_ACCOUNT = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation accountUpdate($input: AccountInput!) {
//     accountUpdate(input: $input) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const SET_ACCOUNT_DEFAULT_ADDRESS = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation setAccountDefaultAddress($id: ID!, $type: AddressTypeEnum!) {
//     accountSetDefaultAddress(id: $id, type: $type) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const DELETE_ACCOUNT_ADDRESS = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation deleteAccountAddress($addressId: ID!) {
//     accountAddressDelete(id: $addressId) {
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const CREATE_ACCOUNT_ADDRESS = gql`
//   ${addressFragment}
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation createAccountAddress($input: AddressInput!) {
//     accountAddressCreate(input: $input) {
//       address {
//         ...AddressFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const UPDATE_ACCOUNT_ADDRESS = gql`
//   ${addressFragment}
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation updateAccountAddress($input: AddressInput!, $id: ID!) {
//     accountAddressUpdate(input: $input, id: $id) {
//       address {
//         ...AddressFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//       user {
//         ...UserFragment
//       }
//     }
//   }
// `;

// export const CONFIRM_ACCOUNT = gql`
//   ${userFragment}
//   ${accountErrorFragment}
//   mutation accountConfirm($email: String!, $token: String!) {
//     confirmAccount(email: $email, token: $token) {
//       user {
//         ...UserFragment
//       }
//       accountErrors {
//         ...AccountErrorFragment
//       }
//     }
//   }
// `;

export const UPDATE_CHECKOUT_LINE_MUTATION = gql`
  ${checkoutFragment}
  ${checkoutErrorFragment}
  mutation UpdateCheckoutLine($checkoutId: ID!, $lines: [CheckoutLineInput]!) {
    checkoutLinesUpdate(checkoutId: $checkoutId, lines: $lines) {
      checkout {
        ...Checkout
      }
      errors: checkoutErrors {
        ...CheckoutError
      }
    }
  }
`;

export const CREATE_CHECKOUT_MUTATION = gql`
  ${checkoutFragment}
  ${checkoutErrorFragment}
  mutation CreateCheckout($checkoutInput: CheckoutCreateInput!) {
    checkoutCreate(input: $checkoutInput) {
      errors: checkoutErrors {
        ...CheckoutError
      }
      checkout {
        ...Checkout
      }
    }
  }
`;

export const ADD_CHECKOUT_LINE_MUTATION = gql`
  ${checkoutFragment}
  ${checkoutErrorFragment}
  mutation AddCheckoutLine($checkoutId: ID!, $lines: [CheckoutLineInput]!) {
    checkoutLinesAdd(checkoutId: $checkoutId, lines: $lines) {
      checkout {
        ...Checkout
      }
      errors: checkoutErrors {
        ...CheckoutError
      }
    }
  }
`;
