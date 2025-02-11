import {
  AddItemResult,
  RemoveItemResult,
  SaleorClientMethodsProps,
  UpdateItemResult,
} from ".";

import { cartItemsVar } from "../apollo/client";
import { setLocalCheckoutInCache } from "../apollo/helpers";
import {
  ADD_CHECKOUT_LINE_MUTATION,
  CHECKOUT_VERIFY_FOR_WAREHOUSE,
  CREATE_CHECKOUT_MUTATION,
  REMOVE_CHECKOUT_LINE_MUTATION,
  UPDATE_CHECKOUT_LINE_MUTATION,
} from "../apollo/mutations";
import { storage } from "./storage";
import {
  AddCheckoutLineMutation,
  AddCheckoutLineMutationVariables,
  Checkout,
  CheckoutLine,
  CheckoutLineInput,
  CreateCheckoutMutation,
  CreateCheckoutMutationVariables,
  Maybe,
  RemoveCheckoutLineMutation,
  RemoveCheckoutLineMutationVariables,
  UpdateCheckoutLineMutation,
  UpdateCheckoutLineMutationVariables,
} from "../apollo/types";
import { GET_LOCAL_CHECKOUT } from "../apollo/queries";
import { dummyCheckoutFields } from "../constants";

interface AtcPayload {
  checkoutId: string;
  isRecalculate: boolean;
  lines: Array<{variantId:string,quantity:number}>;
  checkoutMetadataInput?: Array<{key:string,value:string}>;
}
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
  getItems:() => CheckoutLine[];

  addItem: (variantId: string, quantity: number) => AddItemResult;
  addItemRest: (atcPayload: AtcPayload) => Promise<{data:any,errors:{message:any}[] | null} | null>;
  removeItem: (variantId: string) => RemoveItemResult;
  removeItemRest: (variantId: string,checkoutMetadataInput: Array<{key:string,value:string}>) => Promise<{data:any,errors:{message:any}[] | null} | null>;
  subtractItem?: (variantId: string, quantity: number) => {};
  updateItem: (
    variantId: string,
    quantity: number,
    prevQuantity: number
  ) => UpdateItemResult;
  updateItemRest: (
    updatePayload: AtcPayload
  ) => any;
  updateItemWithLines: (
    updatedLines: Array<Maybe<CheckoutLineInput>>
  ) => UpdateItemResult;
  clearCart?: () => UpdateItemResult;
  updateCartAccordingLocation: (warehouseId: string) => any;
}

