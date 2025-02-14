import { GET_LOCAL_CHECKOUT } from "../../apollo/queries";
import {
  GetLocalCheckoutQuery,
  GetLocalCheckoutQueryVariables,
} from "../../apollo/types";
import { hookFactory } from "../helpers/hookFactory";
import { hookStateFactory } from "../helpers/hookStateFactory";

export const useCheckout = hookFactory("checkout");

export const useCheckoutState = () => {
  const res = hookStateFactory<
    GetLocalCheckoutQuery,
    GetLocalCheckoutQueryVariables
  >(GET_LOCAL_CHECKOUT);

  const { data, error, networkStatus, previousData, loading, refetch } = res;

  console.log("useCheckoutState", {
    res,
    data,
    error,
    networkStatus,
    previousData,
    loading,
  });

  if (!data) {
    // throw new Error(
    //   "Cache query result is undefined. Invalid cache configuration."
    // );
  }
  if(!data?.localCheckout) refetch(GET_LOCAL_CHECKOUT);

  return {
    checkout: data?.localCheckout,
    loaded: true,

    promoCodeDiscount: {
      voucherCode: data?.localCheckout?.voucherCode,
      discount: data?.localCheckout?.discount,
      discountName: data?.localCheckout?.discountName,
    },

    availableShippingMethods: data?.localCheckout?.availableShippingMethods,

    availablePaymentGateways: data?.localCheckout?.availablePaymentGateways,

    useCashback: data?.useCashback,
    checkoutLoading: data?.checkoutLoading,
    userWalletBalance: data?.userWalletBalance,
    recentOrder: data?.recentOrder,
  };
};
