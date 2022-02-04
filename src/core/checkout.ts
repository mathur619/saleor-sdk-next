import { setLocalCheckoutInCache } from "../apollo/helpers";
import {
  CREATE_CHECKOUT_MUTATION,
  UPDATE_CHECKOUT_ADDRESS_TYPE,
  UPDATE_CHECKOUT_BILLING_ADDRESS_MUTATION,
  UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION,
} from "../apollo/mutations";
import {
  AddressTypes,
  CountryCode,
  UpdateCheckoutAddressTypeMutation,
  UpdateCheckoutAddressTypeMutationVariables,
  UpdateCheckoutBillingAddressMutation,
  UpdateCheckoutBillingAddressMutationVariables,
  UpdateCheckoutShippingAddressMutation,
  UpdateCheckoutShippingAddressMutationVariables,
} from "../apollo/types";
import {
  CreateCheckout,
  CreateCheckoutVariables,
} from "../apollo/types/cartTypes";
import { IAddress } from "../apollo/types/checkout";
import { storage } from "./storage";
import { SaleorClientMethodsProps } from "./types";

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

  setAddressType?: (addressId: string, type: AddressTypes) => {};
  createCheckout?: () => {};
  setShippingAddress?: (shippingAddress: IAddress, email: string) => any;
  setShippingAndBillingAddress?: (
    shippingAddress: IAddress,
    email: string
  ) => {};
  setBillingAddress?: (billingAddress: IAddress) => any;
  setBillingAsShippingAddress?: () => {};
  setShippingMethod?: () => {};
  addPromoCode?: () => {};
  removePromoCode?: () => {};
  checkoutPaymentMethodUpdate?: () => {};
  createPayment?: () => {};
  completeCheckout?: () => {};
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
      await client.mutate<CreateCheckout, CreateCheckoutVariables>({
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
  };

  const setShippingAddress: CheckoutSDK["setShippingAddress"] = async (
    shippingAddress: IAddress,
    email: string
  ) => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout setShippingAddress", checkout, checkout?.id);
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
    if (checkout && checkout?.id) {
      console.log("checkout setShippingAddress in if");

      const { data, errors } = await client.mutate<
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

      return {
        data,
        errors,
      };
    }

    return { data: null };
  };

  const setBillingAddress: CheckoutSDK["setBillingAddress"] = async (
    billingAddress: IAddress
  ) => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("checkout setBillingAddress", checkout, checkout?.id);

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
    if (checkout && checkout?.id) {
      const { data, errors } = await client.mutate<
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
      return {
        data,
        errors,
      };
    }
    return { data: null };
  };

  const setShippingAndBillingAddress: CheckoutSDK["setShippingAddress"] = async (
    shippingAddress: IAddress,
    email: string
  ) => {
    console.log("setShippingAndBillingAddress");
    const resShipping = await setShippingAddress(shippingAddress, email);
    const resBilling = await setBillingAddress(shippingAddress);
    const dataError = resShipping.error || resBilling.error;
    console.log("setShippingAndBillingAddress", resShipping, resBilling);
    return {
      data: {
        billingData: resShipping.data,
        shippingData: resBilling.data,
      },
      dataError,
      pending: false,
    };
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
      await client.mutate<
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
  };

  return {
    createCheckout,
    setShippingAddress,
    setBillingAddress,
    setShippingAndBillingAddress,
    setAddressType,
  };
};
