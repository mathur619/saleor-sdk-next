import { getLatestCheckout, setLocalCheckoutInCache } from "../apollo/helpers";
import {
  ADD_CHECKOUT_PROMO_CODE,
  CHECKOUT_PAYMENT_METHOD_UPDATE,
  CHECK_JUSPAY_ORDER_STATUS,
  CHECK_VPA_ADDRESS,
  COMPLETE_CHECKOUT,
  CREATE_CASHFREE_ORDER,
  CREATE_CHECKOUT_MUTATION,
  CREATE_CHECKOUT_PAYMENT,
  CREATE_JUSPAY_CUSTOMER_AND_ORDER,
  CREATE_JUSPAY_PAYMENT,
  CREATE_RAZORPAY_ORDER,
  GET_WALLET_AMOUNT,
  PAYTM_TXN_CREATE,
  REMOVE_CHECKOUT_PROMO_CODE,
  UPDATE_CHECKOUT_ADDRESS_TYPE,
  UPDATE_CHECKOUT_BILLING_ADDRESS_MUTATION,
  UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION,
  UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
} from "../apollo/mutations";
import {
  GET_CHECKOUT_TOTALS,
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
  CreateCheckoutMutation,
  CreateCheckoutMutationVariables,
  CreateCheckoutPaymentMutation,
  CreateCheckoutPaymentMutationVariables,
  CreateRazorpayOrderMutation,
  CreateRazorpayOrderMutationVariables,
  GetWalletQuery,
  GetWalletQueryVariables,
  OrdersByUserQueryVariables,
  PaymentInput,
  PaytmTxnCreateMutation,
  PaytmTxnCreateMutationVariables,
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
  useOrdersByUserQuery,
  CreateCashfreeOrderMutation,
  CreateCashfreeOrderMutationVariables,
  UpdateCheckoutShippingMethodNextMutationVariables,
  UpdateCheckoutShippingMethodNextMutation,
  CheckoutCreateInput,
  CreateJuspayOrderAndCustomerMutation,
  CreateJuspayOrderAndCustomerMutationVariables,
  CheckJuspayOrderStatusMutationVariables,
  CheckJuspayOrderStatusMutation,
  VerifyJuspayVpaMutationVariables,
  VerifyJuspayVpaMutation,
  CheckoutTotalsQuery,
  CheckoutTotalsQueryVariables,
  CreateJuspayPaymentMutationVariables,
  CreateJuspayPaymentMutation,
  JuspayPaymentInput,
} from "../apollo/types";

import {
  CompleteCheckoutInput,
  CreatePaymentInput,
  IAddress,
  PaymentMethodUpdateInput,
} from "../apollo/types/checkout";
import { SALEOR_CHECKOUT, SALEOR_CHECKOUT_DISCOUNTS } from "./constants";
import { storage } from "./storage";
import {
  AddPromoCodeResult,
  CheckJuspayOrderStatusResult,
  CheckoutPaymentMethodUpdateResult,
  CheckoutTotalsResult,
  CompleteCheckoutResult,
  CreateCashfreeOrderResult,
  CreateCheckoutResult,
  CreatePaymentResult,
  CreatePaytmOrderResult,
  CreateRazorpayOrderResult,
  GetCityStateFromPincodeResult,
  GetUserOrdersResult,
  GetWalletAmountResult,
  JuspayOrderAndCustomerCreateResult,
  JuspayPaymentCreateResult,
  RemovePromoCodeResult,
  SaleorClientMethodsProps,
  SetAddressTypeResult,
  SetBillingAddressResult,
  SetShippingAddressResult,
  SetShippingAndBillingAddressResult,
  SetShippingMethodResult,
  VerifyJuspayVpaResult,
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
  ) => SetAddressTypeResult;
  createCheckout?: (tags?: string[]) => CreateCheckoutResult;
  setShippingAddress?: (
    shippingAddress: IAddress,
    email: string
  ) => SetShippingAddressResult;
  setShippingAndBillingAddress?: (
    shippingAddress: IAddress,
    email: string,
    updateShippingMethod?: boolean
  ) => SetShippingAndBillingAddressResult;

  setBillingAddress?: (billingAddress: IAddress, updateShippingMethod?: boolean) => SetBillingAddressResult;
  setShippingMethod?: (shippingMethodId: string) => SetShippingMethodResult;
  addPromoCode?: (promoCode: string) => AddPromoCodeResult;
  removePromoCode?: (promoCode: string) => RemovePromoCodeResult;
  checkoutPaymentMethodUpdate?: (
    input: PaymentMethodUpdateInput,
    updateShippingMethod?: boolean
  ) => CheckoutPaymentMethodUpdateResult;
  createPayment?: (input: CreatePaymentInput) => CreatePaymentResult;
  completeCheckout?: (input?: CompleteCheckoutInput) => CompleteCheckoutResult;
  getCityStateFromPincode?: (pincode: string) => GetCityStateFromPincodeResult;
  createRazorpayOrder?: () => CreateRazorpayOrderResult;
  juspayOrderAndCustomerCreate?: () => JuspayOrderAndCustomerCreateResult;
  juspayPaymentCreate?: (
    input: JuspayPaymentInput
  ) => JuspayPaymentCreateResult;
  checkJuspayOrderStatus?: () => CheckJuspayOrderStatusResult;
  juspayVpaVerify?: (vpa: string) => VerifyJuspayVpaResult;
  createPaytmOrder?: () => CreatePaytmOrderResult;
  getWalletAmount?: () => GetWalletAmountResult;
  getCheckoutTotals?: () => CheckoutTotalsResult;
  getUserOrders?: (opts: OrdersByUserQueryVariables) => GetUserOrdersResult;
  setUseCashback?: (useCashback: boolean) => {};
  setCheckout?: (checkout: any, fetchDiscount?: boolean) => {};
  createCashfreeOrder?: (returnURL?: string) => CreateCashfreeOrderResult;
}

