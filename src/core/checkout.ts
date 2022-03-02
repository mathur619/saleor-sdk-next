import { FetchResult } from "@apollo/client";
import { setLocalCheckoutInCache } from "../apollo/helpers";
import {
  ADD_CHECKOUT_PROMO_CODE,
  CHECKOUT_PAYMENT_METHOD_UPDATE,
  COMPLETE_CHECKOUT,
  CREATE_CHECKOUT_MUTATION,
  CREATE_CHECKOUT_PAYMENT,
  CREATE_RAZORPAY_ORDER,
  GET_WALLET_AMOUNT,
  REMOVE_CHECKOUT_PROMO_CODE,
  UPDATE_CHECKOUT_ADDRESS_TYPE,
  UPDATE_CHECKOUT_BILLING_ADDRESS_MUTATION,
  UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION,
  UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION,
} from "../apollo/mutations";
import {
  GET_CITY_STATE_FROM_PINCODE,
  GET_LOCAL_CHECKOUT,
} from "../apollo/queries";
import {
  AddCheckoutPromoCodeMutation,
  AddCheckoutPromoCodeMutationVariables,
  AddressTypes,
  Checkout,
  CheckoutPaymentMethodUpdateMutation,
  CheckoutPaymentMethodUpdateMutationVariables,
  CompleteCheckoutMutation,
  CompleteCheckoutMutationVariables,
  CountryCode,
  CreateCheckoutPaymentMutation,
  CreateCheckoutPaymentMutationVariables,
  CreateRazorpayOrderMutation,
  CreateRazorpayOrderMutationVariables,
  GetWalletQuery,
  GetWalletQueryVariables,
  PaymentInput,
  PincodeQuery,
  PincodeQueryVariables,
  RemoveCheckoutPromoCodeMutation,
  RemoveCheckoutPromoCodeMutationVariables,
  UpdateCheckoutAddressTypeMutation,
  UpdateCheckoutAddressTypeMutationVariables,
  UpdateCheckoutBillingAddressMutation,
  UpdateCheckoutBillingAddressMutationVariables,
  UpdateCheckoutShippingAddressMutation,
  UpdateCheckoutShippingAddressMutationVariables,
  UpdateCheckoutShippingMethodMutation,
  UpdateCheckoutShippingMethodMutationVariables,
} from "../apollo/types";
import {
  CreateCheckout,
  CreateCheckoutVariables,
} from "../apollo/types/cartTypes";
import {
  CompleteCheckoutInput,
  CreatePaymentInput,
  IAddress,
  PaymentMethodUpdateInput,
} from "../apollo/types/checkout";
import { storage } from "./storage";
import {
  SaleorClientMethodsProps,
  SetShippingAndBillingAddressResult,
} from "./types";

export interface CheckoutSDK {
  loaded?: any;

  checkout?: any;

  promoCodeDiscount?: any;

  billingAsShipping?: any;

  selectedShippingAddressId?: string;

  selectedBillingAddressId?: string;

  availableShippingMethods?: any;

  availablePaymentGateways?: any[];

  payment?: any;

  setAddressType?: (
    addressId: string,
    type: AddressTypes
  ) => Promise<FetchResult<UpdateCheckoutAddressTypeMutation> | null>;
  createCheckout?: () => Promise<FetchResult<CreateCheckout> | null>;
  setShippingAddress?: (
    shippingAddress: IAddress,
    email: string
  ) => Promise<FetchResult<UpdateCheckoutShippingAddressMutation> | null>;
  setShippingAndBillingAddress?: (
    shippingAddress: IAddress,
    email: string
  ) => SetShippingAndBillingAddressResult;

  setBillingAddress?: (
    billingAddress: IAddress
  ) => Promise<FetchResult<UpdateCheckoutBillingAddressMutation> | null>;
  setShippingMethod?: (
    shippingMethodId: string
  ) => Promise<FetchResult<UpdateCheckoutShippingMethodMutation> | null>;
  addPromoCode?: (
    promoCode: string
  ) => Promise<FetchResult<AddCheckoutPromoCodeMutation> | null>;
  removePromoCode?: (
    promoCode: string
  ) => Promise<FetchResult<RemoveCheckoutPromoCodeMutation> | null>;
  checkoutPaymentMethodUpdate?: (
    input: PaymentMethodUpdateInput
  ) => Promise<FetchResult<CheckoutPaymentMethodUpdateMutation> | null>;
  createPayment?: (
    input: CreatePaymentInput
  ) => Promise<FetchResult<CreateCheckoutPaymentMutation> | null>;
  completeCheckout?: (
    input?: CompleteCheckoutInput
  ) => Promise<FetchResult<CompleteCheckoutMutation> | null>;
  getCityStateFromPincode?: (
    pincode: string
  ) => Promise<FetchResult<PincodeQuery> | null>;
  createRazorpayOrder?: () => Promise<FetchResult<CreateRazorpayOrderMutation>>;
  getWalletAmount?: () => Promise<FetchResult<GetWalletQuery>>;
}

