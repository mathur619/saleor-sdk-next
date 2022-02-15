import { SaleorClientMethodsProps } from ".";
import {
  CreateCheckout,
  CreateCheckoutVariables,
  UpdateCheckoutLine,
  UpdateCheckoutLineVariables,
} from "../apollo/types/cartTypes";
import { cartItemsVar } from "../apollo/client";
import { setLocalCheckoutInCache } from "../apollo/helpers";
import {
  ADD_CHECKOUT_LINE_MUTATION,
  CREATE_CHECKOUT_MUTATION,
  REMOVE_CHECKOUT_LINE_MUTATION,
  UPDATE_CHECKOUT_LINE_MUTATION,
} from "../apollo/mutations";
import { storage } from "./storage";
import {
  AddCheckoutLineMutation,
  AddCheckoutLineMutationVariables,
  Checkout,
  RemoveCheckoutLineMutation,
  RemoveCheckoutLineMutationVariables,
} from "../apollo/types";

export interface CartSDK {
  loaded?: boolean;

  items?: any;

  totalPrice?: any;

  subtotalPrice?: any;

  shippingPrice?: any;

  discount?: any;

  mrp?: any;

  netPrice?: any;

  itemDiscount?: any;

  offerDiscount?: any;

  prepaidDiscount?: any;

  cashbackDiscount?: any;

  cashbackRecieve?: any;

  addItem?: (variantId: string, quantity: number) => {};
  removeItem?: (variantId: string) => {};
  subtractItem?: (variantId: string, quantity: number) => {};
  updateItem?: (
    variantId: string,
    quantity: number,
    prevQuantity: number
  ) => {};
}

export const cart = ({
  apolloClient: client,
}: SaleorClientMethodsProps): CartSDK => {
  let items = cartItemsVar();

  const addItem: CartSDK["addItem"] = async (
    variantId: string,
    quantity: number
  ) => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;

    if (checkout && checkout?.token) {
      await client.mutate<
        AddCheckoutLineMutation,
        AddCheckoutLineMutationVariables
      >({
        mutation: ADD_CHECKOUT_LINE_MUTATION,
        variables: {
          checkoutId: checkout?.id,
          lines: [{ quantity: quantity, variantId: variantId }],
        },
        update: async (_, { data }) => {
          if (data?.checkoutLinesAdd?.checkout?.id) {
            storage.setCheckout(data?.checkoutLinesAdd?.checkout);
          }
          await setLocalCheckoutInCache(
            client,
            data?.checkoutLinesAdd?.checkout,
            true
          );
        },
      });
    } else {
      await client.mutate<CreateCheckout, CreateCheckoutVariables>({
        mutation: CREATE_CHECKOUT_MUTATION,
        variables: {
          checkoutInput: {
            lines: [{ quantity: quantity, variantId: variantId }],
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
          setLocalCheckoutInCache(client, data?.checkoutCreate?.checkout, true);
          if (data?.checkoutCreate?.checkout?.id) {
            storage.setCheckout(data?.checkoutCreate?.checkout);
          }
        },
      });
    }
  };

  const removeItem: CartSDK["removeItem"] = async (variantId: string) => {
    const checkoutString = storage.getCheckout();
    const checkout: Checkout | null =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    const lineToRemove =
      checkout && checkout?.lines?.find(line => line?.variant.id === variantId);
    const lineToRemoveId = lineToRemove?.id;

    if (checkout && checkout?.token) {
      await client.mutate<
        RemoveCheckoutLineMutation,
        RemoveCheckoutLineMutationVariables
      >({
        mutation: REMOVE_CHECKOUT_LINE_MUTATION,
        variables: {
          checkoutId: checkout?.id,
          lineId: lineToRemoveId,
        },
        update: async (_, { data }) => {
          if (data?.checkoutLineDelete?.checkout?.id) {
            storage.setCheckout(data?.checkoutLineDelete?.checkout);
          }
          await setLocalCheckoutInCache(
            client,
            data?.checkoutLineDelete?.checkout,
            true
          );
        },
      });
    }
  };

  const updateItem: CartSDK["updateItem"] = async (
    variantId: string,
    quantity: number,
    prevQuantity: number
  ) => {
    const checkoutString = storage.getCheckout();
    console.log("prevQuantity", prevQuantity);
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    const alteredLines =
      checkout &&
      checkout?.lines.map((line: any) => ({
        quantity: line.quantity,
        variantId: line.variant.id,
      }));
    if (alteredLines && alteredLines.length) {
      alteredLines.push({ quantity: quantity, variantId: variantId });
    }
    if (checkout && checkout?.token) {
      await client.mutate<UpdateCheckoutLine, UpdateCheckoutLineVariables>({
        mutation: UPDATE_CHECKOUT_LINE_MUTATION,
        variables: {
          checkoutId: checkout?.id,
          lines: alteredLines,
        },
        update: async (_, { data }) => {
          if (data?.checkoutLinesUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutLinesUpdate?.checkout);
          }
          await setLocalCheckoutInCache(
            client,
            data?.checkoutLinesUpdate?.checkout,
            true
          );
        },
      });
    }
  };

  return {
    items,
    addItem,
    removeItem,
    updateItem,
  };
};
