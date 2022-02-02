import { SaleorClientMethodsProps } from ".";
import {
  CreateCheckout,
  CreateCheckoutVariables,
  UpdateCheckoutLine,
  UpdateCheckoutLineVariables,
} from "../apollo/cartTypes";
import { cartItemsVar } from "../apollo/client";
import { setLocalCheckoutInCache } from "../apollo/helpers";
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
  const checkoutString = storage.getCheckout();
  const checkout = JSON.parse(checkoutString);
  console.log("in cart sdk ", checkout);

  let items = cartItemsVar();

  console.log("items", items);
  const addItem: CartSDK["addItem"] = async (
    variantId: string,
    quantity: number
  ) => {
    const checkoutString = storage.getCheckout();
    console.log("checkoutString", checkoutString);
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    console.log("addItem checkout 1", checkout?.lines);
    const alteredLines =
      checkout &&
      checkout?.lines.map((line: any) => ({
        quantity: line.quantity,
        variantId: line.variant.id,
      }));
    if (alteredLines && alteredLines.length) {
      alteredLines.push({ quantity: quantity, variantId: variantId });
    }
    console.log("addItem checkout ", alteredLines);
    if (checkout && checkout?.token) {
      console.log("in if");

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
          setLocalCheckoutInCache(client, data?.checkoutLinesUpdate?.checkout);
        },
      });
    } else {
      console.log("in else");
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
          setLocalCheckoutInCache(client, data?.checkoutCreate?.checkout);
          if (data?.checkoutCreate?.checkout?.id) {
            // items = data?.checkoutCreate?.checkout?.lines;
            // cartItemsVar(data?.checkoutCreate?.checkout?.lines);

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