export const checkout = ({
  apolloClient: client,
}: SaleorClientMethodsProps): CheckoutSDK => {
  const createCheckout: CheckoutSDK["createCheckout"] = async () => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    if (!(checkout && checkout?.id)) {
      return await client.mutate<CreateCheckout, CreateCheckoutVariables>({
        mutation: CREATE_CHECKOUT_MUTATION,
        variables: {
          checkoutInput: {
            lines: [],
            email: "dummy@dummy.com",
            shippingAddress: {
              city: "delhi",
              companyName: "dummy",
              country: "IN",
              countryArea: "Delhi",
              firstName: "dummy",
              lastName: "dummy",
              phone: "7894561230",
              postalCode: "110006",
              streetAddress1: "dummy",
              streetAddress2: "dummy",
            },
          },
        },
        update: (_, { data }) => {
          console.log("in update CreateCheckout", data);
          setLocalCheckoutInCache(client, data?.checkoutCreate?.checkout);
          if (data?.checkoutCreate?.checkout?.id) {
            storage.setCheckout(data?.checkoutCreate?.checkout);
          }
        },
      });
    }
    return null;
  };

  const setShippingAddress: CheckoutSDK["setShippingAddress"] = async (
    shippingAddress: IAddress,
    email: string
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout setShippingAddress", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      const variables = {
        checkoutId: checkout?.id,
        email,
        shippingAddress: {
          city: shippingAddress.city,
          companyName: shippingAddress.companyName,
          country: shippingAddress?.country?.code as CountryCode,
          countryArea: shippingAddress.countryArea,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          postalCode: shippingAddress.postalCode,
          streetAddress1: shippingAddress.streetAddress1,
          streetAddress2: shippingAddress.streetAddress2,
        },
      };
      console.log("checkout setShippingAddress in if");

      const res = await client.mutate<
        UpdateCheckoutShippingAddressMutation,
        UpdateCheckoutShippingAddressMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION,
        variables,
        update: (_, { data }) => {
          console.log("in update setShippingAddress", data);
          setLocalCheckoutInCache(
            client,
            data?.checkoutShippingAddressUpdate?.checkout
          );
          if (data?.checkoutShippingAddressUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutShippingAddressUpdate?.checkout);
          }
        },
      });

      return res;
    }

    return null;
  };

  const setBillingAddress: CheckoutSDK["setBillingAddress"] = async (
    billingAddress: IAddress
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout setBillingAddress", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      const variables = {
        checkoutId: checkout?.id,
        billingAddress: {
          city: billingAddress.city,
          companyName: billingAddress.companyName,
          country: billingAddress?.country?.code as CountryCode,
          countryArea: billingAddress.countryArea,
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          phone: billingAddress.phone,
          postalCode: billingAddress.postalCode,
          streetAddress1: billingAddress.streetAddress1,
          streetAddress2: billingAddress.streetAddress2,
        },
      };
      const res = await client.mutate<
        UpdateCheckoutBillingAddressMutation,
        UpdateCheckoutBillingAddressMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_BILLING_ADDRESS_MUTATION,
        variables,
        update: (_, { data }) => {
          console.log("in update setBillingAddress", data);
          setLocalCheckoutInCache(
            client,
            data?.checkoutBillingAddressUpdate?.checkout
          );
          if (data?.checkoutBillingAddressUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutBillingAddressUpdate?.checkout);
          }
        },
      });
      return res;
    }
    return null;
  };

  const setShippingAndBillingAddress: CheckoutSDK["setShippingAndBillingAddress"] = async (
    shippingAddress: IAddress,
    email: string
  ) => {
    console.log("setShippingAndBillingAddress");
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });

    const resShipping = await setShippingAddress(shippingAddress, email);
    const resBilling = await setBillingAddress(shippingAddress);
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: false,
      },
    });
    // const dataError = resShipping?.errors || resBilling?.errors;
    // console.log("setShippingAndBillingAddress", resShipping, resBilling);
    // const returnObject= {
    //   data: {
    //     billingData: resBilling?.data?.checkoutBillingAddressUpdate?.checkout,
    //     shippingData: resShipping?.data?.checkoutShippingAddressUpdate?.checkout,
    //   },
    //   dataError,
    //   pending: false,
    // }

    const returnObject = {
      resShipping,
      resBilling,
    };
    return returnObject;
  };

  const setAddressType: CheckoutSDK["setAddressType"] = async (
    addressId: string,
    type: AddressTypes
  ) => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;

    if (!(checkout && checkout?.id)) {
      return await client.mutate<
        UpdateCheckoutAddressTypeMutation,
        UpdateCheckoutAddressTypeMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_ADDRESS_TYPE,
        variables: {
          addressId,
          type,
        },
      });
    }
    return null;
  };

  const setShippingMethod: CheckoutSDK["setShippingMethod"] = async (
    shippingMethodId: string
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });

    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout setShippingMethod", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      const variables: UpdateCheckoutShippingMethodMutationVariables = {
        checkoutId: checkout?.id,
        shippingMethodId,
      };
      console.log("checkout setShippingMethod in if");

      const res = await client.mutate<
        UpdateCheckoutShippingMethodMutation,
        UpdateCheckoutShippingMethodMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION,
        variables,
        update: (_, { data }) => {
          console.log("in update setShippingMethod", data);

          if (data?.checkoutShippingMethodUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutShippingMethodUpdate?.checkout);
          }
          setLocalCheckoutInCache(
            client,
            data?.checkoutShippingMethodUpdate?.checkout,
            true
          );
        },
      });

      return res;
    }

    return null;
  };

  const addPromoCode: CheckoutSDK["addPromoCode"] = async (
    promoCode: string
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout addPromoCode", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      const variables: AddCheckoutPromoCodeMutationVariables = {
        checkoutId: checkout?.id,
        promoCode,
      };
      console.log("checkout addPromoCode in if");

      const res = await client.mutate<
        AddCheckoutPromoCodeMutation,
        AddCheckoutPromoCodeMutationVariables
      >({
        mutation: ADD_CHECKOUT_PROMO_CODE,
        variables,
        update: (_, { data }) => {
          console.log("in update addPromoCode", data);
          if (data?.checkoutAddPromoCode?.checkout?.id) {
            storage.setCheckout(data?.checkoutAddPromoCode?.checkout);
          }
          setLocalCheckoutInCache(
            client,
            data?.checkoutAddPromoCode?.checkout,
            true
          );
        },
      });

      return res;
    }

    return null;
  };

  const removePromoCode: CheckoutSDK["removePromoCode"] = async (
    promoCode: string
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });

    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout removePromoCode", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      const variables: RemoveCheckoutPromoCodeMutationVariables = {
        checkoutId: checkout?.id,
        promoCode,
      };
      console.log("checkout removePromoCode in if");

      const res = await client.mutate<
        RemoveCheckoutPromoCodeMutation,
        RemoveCheckoutPromoCodeMutationVariables
      >({
        mutation: REMOVE_CHECKOUT_PROMO_CODE,
        variables,
        update: (_, { data }) => {
          console.log("in update removePromoCode", data);

          if (data?.checkoutRemovePromoCode?.checkout?.id) {
            storage.setCheckout(data?.checkoutRemovePromoCode?.checkout);
          }
          setLocalCheckoutInCache(
            client,
            data?.checkoutRemovePromoCode?.checkout,
            true
          );
        },
      });

      return res;
    }

    return null;
  };

  const checkoutPaymentMethodUpdate: CheckoutSDK["checkoutPaymentMethodUpdate"] = async (
    input: PaymentMethodUpdateInput
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
        useCashback: input.useCashback,
      },
    });
    console.log("checkoutPaymentMethodUpdate", input);

    storage.setUseCashback(input.useCashback);

    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout checkoutPaymentMethodUpdate", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      const variables: CheckoutPaymentMethodUpdateMutationVariables = {
        checkoutId: checkout?.id,
        gatewayId: input.gateway,
        useCashback: input.useCashback,
      };
      console.log("checkout checkoutPaymentMethodUpdate in if");

      const res = await client.mutate<
        CheckoutPaymentMethodUpdateMutation,
        CheckoutPaymentMethodUpdateMutationVariables
      >({
        mutation: CHECKOUT_PAYMENT_METHOD_UPDATE,
        variables,
        update: (_, { data }) => {
          console.log("checkoutPaymentMethodUpdate", data);
          console.log("in update checkoutPaymentMethodUpdate", data);
          setLocalCheckoutInCache(
            client,
            data?.checkoutPaymentMethodUpdate?.checkout,
            true
          );
          if (data?.checkoutPaymentMethodUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutPaymentMethodUpdate?.checkout);
          }
        },
      });

      return res;
    }

    return null;
  };

  const createPayment: CheckoutSDK["createPayment"] = async (
    input: PaymentInput
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    const checkoutString = storage.getCheckout();
    const checkout: Checkout | null | undefined =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout removePromoCode", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      console.log("checkout removePromoCode in if");
      const variables: CreateCheckoutPaymentMutationVariables = {
        checkoutId: checkout?.id,
        paymentInput: { ...input, amount: checkout?.totalPrice?.gross.amount },
      };
      const res = await client.mutate<
        CreateCheckoutPaymentMutation,
        CreateCheckoutPaymentMutationVariables
      >({
        mutation: CREATE_CHECKOUT_PAYMENT,
        variables,
        update: (_, { data }) => {
          console.log("in update removePromoCode", data);
          setLocalCheckoutInCache(
            client,
            data?.checkoutPaymentCreate?.checkout
          );
          if (data?.checkoutPaymentCreate?.checkout?.id) {
            storage.setCheckout(data?.checkoutPaymentCreate?.checkout);
          }
        },
      });

      return res;
    }

    return null;
  };

  const completeCheckout: CheckoutSDK["completeCheckout"] = async (
    input: CompleteCheckoutInput | undefined
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    const checkoutString = storage.getCheckout();
    const checkout: Checkout | null | undefined =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout removePromoCode", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      console.log("checkout removePromoCode in if");
      const paymentDataString =
        input?.paymentData && JSON.stringify(input?.paymentData);
      console.log("paymentDataString", paymentDataString);
      const variables: CompleteCheckoutMutationVariables = {
        checkoutId: checkout?.id,
        paymentData: paymentDataString,
        redirectUrl: input?.redirectUrl,
        storeSource: input?.storeSource,
      };
      const res = await client.mutate<
        CompleteCheckoutMutation,
        CompleteCheckoutMutationVariables
      >({
        mutation: COMPLETE_CHECKOUT,
        variables,
        update: async (_, { data }) => {
          if (data?.checkoutComplete?.order?.id) {
            if (!data?.checkoutComplete.confirmationNeeded) {
              storage.setCheckout({});
            }
          }
          await setLocalCheckoutInCache(client, {}, false);
        },
      });

      return res;
    }

    return null;
  };

  const getCityStateFromPincode: CheckoutSDK["getCityStateFromPincode"] = async (
    pincode: string
  ) => {
    const res = await client.mutate<PincodeQuery, PincodeQueryVariables>({
      mutation: GET_CITY_STATE_FROM_PINCODE,
      variables: {
        pin: pincode,
      },
    });

    return res;
  };

  const createRazorpayOrder: CheckoutSDK["createRazorpayOrder"] = async () => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });

    const checkoutString = storage.getCheckout();
    const checkout: Checkout | null | undefined =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout removePromoCode", checkout, checkout?.id);

    if (checkout && checkout?.id) {
      console.log("checkout removePromoCode in if");
      const variables: CreateRazorpayOrderMutationVariables = {
        input: {
          checkoutId: checkout?.id,
        },
      };
      const res = await client.mutate<
        CreateRazorpayOrderMutation,
        CreateRazorpayOrderMutationVariables
      >({
        mutation: CREATE_RAZORPAY_ORDER,
        variables,
        update: async () => {
          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              checkoutLoading: true,
            },
          });
        },
      });

      return res;
    }

    return { data: null };
  };

  const getWalletAmount: CheckoutSDK["getWalletAmount"] = async () => {
    const res = await client.mutate<GetWalletQuery, GetWalletQueryVariables>({
      mutation: GET_WALLET_AMOUNT,
      update: async (_, { data }) => {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            userWalletBalance: data?.wallet?.amount,
          },
        });
      },
    });

    return res;
  };

  return {
    createCheckout,
    setShippingAddress,
    setBillingAddress,
    setShippingAndBillingAddress,
    setAddressType,
    setShippingMethod,
    addPromoCode,
    removePromoCode,
    checkoutPaymentMethodUpdate,
    createPayment,
    completeCheckout,
    getCityStateFromPincode,
    createRazorpayOrder,
    getWalletAmount,
  };
};
