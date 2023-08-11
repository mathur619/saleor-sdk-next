import {
  ApolloClient,
  ApolloQueryResult,
  FetchResult,
  NormalizedCacheObject,
  QueryResult,
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
  AddCheckoutPromoCodeMutation,
  CheckoutPaymentMethodUpdateMutation,
  CreateCheckoutPaymentMutation,
  PincodeQuery,
  GetWalletQuery,
  CompleteCheckoutMutation,
  RemoveCheckoutPromoCodeMutation,
  UpdateCheckoutAddressTypeMutation,
  UpdateCheckoutShippingMethodMutation,
  CreateRazorpayOrderMutation,
  CheckoutErrorFragment,
  CheckoutFragment,
  Maybe,
  CreateCheckoutMutation,
  OtpAuthenticationMutation,
  OtpRequestMutation,
  AccountRegisterV2Mutation,
  ConfirmAccountV2Mutation,
  UserCheckoutDetailsQuery,
  Exact,
  OrdersByUserQuery,
  // RegisterMutation,
  // RequestPasswordResetMutation,
  // SetPasswordMutation,
  // VerifyTokenMutation,
  // PasswordChangeMutation,
  // MutationExternalObtainAccessTokensArgs,
  // AccountDeleteMutation,
  // AccountRequestDeletionMutation,
  // AccountConfirmMutation,
  AccountUpdateMutation,
  SetAccountDefaultAddressMutation,
  DeleteAccountAddressMutation,
  CreateAccountAddressMutation,
  UpdateAccountAddressMutation,
  VerifyCheckoutOtpMutation,
  PaytmTxnCreateMutation,
  CreateCashfreeOrderMutation,
  CreateJuspayOrderAndCustomerMutation,
  CheckJuspayOrderStatusMutation,
  VerifyJuspayVpaMutation,
  CheckoutCustomerAttachNewMutation,
  CheckoutTotalsQuery,
  CreateJuspayPaymentMutation,
  UpdateUserMetaMutation,
  CreateTokenWithoutOtpMutation,
  CreateGokwikOrderMutation,
  CreateTokenTrueCallerMutation,
  UpdateCheckoutMetaMutation,
  UpdateCheckoutShippingAddressNewMutation,
  // ConfirmEmailChangeMutation,
  // CreateAccountAddressMutation,
  // DeleteAccountAddressMutation,
  // RequestEmailChangeMutation,
  // SetAccountDefaultAddressMutation,
  // UpdateAccountAddressMutation,
} from "../apollo/types";
import { AuthSDK } from "./auth";
import { UserSDK } from "./user";
import { CheckoutState, State } from "./state";
import { FetchConfig } from "../apollo";
import { CartSDK } from "./cart";
import { CheckoutSDK } from "./checkout";
import { WishlistSDK } from "./wishlist";
import { WalletSDK } from "./wallet";