export const cart = ({
  apolloClient: client,
  restApiUrl
}: SaleorClientMethodsProps): CartSDK => {
  let items = cartItemsVar();

  const getItems: CartSDK["getItems"] = () => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    const checkoutlines = checkout?.lines;
    return checkoutlines;
  }

  const clearCart: CartSDK["clearCart"] = async () => {
    const checkoutString = storage.getCheckout();

    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    const alteredLines =
      checkout &&
      checkout?.lines?.map((line: any) => ({
        quantity: 0,
        variantId: line?.variant?.id,
      }));

    if (checkout && checkout?.token) {
      const res = await client.mutate<
        UpdateCheckoutLineMutation,
        UpdateCheckoutLineMutationVariables
      >({
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
      return {
        data: res.data?.checkoutLinesUpdate?.checkout,
        errors: res.data?.checkoutLinesUpdate?.errors,
      };
    }

    return null;
  };

  const addItemRest: CartSDK["addItemRest"] = async (
    atcPayload
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

    if (!atcPayload?.checkoutId) {
      const localWarehouse = checkout?.metadata?.find(item => item?.key === 'warehouse_id')?.value;
      const currentWarehouse = atcPayload?.checkoutMetadataInput?.find(item => item?.key === 'warehouse_id')?.value;
      const payload = {
        checkoutId: checkout?.id,
        lines: atcPayload?.lines,
        isRecalculate: atcPayload?.isRecalculate
      };
      if (localWarehouse !== currentWarehouse) {
        payload.checkoutMetadataInput = atcPayload?.checkoutMetadataInput;
      }
      atcPayload = payload;
    }

    if (checkout && checkout?.token) {
      const resJson = await fetch(`${restApiUrl}/rest/add_to_cart/`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(atcPayload),
      }
      );
      const resData = await resJson.json();

      const res={
        data:resData,
        errors: resData?.message ? [{message:resData?.message}] : null
      }
      console.log('response json for add to cart',resJson, res);
      const updatedMetadata = {
        ...dummyCheckoutFields,
        ...checkout,
        ...resData
      }

      if(resJson?.ok){
        if (resData?.id) {
          storage.setCheckout(updatedMetadata);
        }
        await setLocalCheckoutInCache(
          client,
          updatedMetadata,
          true
        );
      }
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

  const addItem: CartSDK["addItem"] = async (
    variantId: string,
    quantity: number
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

    if (checkout && checkout?.token) {
      const res = await client.mutate<
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
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code === "NOT_FOUND" &&
        res.data?.checkoutLinesAdd?.errors[0]?.field === "checkoutId" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
      // if (
      //   res.data?.checkoutLinesAdd?.errors &&
      //   res.data?.checkoutLinesAdd?.errors[0]?.code ===
      //     "PRODUCT_NOT_PUBLISHED" &&
      //   typeof window !== "undefined"
      // ) {
      //   await clearCart();
      // }
      // if (
      //   res.data?.checkoutLinesAdd?.errors &&
      //   res.data?.checkoutLinesAdd?.errors[0]?.code ===
      //     "PRODUCT_UNAVAILABLE_FOR_PURCHASE" &&
      //   typeof window !== "undefined"
      // ) {
      //   await clearCart();
      // }
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code === "GRAPHQL_ERROR" &&
        res.data?.checkoutLinesAdd?.errors[0]?.field === "variantId" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
      const returnObject = {
        data: res.data?.checkoutLinesAdd?.checkout,
        errors: res.data?.checkoutLinesAdd?.errors,
      };
      return returnObject;
    } else {
      const res = await client.mutate<
        CreateCheckoutMutation,
        CreateCheckoutMutationVariables
      >({
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
          setLocalCheckoutInCache(client, data?.checkoutCreate?.checkout, true);
          if (data?.checkoutCreate?.checkout?.id) {
            storage.setCheckout(data?.checkoutCreate?.checkout);
          }
        },
      });
      const returnObject = {
        data: res.data?.checkoutCreate?.checkout,
        errors: res.data?.checkoutCreate?.errors,
      };
      return returnObject;
    }
  };

  const removeItemRest: CartSDK["removeItemRest"] = async (variantId: string, checkoutMetadataInput: Array<{key:string,value:string}>) => {
    client.writeQuery({
      query: GET_LOCAL_CHECKOUT,
      data: {
        checkoutLoading: true,
      },
    });
    
    const checkoutString = storage.getCheckout();
    const checkout: Checkout | null =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;

    if (checkout && checkout?.token) {
      // const res = await client.mutate<
      //   RemoveCheckoutLineMutation,
      //   RemoveCheckoutLineMutationVariables
      // >({
      //   mutation: REMOVE_CHECKOUT_LINE_MUTATION,
      //   variables: {
      //     checkoutId: checkout?.id,
      //     lineId: lineToRemoveId,
      //   },
      //   update: async (_, { data }) => {
      //     if (data?.checkoutLineDelete?.checkout?.id) {
      //       storage.setCheckout(data?.checkoutLineDelete?.checkout);
      //     }
      //     await setLocalCheckoutInCache(
      //       client,
      //       data?.checkoutLineDelete?.checkout,
      //       true
      //     );
      //   },
      // });
      const obj = {
        checkoutId: checkout?.id,
        lines: [
          {
            quantity: 0,
            variantId: variantId
          },
        ],
        checkoutMetadataInput,
        isRecalculate: true,
      }  
      const resJson = await fetch(`${restApiUrl}/rest/update_cart/`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      }
      );
      const resData = await resJson.json();
      const res={
        data:resData,
        errors: resData?.message ? [{message:resData?.message}] : null
      }
      console.log('response json for remove cart',resJson, res);
      const updatedMetadata = {
        ...dummyCheckoutFields,
        ...checkout,
        ...resData
      };

      if(resJson?.ok){
        console.log('response json for remove cart if success',resJson);
        if (resData?.id) {
          storage.setCheckout(updatedMetadata);
        }
        await setLocalCheckoutInCache(
          client,
          updatedMetadata,
          true
        );
      }
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
      const res = await client.mutate<
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

      if (
        res.data?.checkoutLineDelete?.errors &&
        res.data?.checkoutLineDelete?.errors[0]?.code === "NOT_FOUND" &&
        res.data?.checkoutLineDelete?.errors[0]?.field === "checkoutId" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
      if (
        res.data?.checkoutLineDelete?.errors &&
        res.data?.checkoutLineDelete?.errors[0]?.code ===
        "PRODUCT_NOT_PUBLISHED" &&
        typeof window !== "undefined"
      ) {
        await clearCart();
      }
      if (
        res.data?.checkoutLineDelete?.errors &&
        res.data?.checkoutLineDelete?.errors[0]?.code ===
        "PRODUCT_UNAVAILABLE_FOR_PURCHASE" &&
        typeof window !== "undefined"
      ) {
        await clearCart();
      }
      if (
        res.data?.checkoutLineDelete?.errors &&
        res.data?.checkoutLineDelete?.errors[0]?.code === "GRAPHQL_ERROR" &&
        res.data?.checkoutLineDelete?.errors[0]?.field === "variantId" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }

      return {
        data: res.data?.checkoutLineDelete?.checkout,
        errors: res.data?.checkoutLineDelete?.errors,
      };
    }
    return null;
  };

  const updateItemRest: CartSDK["updateItemRest"] = async (
    updatePayload
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

      if (!updatePayload?.checkoutId) {
        const localWarehouse = checkout?.metadata?.find(item => item?.key === 'warehouse_id')?.value;
        const currentWarehouse = updatePayload?.checkoutMetadataInput?.find(item => item?.key === 'warehouse_id')?.value;
        const payload = {
          checkoutId: checkout?.id,
          lines: updatePayload?.lines,
          isRecalculate: updatePayload?.isRecalculate
        };
        if (localWarehouse !== currentWarehouse) {
          payload.checkoutMetadataInput = updatePayload?.checkoutMetadataInput;
        }
        updatePayload = payload;
      }

      if (checkout && checkout?.token) {
        const resJson = await fetch(`${restApiUrl}/rest/update_cart/`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
        );
        const resData = await resJson.json();
        const res={
          data:resData,
          errors: resData?.message ? [{message:resData?.message}] : null
        }
        console.log("response json for update cart",res,resJson);
        const updatedMetadata = {
          ...dummyCheckoutFields,
          ...checkout,
          ...resData
        }

        if(resJson?.ok){
          if (resData?.id) {
            storage.setCheckout(updatedMetadata);
          }
          await setLocalCheckoutInCache(
            client,
            updatedMetadata,
            true
          );
        }
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

  const updateItem: CartSDK["updateItem"] = async (
    variantId: string,
    quantity: number,
    prevQuantity: number,
    updatedLines?: Array<Maybe<CheckoutLineInput>> | Maybe<CheckoutLineInput>
  ) => {
    const differenceQuantity = quantity - prevQuantity;
    if (differenceQuantity > 0) {
      const res = await addItem(variantId, differenceQuantity);
      return res;
    } else {
      const checkoutString = storage.getCheckout();

      const checkout =
        checkoutString && typeof checkoutString === "string"
          ? JSON.parse(checkoutString)
          : checkoutString;
      const alteredLines =
        checkout &&
        checkout?.lines
          .filter((line: any) => line.variant.id !== variantId)
          .map((line: any) => ({
            quantity: line.quantity,
            variantId: line.variant.id,
          }));

      alteredLines.push({ quantity: quantity, variantId: variantId });

      if (checkout && checkout?.token) {
        const res = await client.mutate<
          UpdateCheckoutLineMutation,
          UpdateCheckoutLineMutationVariables
        >({
          mutation: UPDATE_CHECKOUT_LINE_MUTATION,
          variables: {
            checkoutId: checkout?.id,
            lines: updatedLines || alteredLines,
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
        return {
          data: res.data?.checkoutLinesUpdate?.checkout,
          errors: res.data?.checkoutLinesUpdate?.errors,
        };
      }
    }
    return null;
  };

  const updateItemWithLines: CartSDK["updateItemWithLines"] = async (
    updatedLines: Array<Maybe<CheckoutLineInput>>
  ) => {
    const checkoutString = storage.getCheckout();

    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;

    if (checkout && checkout?.token) {
      const res = await client.mutate<
        UpdateCheckoutLineMutation,
        UpdateCheckoutLineMutationVariables
      >({
        mutation: UPDATE_CHECKOUT_LINE_MUTATION,
        variables: {
          checkoutId: checkout?.id,
          lines: updatedLines,
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
      return {
        data: res.data?.checkoutLinesUpdate?.checkout,
        errors: res.data?.checkoutLinesUpdate?.errors,
      };
    } else {
      const res = await client.mutate<
        CreateCheckoutMutation,
        CreateCheckoutMutationVariables
      >({
        mutation: CREATE_CHECKOUT_MUTATION,
        variables: {
          checkoutInput: {
            lines: updatedLines || [],
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
          setLocalCheckoutInCache(client, data?.checkoutCreate?.checkout, true);
          if (data?.checkoutCreate?.checkout?.id) {
            storage.setCheckout(data?.checkoutCreate?.checkout);
          }
        },
      });
      const returnObject = {
        data: res.data?.checkoutCreate?.checkout,
        errors: res.data?.checkoutCreate?.errors,
      };
      return returnObject;
    }
  };

  const updateCartAccordingLocation: CartSDK["updateCartAccordingLocation"] = async (warehouseId: string) => {
    const checkoutString = storage.getCheckout();
    const checkout =
      checkoutString && typeof checkoutString === "string"
        ? JSON.parse(checkoutString)
        : checkoutString;
    if(checkout?.id && warehouseId){
      const res = await client.mutate<any, any>({
        mutation: CHECKOUT_VERIFY_FOR_WAREHOUSE,
        variables: {
          checkoutId: checkout?.id,
          warehouseId: warehouseId,
        },
        update: async (_, { data }) => {
          if (data?.checkoutVerifyForWarehouse?.checkout?.id) {
            storage.setCheckout(data?.checkoutVerifyForWarehouse?.checkout);
          }
          await setLocalCheckoutInCache(
            client,
            data?.checkoutVerifyForWarehouse?.checkout,
            true
          );
        },
      });
      return {
        data: res?.data?.checkoutVerifyForWarehouse?.checkout,
        errors: res?.data?.checkoutVerifyForWarehouse?.errors,
      }
    }
  };

  return {
    items,
    getItems,
    clearCart,
    addItem,
    addItemRest,
    removeItem,
    removeItemRest,
    updateItem,
    updateItemRest,
    updateItemWithLines,
    updateCartAccordingLocation,
  };
};