export const checkout = ({
  apolloClient: client,
}: SaleorClientMethodsProps): CheckoutSDK => {
  const createCheckout: CheckoutSDK["createCheckout"] = async (
    tags?: string[]
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
    if (!(checkout && checkout?.id)) {
      let checkoutInputVariables: CheckoutCreateInput;
      if (tags) {
        checkoutInputVariables = {
          lines: [],
          email: "dummy@dummy.com",
          tags,
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
        };
      } else {
        checkoutInputVariables = {
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
        };
      }

      return await client.mutate<
        CreateCheckoutMutation,
        CreateCheckoutMutationVariables
      >({
        mutation: CREATE_CHECKOUT_MUTATION,
        variables: {
          checkoutInput: checkoutInputVariables,
        },
        update: (_, { data }) => {
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

      const res = await client.mutate<
        UpdateCheckoutShippingAddressMutation,
        UpdateCheckoutShippingAddressMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION,
        variables,
      });

      if (res?.data?.checkoutShippingAddressUpdate?.checkout?.id) {
        setLocalCheckoutInCache(
          client,
          res?.data?.checkoutShippingAddressUpdate?.checkout
        );
        storage.setCheckout(res?.data?.checkoutShippingAddressUpdate?.checkout);
      }

      return res;
    }

    return null;
  };

  const setBillingAddress: CheckoutSDK["setBillingAddress"] = async (
    billingAddress: IAddress,
    updateShippingMethod: boolean=false,
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
          setLocalCheckoutInCache(
            client,
            data?.checkoutBillingAddressUpdate?.checkout,
            updateShippingMethod
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
    email: string,
    updateShippingMethod: boolean=false,
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });

    const resShipping = await setShippingAddress(shippingAddress, email);
    const resBilling = await setBillingAddress(shippingAddress, updateShippingMethod);
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: false,
      },
    });
    // const dataError = resShipping?.errors || resBilling?.errors;
    //
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

    if (checkout && checkout?.id) {
      const variables: UpdateCheckoutShippingMethodNextMutationVariables = {
        checkoutId: checkout?.id,
        shippingMethodId,
      };

      const res = await client.mutate<
        UpdateCheckoutShippingMethodNextMutation,
        UpdateCheckoutShippingMethodNextMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
        variables,
        update: (_, { data }) => {
          if (data?.checkoutShippingMethodUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutShippingMethodUpdate?.checkout);
          }
          setLocalCheckoutInCache(
            client,
            data?.checkoutShippingMethodUpdate?.checkout,
            false
          );
        },
      });

      if (
        res.data?.checkoutShippingMethodUpdate?.errors &&
        res.data?.checkoutShippingMethodUpdate?.errors[0]?.code ===
          "NOT_FOUND" &&
        res.data?.checkoutShippingMethodUpdate?.errors[0]?.field ===
          "checkoutId" &&
        typeof window !== "undefined"
      ) {
        localStorage.removeItem(SALEOR_CHECKOUT);
        localStorage.removeItem(SALEOR_CHECKOUT_DISCOUNTS);
        window.location.reload();
      }

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

    if (checkout && checkout?.id) {
      const variables: AddCheckoutPromoCodeMutationVariables = {
        checkoutId: checkout?.id,
        promoCode,
      };

      const res = await client.mutate<
        AddCheckoutPromoCodeMutation,
        AddCheckoutPromoCodeMutationVariables
      >({
        mutation: ADD_CHECKOUT_PROMO_CODE,
        variables,
      });

      if (res?.data?.checkoutAddPromoCode?.checkout?.id) {
        storage.setCheckout(res?.data?.checkoutAddPromoCode?.checkout);
        const resDiscount = {
          data: {
            __typename: "DiscountsType",
            checkoutDiscounts: {
              prepaidDiscount:
                res?.data?.checkoutAddPromoCode?.checkout?.paymentMethod
                  ?.prepaidDiscountAmount,
              couponDiscount:
                res?.data?.checkoutAddPromoCode?.checkout?.paymentMethod
                  ?.couponDiscount,
              cashbackDiscount:
                res?.data?.checkoutAddPromoCode?.checkout?.paymentMethod
                  ?.cashbackDiscountAmount,
            },
            cashback: res?.data?.checkoutAddPromoCode?.checkout?.cashback,
          },
        };

        storage.setDiscounts(resDiscount.data);

        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            localCheckout: res?.data?.checkoutAddPromoCode?.checkout,
            localCheckoutDiscounts: resDiscount.data.checkoutDiscounts,
            localCashback: resDiscount.data.cashback,
          },
        });
      }

      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          checkoutLoading: false,
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

    if (checkout && checkout?.id) {
      const variables: RemoveCheckoutPromoCodeMutationVariables = {
        checkoutId: checkout?.id,
        promoCode,
      };

      const res = await client.mutate<
        RemoveCheckoutPromoCodeMutation,
        RemoveCheckoutPromoCodeMutationVariables
      >({
        mutation: REMOVE_CHECKOUT_PROMO_CODE,
        variables,
      });

      if (res?.data?.checkoutRemovePromoCode?.checkout?.id) {
        storage.setCheckout(res?.data?.checkoutRemovePromoCode?.checkout);
        const resDiscount = {
          data: {
            __typename: "DiscountsType",
            checkoutDiscounts: {
              prepaidDiscount:
                res?.data?.checkoutRemovePromoCode?.checkout?.paymentMethod
                  ?.prepaidDiscountAmount,
              couponDiscount:
                res?.data?.checkoutRemovePromoCode?.checkout?.paymentMethod
                  ?.couponDiscount,
              cashbackDiscount:
                res?.data?.checkoutRemovePromoCode?.checkout?.paymentMethod
                  ?.cashbackDiscountAmount,
            },
            cashback: res?.data?.checkoutRemovePromoCode?.checkout?.cashback,
          },
        };

        storage.setDiscounts(resDiscount.data);

        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            localCheckout: res?.data?.checkoutRemovePromoCode?.checkout,
            localCheckoutDiscounts: resDiscount.data.checkoutDiscounts,
            localCashback: resDiscount.data.cashback,
          },
        });
      }

      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          checkoutLoading: false,
        },
      });

      return res;
    }

    return null;
  };

  const checkoutPaymentMethodUpdate: CheckoutSDK["checkoutPaymentMethodUpdate"] = async (
    input: PaymentMethodUpdateInput,
    updateShippingMethod: boolean=true,
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
        useCashback: input.useCashback,
      },
    });

    storage.setUseCashback(input.useCashback);

    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;

    if (checkout && checkout?.id) {
      const variables: CheckoutPaymentMethodUpdateMutationVariables = {
        checkoutId: checkout?.id,
        gatewayId: input.gateway,
        useCashback: input.useCashback,
      };

      const res = await client.mutate<
        CheckoutPaymentMethodUpdateMutation,
        CheckoutPaymentMethodUpdateMutationVariables
      >({
        mutation: CHECKOUT_PAYMENT_METHOD_UPDATE,
        variables,
        update: (_, { data }) => {
          setLocalCheckoutInCache(
            client,
            data?.checkoutPaymentMethodUpdate?.checkout,
            updateShippingMethod
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

    if (checkout && checkout?.id) {
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
          setLocalCheckoutInCache(
            client,
            data?.checkoutPaymentCreate?.checkout
          );
          if (
            data?.checkoutPaymentCreate?.errors &&
            (data?.checkoutPaymentCreate?.errors[0]?.code === "NOT_FOUND" ||
              data?.checkoutPaymentCreate?.errors[0]?.code === "INVALID") &&
            data?.checkoutPaymentCreate?.errors[0]?.field === "checkoutId" &&
            typeof window !== "undefined"
          ) {
            localStorage.removeItem(SALEOR_CHECKOUT);
            localStorage.removeItem(SALEOR_CHECKOUT_DISCOUNTS);
            window.location.reload();
          }
          if (
            data?.checkoutPaymentCreate?.errors &&
            data?.checkoutPaymentCreate?.errors[0]?.code === "INVALID"
          ) {
            getLatestCheckout(client, checkout);
          }
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

    if (checkout && checkout?.id) {
      const paymentDataString =
        input?.paymentData && JSON.stringify(input?.paymentData);

      const variables: CompleteCheckoutMutationVariables = {
        checkoutId: checkout?.id,
        paymentData: paymentDataString,
        redirectUrl: input?.redirectUrl,
        storeSource: input?.storeSource,
      };
      try {
        const res = await client.mutate<
          CompleteCheckoutMutation,
          CompleteCheckoutMutationVariables
        >({
          mutation: COMPLETE_CHECKOUT,
          variables,
          update: async (_, { data }) => {
            if (data?.checkoutComplete?.order?.id) {
              if (!data?.checkoutComplete.confirmationNeeded) {
                await setLocalCheckoutInCache(client, {}, false, data);
                storage.setCheckout({});
              }
            }
          },
        });

        if (
          res?.data?.checkoutComplete?.errors &&
          res?.data?.checkoutComplete?.errors[0]?.code
        ) {
          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              checkoutLoading: false,
            },
          });
        }

        return res;
      } catch {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });
      }
      
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

    if (checkout && checkout?.id) {
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

      if (
        (res?.errors && res?.errors[0]?.message) ||
        (res?.data?.razorpayOrderCreate?.razorpayErrors &&
          res?.data?.razorpayOrderCreate?.razorpayErrors[0]?.message)
      ) {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });
      }
      return res;
    }

    return { data: null };
  };

  const juspayOrderAndCustomerCreate: CheckoutSDK["juspayOrderAndCustomerCreate"] = async () => {
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

    if (
      checkout &&
      checkout?.id &&
      checkout?.email &&
      checkout?.shippingAddress?.phone &&
      checkout?.shippingAddress?.firstName &&
      checkout?.shippingAddress?.lastName
    ) {
      const variables: CreateJuspayOrderAndCustomerMutationVariables = {
        input: {
          checkoutId: checkout?.id,
          emailAddress: checkout?.email,
          mobileNumber: checkout?.shippingAddress?.phone,
          mobileCountryCode: "91",
          firstName: checkout?.shippingAddress?.firstName,
          lastName: checkout?.shippingAddress?.lastName,
        },
      };
      const res = await client.mutate<
        CreateJuspayOrderAndCustomerMutation,
        CreateJuspayOrderAndCustomerMutationVariables
      >({
        mutation: CREATE_JUSPAY_CUSTOMER_AND_ORDER,
        variables,
        update: async () => {
          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              checkoutLoading: false,
            },
          });
        },
      });

      if (
        (res?.errors && res?.errors[0]?.message) ||
        (res?.data?.juspayOrderAndCustomerCreate?.errors &&
          res?.data?.juspayOrderAndCustomerCreate?.errors[0]?.message) ||
        (res?.data?.juspayOrderAndCustomerCreate?.juspayErrors &&
          res?.data?.juspayOrderAndCustomerCreate?.juspayErrors[0]?.message)
      ) {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });
      }
      return res;
    }

    return { data: null };
  };

  const checkJuspayOrderStatus: CheckoutSDK["checkJuspayOrderStatus"] = async () => {
    const checkoutString = storage.getCheckout();
    const checkout: Checkout | null | undefined =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;

    if (checkout && checkout?.id) {
      const variables: CheckJuspayOrderStatusMutationVariables = {
        input: {
          checkoutId: checkout?.id,
        },
      };
      const res = await client.mutate<
        CheckJuspayOrderStatusMutation,
        CheckJuspayOrderStatusMutationVariables
      >({
        mutation: CHECK_JUSPAY_ORDER_STATUS,
        variables,
      });
      return res;
    }

    return { data: null };
  };

  const juspayVpaVerify: CheckoutSDK["juspayVpaVerify"] = async (
    vpa: string
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    const variables: VerifyJuspayVpaMutationVariables = {
      input: {
        vpa: vpa,
      },
    };
    const res = await client.mutate<
      VerifyJuspayVpaMutation,
      VerifyJuspayVpaMutationVariables
    >({
      mutation: CHECK_VPA_ADDRESS,
      variables,
      update: async () => {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });
      },
    });

    if (
      (res?.errors && res?.errors[0]?.message) ||
      (res?.data?.juspayVerifyVpa?.juspayErrors &&
        res?.data?.juspayVerifyVpa?.juspayErrors[0]?.message)
    ) {
      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          checkoutLoading: false,
        },
      });
    }
    return res;
  };

  const juspayPaymentCreate: CheckoutSDK["juspayPaymentCreate"] = async (
    input: JuspayPaymentInput
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

    if (checkout && checkout?.id) {
      const variables: CreateJuspayPaymentMutationVariables = {
        input: {
          ...input,
          checkoutId: checkout?.id,
        },
      };
      const res = await client.mutate<
        CreateJuspayPaymentMutation,
        CreateJuspayPaymentMutationVariables
      >({
        mutation: CREATE_JUSPAY_PAYMENT,
        variables,
        update: async () => {
          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              checkoutLoading: false,
            },
          });
        },
      });

      if (
        (res?.errors && res?.errors[0]?.message) ||
        (res?.data?.juspayPayment?.errors &&
          res?.data?.juspayPayment?.errors[0]?.message) ||
        (res?.data?.juspayPayment?.juspayErrors &&
          res?.data?.juspayPayment?.juspayErrors[0]?.message)
      ) {
        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });
      }
      return res;
    }

    return { data: null };
  };

  const createPaytmOrder: CheckoutSDK["createPaytmOrder"] = async () => {
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

    if (checkout && checkout?.id) {
      const variables: PaytmTxnCreateMutationVariables = {
        input: {
          checkoutId: checkout?.id,
          email: checkout?.email,
        },
      };
      const res = await client.mutate<
        PaytmTxnCreateMutation,
        PaytmTxnCreateMutationVariables
      >({
        mutation: PAYTM_TXN_CREATE,
        variables,
        update: async () => {
          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              checkoutLoading: false,
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

  const getCheckoutTotals: CheckoutSDK["getCheckoutTotals"] = async () => {
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

    if (checkout && checkout?.token) {
      const res = await client.query<
        CheckoutTotalsQuery,
        CheckoutTotalsQueryVariables
      >({
        query: GET_CHECKOUT_TOTALS,
        variables: {
          token: checkout?.token,
        },
        fetchPolicy: "no-cache",
      });

      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          checkoutLoading: false,
        },
      });

      return res;
    }

    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: false,
      },
    });

    return null;
  };

  const getUserOrders: CheckoutSDK["getUserOrders"] = async (
    opts: OrdersByUserQueryVariables
  ) => {
    const res = useOrdersByUserQuery({
      variables: opts,
      client,
    });

    return res;
  };

  const setUseCashback: CheckoutSDK["setUseCashback"] = async (
    useCashback: boolean
  ) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
        useCashback: useCashback,
      },
    });

    storage.setUseCashback(useCashback);
  };

  const setCheckout: CheckoutSDK["setCheckout"] = async (
    checkout: any,
    fetchDiscount?: boolean
  ) => {
    if (checkout) {
      setLocalCheckoutInCache(client, checkout, fetchDiscount);
      storage.setCheckout(checkout);
    }
    return checkout;
  };

  const createCashfreeOrder: CheckoutSDK["createCashfreeOrder"] = async returnURL => {
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

    if (checkout && checkout?.id) {
      const variables: CreateCashfreeOrderMutationVariables = {
        input: {
          checkoutId: checkout?.id,
          returnUrl: returnURL || "/checkout/address",
        },
      };
      const res = await client.mutate<
        CreateCashfreeOrderMutation,
        CreateCashfreeOrderMutationVariables
      >({
        mutation: CREATE_CASHFREE_ORDER,
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
    juspayOrderAndCustomerCreate,
    checkJuspayOrderStatus,
    juspayVpaVerify,
    createPaytmOrder,
    getWalletAmount,
    getUserOrders,
    setUseCashback,
    setCheckout,
    createCashfreeOrder,
    getCheckoutTotals,
    juspayPaymentCreate,
  };
};
