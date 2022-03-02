import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Reference,
  FetchResult,
  makeVar,
} from "@apollo/client";
import fetch from "cross-fetch";
import jwtDecode from "jwt-decode";

import { TypedTypePolicies } from "./apollo-helpers";
import { JWTToken } from "../core";
import { AuthSDK, auth } from "../core/auth";
import { storage } from "../core/storage";
import {
  CheckoutLineFragment,
  // ExternalRefreshMutation,
  Maybe,
  RefreshTokenMutation,
} from "./types";
// import { UpdateCheckoutLine_checkoutLinesUpdate_checkout_lines } from "./cartTypes";

let client: ApolloClient<NormalizedCacheObject>;
let authClient: AuthSDK;

let refreshPromise: ReturnType<AuthSDK["refreshToken"]> | null = null;
// const isTokenRefreshExternal = (
//   result: RefreshTokenMutation | ExternalRefreshMutation
// ): result is ExternalRefreshMutation => "externalRefresh" in result;

export type FetchConfig = Partial<{
  /**
   * Enable auto token refreshing. Default to `true`.
   */
  autoTokenRefresh: boolean;
  /**
   * Set a value for skew between local time and token expiration date in
   * seconds (only together with `autoTokenRefresh`). Defaults to `120`.
   */
  tokenRefreshTimeSkew: number;
  /**
   * Refresh token and retry the request when Saleor responds with `Unauthorized` error.
   * Defaults to `true`.
   */
  refreshOnUnauthorized: boolean;
}>;

export const createFetch = ({
  autoTokenRefresh = true,
  tokenRefreshTimeSkew = 120,
  refreshOnUnauthorized = true,
}: FetchConfig = {}) => async (
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> => {
  if (!client) {
    throw new Error(
      "Could not find Saleor's client instance. Did you forget to call createSaleorClient()?"
    );
  }

  let token = storage.getAccessToken();
  // const authPluginId = storage.getAuthPluginId();

  try {
    if (
      ["refreshToken", "externalRefresh"].includes(
        // INFO: Non-null assertion is enabled because the block is wrapped inside try/catch
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        JSON.parse(init.body!.toString()).operationName
      )
    ) {
      return fetch(input, init);
    }
  } catch (e) {}

  if (autoTokenRefresh && token) {
    // auto refresh token before provided time skew (in seconds) until it expires
    const expirationTime =
      (jwtDecode<JWTToken>(token).exp - tokenRefreshTimeSkew) * 1000;

    try {
      if (refreshPromise) {
        await refreshPromise;
      } else if (Date.now() >= expirationTime) {
        // refreshToken automatically updates token in storage
        refreshPromise = authClient.refreshToken();
        await refreshPromise;
      }
    } catch (e) {
    } finally {
      refreshPromise = null;
    }
    token = storage.getAccessToken();
  }

  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `JWT ${token}`,
    };
  }

  if (refreshOnUnauthorized && token) {
    const response = await fetch(input, init);
    const data: FetchResult = await response.clone().json();
    const isUnauthenticated = data?.errors?.some(
      error => error.extensions?.exception.code === "ExpiredSignatureError"
    );
    let refreshTokenResponse: FetchResult<
      RefreshTokenMutation,
      Record<string, unknown>,
      Record<string, unknown>
    > | null = null;

    if (isUnauthenticated) {
      try {
        if (refreshPromise) {
          refreshTokenResponse = await refreshPromise;
        } else {
          refreshPromise = authClient.refreshToken();
          refreshTokenResponse = await refreshPromise;
        }

        if (
          refreshTokenResponse.data &&
          refreshTokenResponse.data?.tokenRefresh?.token
        ) {
          // check if mutation returns a valid token after refresh and retry the request
          return createFetch({
            autoTokenRefresh: false,
            refreshOnUnauthorized: false,
          })(input, init);
        } else {
          // after Saleor returns ExpiredSignatureError status and token refresh fails
          // we log out the user and return the failed response
          authClient.signOut();
        }
      } catch (e) {
      } finally {
        refreshPromise = null;
      }
    }

    return response;
  }

  return fetch(input, init);
};

export const cartItemsVar = makeVar<Maybe<CheckoutLineFragment>[]>([]);

