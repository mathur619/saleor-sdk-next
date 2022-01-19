import { SaleorClientMethodsProps } from ".";
import {
  CreateCheckout,
  CreateCheckoutVariables,
  UpdateCheckoutLine,
  UpdateCheckoutLineVariables,
} from "../apollo/cartTypes";
import {
  CREATE_CHECKOUT_MUTATION,
  UPDATE_CHECKOUT_LINE_MUTATION,
} from "../apollo/mutations";
import { storage } from "./storage";

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
  removeItem?: () => {};
  subtractItem?: () => {};
  updateItem?: () => {};
}

export const cart = ({
  apolloClient: client,
}: SaleorClientMethodsProps): CartSDK => {
  const checkout = storage.getCheckout();

  const items = checkout?.lines || [];

  const addItem: CartSDK["addItem"] = async (
    variantId: string,
    quantity: number
  ) => {
    const checkout = storage.getCheckout();
    const alteredLines = checkout?.lines
      .map((line: any) => ({
        quantity: line.quantity,
        variantId: line.variant.id,
      }))
      .push({ quantity: quantity, variantId: variantId });
    if (checkout?.id) {
      await client.mutate<UpdateCheckoutLine, UpdateCheckoutLineVariables>({
        mutation: UPDATE_CHECKOUT_LINE_MUTATION,
        variables: {
          checkoutId: checkout?.id,
          lines: alteredLines,
        },
        update: (_, { data }) => {
          if (data?.checkoutLinesUpdate?.checkout?.id) {
            storage.setCheckout(data?.checkoutLinesUpdate?.checkout);
          }
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
          if (data?.checkoutCreate?.checkout?.id) {
            storage.setCheckout(data?.checkoutCreate?.checkout);
          }
        },
      });
    }
  };

  return {
    items,
    addItem,
  };
};

//  variables: {
//   email: user?.email || "anonymous@example.com",
//   channel: currentChannel.slug,
//   lines: [
//     {
//       quantity: 1,
//       variantId: selectedVariantID,
//     },
//   ],
// },
