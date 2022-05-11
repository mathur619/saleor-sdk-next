import { GET_LOCAL_CHECKOUT } from "../../apollo/queries";
import {
  GetLocalCheckoutQuery,
  GetLocalCheckoutQueryVariables,
} from "../../apollo/types";
import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

export const useCheckout = hookFactory("checkout");

export const useCheckoutState = () => {
  const { data } = hookStateFactory<
    GetLocalCheckoutQuery,
    GetLocalCheckoutQueryVariables
  >(GET_LOCAL_CHECKOUT);

  const placeholderData = {
    checkout: {
      items: [],
    },
    loaded: true,
    promoCodeDiscount: {
      voucherCode: null,
      discount: 0,
      discountName: "",
    },

    availableShippingMethods: [],

    availablePaymentGateways: [],

    useCashback: false,
    checkoutLoading: false,
    userWalletBalance: 0,
    recentOrder: null,
  };

  if (!data) {
    return placeholderData;
  }

  return {
    checkout: data.localCheckout,
    loaded: true,

    promoCodeDiscount: {
      voucherCode: data.localCheckout?.voucherCode,
      discount: data.localCheckout?.discount,
      discountName: data.localCheckout?.discountName,
    },

    availableShippingMethods: data.localCheckout?.availableShippingMethods,

    availablePaymentGateways: data.localCheckout?.availablePaymentGateways,

    useCashback: data.useCashback,
    checkoutLoading: data.checkoutLoading,
    userWalletBalance: data.userWalletBalance,
    recentOrder: data.recentOrder,
  };
};