const getTypePolicies = (autologin: boolean): TypedTypePolicies => ({
  Query: {
    fields: {
      authenticated: {
        read(_, { readField, toReference }): boolean {
          return !!readField(
            "id",
            toReference({
              __typename: "User",
            })
          );
        },
      },
      me: {
        read(_, { toReference, canRead }): Reference | undefined | null {
          const ref = toReference({
            __typename: "User",
          });
          return canRead(ref) ? ref : null;
        },
      },
      authenticating: {
        read(
          read = autologin && !!storage.getCSRFToken(),
          { readField }
        ): boolean {
          if (readField("authenticated")) {
            return false;
          }

          return read;
        },
      },
      checkout: {
        read(
          _,
          { toReference, canRead, cache, field, fieldName, variables }
        ): Reference | undefined | null {
          console.log("cache checkout", cache, field, fieldName, variables);
          const ref = toReference({
            __typename: "CheckoutLinesUpdate",
          });
          console.log("ref Checkout", ref);
          return canRead(ref) ? ref : null;
        },
      },
      checkoutUpdated: {
        read(): boolean {
          return true;
        },
      },
      cartItems: {
        read() {
          const cartItems = cartItemsVar();
          console.log("cartItems cache", cartItems);
          return cartItems;
        },
      },
      localCheckout: {
        read(existing) {
          if (!existing) {
            const checkoutString = storage.getCheckout();
            const checkout =
              checkoutString && typeof checkoutString === "string"
                ? JSON.parse(checkoutString)
                : checkoutString;
            console.log("no exist checkout", checkout);
            if (checkout) {
              console.log("no exist in if checkout 2", checkout);

              return checkout;
            }
            console.log("no exist 2000", checkout);

            return {
              items: [],
              totalPrice: 0,
              subtotalPrice: 0,
              shippingPrice: 0,
            };
          }
          if (existing !== null) {
            console.log("no exist 2001", existing);

            return existing;
          }
          console.log("no exist 2003", existing);

          return {
            items: [],
            totalPrice: 0,
            subtotalPrice: 0,
            shippingPrice: 0,
          };
        },
      },

      localCheckoutDiscounts: {
        read(existing) {
          console.log("existing localCheckoutDiscounts", existing);
          if (!existing) {
            const discountsString = storage.getDiscounts();
            const discounts =
              discountsString && typeof discountsString === "string"
                ? JSON.parse(discountsString)
                : discountsString;
            console.log("no exist 1", discounts?.checkoutDiscounts);

            return (
              discounts?.checkoutDiscounts || {
                prepaidDiscount: "0",
                couponDiscount: "0",
                cashbackDiscount: "0",
              }
            );
          }
          return (
            existing || {
              prepaidDiscount: "0",
              couponDiscount: "0",
              cashbackDiscount: "0",
            }
          );
        },
      },
      localCashback: {
        read(existing) {
          console.log("existing localCashback", existing);
          if (!existing) {
            const discountsString = storage.getDiscounts();
            const discounts =
              discountsString && typeof discountsString === "string"
                ? JSON.parse(discountsString)
                : discountsString;
            console.log("no exist 1", discounts?.cashback);

            return (
              discounts?.cashback || {
                amount: "0",
                willAddOn: null,
              }
            );
          }
          return (
            existing || {
              amount: "0",
              willAddOn: null,
            }
          );
        },
      },
      useCashback: {
        read(existing) {
          console.log("existing useCashback", existing);
          if (existing === null || existing === undefined) {
            const useCashbackString = storage.getUseCashback();
            const useCashbackBollean = useCashbackString === "true";
            return useCashbackBollean;
          }
          return existing;
        },
      },
      checkoutLoading: {
        read(existing) {
          console.log("existing checkoutLoading", existing);
          if (!existing) {
            return false;
          }
          return existing;
        },
      },
      userWalletBalance: {
        read(existing) {
          console.log("existing userWalletBalance", existing);
          if (!existing) {
            return 0;
          }
          return existing;
        },
      },
    },
  },
  User: {
    /**
     * IMPORTANT
     * This works as long as we have 1 User cache object which is the current logged in User.
     * If the client should ever fetch additional Users, this should be removed
     * and the login methods (token create or verify) should be responsible for writing USER query cache manually.
     */
    keyFields: [],
    fields: {
      addresses: {
        merge: false,
      },
    },
  },
});

export const createApolloClient = (
  apiUrl: string,
  autologin: boolean,
  fetchOptions?: FetchConfig
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({
    fetch: createFetch(fetchOptions),
    uri: apiUrl,
    credentials: "include",
  });

  const cache = new InMemoryCache({
    typePolicies: getTypePolicies(autologin),
  });
  console.log("cache", cache);
  client = new ApolloClient({
    cache,
    link: httpLink,
  });

  /**
   * Refreshing token code should stay under core/auth.ts To get this method available,
   * we need to call "auth()" here. refreshToken mutation doesn't require channel, so it
   * doesn't have to be populated with value.
   */
  authClient = auth({ apolloClient: client, channel: "" });

  return client;
};