export interface SaleorClientInternals {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  restApiUrl?: string;
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
  getToken(): string | null;
  getCheckout(): CheckoutState;
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
  restApiUrl?: string;
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
export type UpdateAccountResult = FetchResult<AccountUpdateMutation>;
export type SetAccountDefaultAddressResult = FetchResult<
  SetAccountDefaultAddressMutation
>;
export type DeleteAccountAddressResult = FetchResult<
  DeleteAccountAddressMutation
>;
export type CreateAccountAddressResult = FetchResult<
  CreateAccountAddressMutation
>;
export type UpdateAccountAddressResult = FetchResult<
  UpdateAccountAddressMutation
>;

export type UpdateUserMetaDataMutationResult = FetchResult<
  UpdateUserMetaMutation
>;

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
export type SetAddressTypeResult = Promise<FetchResult<
  UpdateCheckoutAddressTypeMutation
> | null>;
export type CreateCheckoutResult = Promise<FetchResult<
  CreateCheckoutMutation
> | null>;
export type SetShippingAddressResult = Promise<FetchResult<
  UpdateCheckoutShippingAddressMutation
> | null>;

export type SetShippingAddressAndEmailResult = Promise<FetchResult<
  UpdateCheckoutShippingAddressNewMutation
> | null>;
export type SetShippingAndBillingAddressResult = Promise<ShippingAndBilling>;
export type SetBillingAddressResult = Promise<FetchResult<
  UpdateCheckoutBillingAddressMutation
> | null>;
export type SetShippingMethodResult = Promise<FetchResult<
  UpdateCheckoutShippingMethodMutation
> | null>;
export type AddPromoCodeResult = Promise<FetchResult<
  AddCheckoutPromoCodeMutation
> | null>;
export type RemovePromoCodeResult = Promise<FetchResult<
  RemoveCheckoutPromoCodeMutation
> | null>;
export type CheckoutPaymentMethodUpdateResult = Promise<FetchResult<
  CheckoutPaymentMethodUpdateMutation
> | null>;
export type CreatePaymentResult = Promise<FetchResult<
  CreateCheckoutPaymentMutation
> | null>;
export type CompleteCheckoutResult = Promise<FetchResult<
  CompleteCheckoutMutation
> | null>;
export type GetCityStateFromPincodeResult = Promise<FetchResult<
  PincodeQuery
> | null>;
export type CreateRazorpayOrderResult = Promise<FetchResult<
  CreateRazorpayOrderMutation
> | null>;
export type CreateGokwikOrderResult = Promise<FetchResult<
  CreateGokwikOrderMutation
> | null>;

export type JuspayOrderAndCustomerCreateResult = Promise<FetchResult<
  CreateJuspayOrderAndCustomerMutation
> | null>;

export type JuspayPaymentCreateResult = Promise<FetchResult<
  CreateJuspayPaymentMutation
> | null>;

export type CheckJuspayOrderStatusResult = Promise<FetchResult<
  CheckJuspayOrderStatusMutation
> | null>;

export type VerifyJuspayVpaResult = Promise<
  FetchResult<VerifyJuspayVpaMutation>
>;

export type CreateCashfreeOrderResult = Promise<FetchResult<
  CreateCashfreeOrderMutation
> | null>;

export type CreatePaytmOrderResult = Promise<
  FetchResult<PaytmTxnCreateMutation, Record<string, any>, Record<string, any>>
>;
export type GetWalletAmountResult = Promise<FetchResult<GetWalletQuery> | null>;

export type GetUserOrdersResult = Promise<
  QueryResult<
    OrdersByUserQuery,
    Exact<{ perPage: number; after?: Maybe<string> | undefined }>
  >
>;

export type CheckoutTotalsResult = Promise<FetchResult<
  CheckoutTotalsQuery
> | null>;

// Cart

export type CartMethodsReturn = {
  data: Maybe<CheckoutFragment> | undefined;
  errors: CheckoutErrorFragment[] | undefined;
};

export type AddItemResult = Promise<CartMethodsReturn>;

export type RemoveItemResult = Promise<CartMethodsReturn | null>;

export type UpdateItemResult = Promise<CartMethodsReturn | null>;

// Auth

export type SignInMobileResult = Promise<
  FetchResult<
    OtpAuthenticationMutation,
    Record<string, any>,
    Record<string, any>
  >
>;

export type OtpLessLoginResult = Promise<
  FetchResult<
    CreateTokenWithoutOtpMutation,
    Record<string, any>,
    Record<string, any>
  >
>;

export type TrueCallerLoginResult = Promise<FetchResult<
  CreateTokenTrueCallerMutation,
  Record<string, any>,
  Record<string, any>
> | null>;

export type RequestOtpResult = Promise<
  FetchResult<OtpRequestMutation, Record<string, any>, Record<string, any>>
>;

export type RegisterAccountV2Result = Promise<
  FetchResult<
    AccountRegisterV2Mutation,
    Record<string, any>,
    Record<string, any>
  >
>;

export type ConfirmAccountV2Result = Promise<
  FetchResult<
    ConfirmAccountV2Mutation,
    Record<string, any>,
    Record<string, any>
  >
>;

export type CheckoutCustomerAttachResult = Promise<FetchResult<
  CheckoutCustomerAttachNewMutation
> | null>;

export type VerifyCheckoutOTPResult = Promise<
  FetchResult<
    VerifyCheckoutOtpMutation,
    Record<string, any>,
    Record<string, any>
  >
>;

export type SignOutResult = Promise<ApolloQueryResult<any>[] | null>;

export type GetUserCheckoutResult = Promise<
  FetchResult<
    UserCheckoutDetailsQuery,
    Record<string, any>,
    Record<string, any>
  >
>;

export type UpdateCheckoutMetaResult = Promise<FetchResult<
  UpdateCheckoutMetaMutation,
  Record<string, any>,
  Record<string, any>
> | null>;
