import {
  ApolloClient,
  FetchResult,
  NormalizedCacheObject,
} from "@apollo/client";
import {
  AccountRegisterInput,
  MutationAccountAddressCreateArgs,
  MutationAccountAddressUpdateArgs,
  MutationAccountSetDefaultAddressArgs,
  MutationAccountUpdateArgs,
  // MutationExternalAuthenticationUrlArgs,
  MutationPasswordChangeArgs,
  MutationTokenCreateArgs,
  MutationTokenRefreshArgs,
  MutationRequestPasswordResetArgs,
  MutationSetPasswordArgs,
  MutationRequestEmailChangeArgs,
  // AccountConfirmMutationVariables,
  // MutationExternalLogoutArgs,
  // ExternalAuthenticationUrlMutation,
  // ExternalLogoutMutation,
  // ExternalObtainAccessTokensMutation,
  // ExternalRefreshMutation,
  // ExternalVerifyMutation,
  // LoginMutation,
  RefreshTokenMutation,
  UpdateCheckoutBillingAddressMutation,
  UpdateCheckoutShippingAddressMutation,
  // RegisterMutation,
  // RequestPasswordResetMutation,
  // SetPasswordMutation,
  // VerifyTokenMutation,
  // PasswordChangeMutation,
  // MutationExternalObtainAccessTokensArgs,
  // AccountDeleteMutation,
  // AccountRequestDeletionMutation,
  // AccountConfirmMutation,
  // AccountUpdateMutation,
  // ConfirmEmailChangeMutation,
  // CreateAccountAddressMutation,
  // DeleteAccountAddressMutation,
  // RequestEmailChangeMutation,
  // SetAccountDefaultAddressMutation,
  // UpdateAccountAddressMutation,
} from "../apollo/types";
import { AuthSDK } from "./auth";
import { UserSDK } from "./user";
import { State } from "./state";
import { FetchConfig } from "../apollo";
import { CartSDK } from "./cart";
import { CheckoutSDK } from "./checkout";
import { WishlistSDK } from "./wishlist";
import { WalletSDK } from "./wallet";

export interface SaleorClientInternals {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}
export interface SaleorClientConfig {
  channel: string;
  autologin: boolean;
  setChannel(channel: string): string;
}
export interface SaleorClient {
  auth: AuthSDK;
  user: UserSDK;
  config: SaleorClientConfig;
  _internal: SaleorClientInternals;
  getState(): State;
  cart: CartSDK;
  checkout: CheckoutSDK;
  wishlist: WishlistSDK;
  wallet: WalletSDK;
}

interface SaleorClientFetchOpts {
  autologin?: boolean;
  fetchOpts?: FetchConfig;
}

export interface SaleorClientOpts {
  apiUrl: string;
  channel: string;
  opts?: SaleorClientFetchOpts;
}

export interface ShippingAndBilling {
  resShipping: FetchResult<
    UpdateCheckoutShippingAddressMutation,
    Record<string, any>,
    Record<string, any>
  > | null;
  resBilling: FetchResult<
    UpdateCheckoutBillingAddressMutation,
    Record<string, any>,
    Record<string, any>
  > | null;
}

export type SaleorClientMethodsProps = SaleorClientInternals &
  Pick<SaleorClientConfig, "channel">;

export type JWTToken = {
  iat: number;
  iss: string;
  owner: string;
  exp: number;
  token: string;
  email: string;
  type: string;
  user_id: string;
  is_staff: boolean;
};

// Meethods opts
// Auth
export type ChangePasswordOpts = MutationPasswordChangeArgs;
export type LoginOpts = MutationTokenCreateArgs;
export type RefreshTokenOpts = Pick<MutationTokenRefreshArgs, "csrfToken">;
export type RegisterOpts = AccountRegisterInput;
export type RequestPasswordResetOpts = MutationRequestPasswordResetArgs;
export type SetPasswordOpts = MutationSetPasswordArgs;
// export type GetExternalAuthUrlOpts = MutationExternalAuthenticationUrlArgs;
// export type GetExternalAccessTokenOpts = MutationExternalObtainAccessTokensArgs;
// export type LogoutOpts = Pick<MutationExternalLogoutArgs, "input">;
// User
export type CreateAccountAddressOpts = MutationAccountAddressCreateArgs;
export type RequestEmailChangeOpts = MutationRequestEmailChangeArgs;
export type SetAccountDefaultAddressOpts = MutationAccountSetDefaultAddressArgs;
export type UpdateAccountOpts = MutationAccountUpdateArgs;
export type UpdateAccountAddressOpts = MutationAccountAddressUpdateArgs;
// export type ConfirmAccountOpts = AccountConfirmMutationVariables;

// Meethods results
// Auth
// export type ChangePasswordResult = FetchResult<PasswordChangeMutation>;
// export type ChangePasswordData = PasswordChangeMutation["passwordChange"];
// export type LoginResult = FetchResult<LoginMutation>;
// export type LoginData = LoginMutation["tokenCreate"];
// export type LogoutResult = FetchResult<ExternalLogoutMutation> | null;
// export type LogoutData = ExternalLogoutMutation["externalLogout"] | null;
export type RefreshTokenResult = FetchResult<RefreshTokenMutation>;

// Checkout
export type SetShippingAndBillingAddressResult = Promise<ShippingAndBilling>;
