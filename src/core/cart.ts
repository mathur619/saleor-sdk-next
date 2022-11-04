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
  ADD_CHECKOUT_LINE_MUTATION_NEXT,
  CREATE_CHECKOUT_MUTATION,
  CREATE_CHECKOUT_MUTATION_NEXT,
  REMOVE_CHECKOUT_LINE_MUTATION,
  UPDATE_CHECKOUT_LINE_MUTATION,
  UPDATE_CHECKOUT_LINE_MUTATION_NEXT,
  UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
} from "../apollo/mutations";
import { storage } from "./storage";
import {
  AddCheckoutLineMutation,
  AddCheckoutLineMutationVariables,
  AddCheckoutLineNextMutation,
  AddCheckoutLineNextMutationVariables,
  Checkout,
  CheckoutCreateInput,
  CheckoutDetailsNextQuery,
  CheckoutDetailsNextQueryVariables,
  CreateCheckoutMutation,
  CreateCheckoutMutationVariables,
  CreateCheckoutNextMutation,
  CreateCheckoutNextMutationVariables,
  RemoveCheckoutLineMutation,
  RemoveCheckoutLineMutationVariables,
  UpdateCheckoutLineMutation,
  UpdateCheckoutLineMutationVariables,
  UpdateCheckoutLineNextMutation,
  UpdateCheckoutLineNextMutationVariables,
  UpdateCheckoutShippingMethodNextMutation,
  UpdateCheckoutShippingMethodNextMutationVariables,
} from "../apollo/types";
import { CHECKOUT_DETAILS_NEXT, GET_LOCAL_CHECKOUT } from "../apollo/queries";

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

  addItem: (
    variantId: string,
    quantity: number,
    tags?: string[]
  ) => AddItemResult;
  removeItem: (variantId: string) => RemoveItemResult;
  subtractItem?: (variantId: string, quantity: number) => {};
  updateItem: (
    variantId: string,
    quantity: number,
    prevQuantity: number
  ) => UpdateItemResult;
  addToCartNext: (
    variantId: string,
    quantity: number,
    tags?: string[]
  ) => AddItemResult;
  updateItemNext: (
    variantId: string,
    quantity: number,
    prevQuantity: number
  ) => UpdateItemResult;
}

export const cart = ({
  apolloClient: client,
}: SaleorClientMethodsProps): CartSDK => {
  let items = cartItemsVar();

  const addItem: CartSDK["addItem"] = async (
    variantId: string,
    quantity: number,
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
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code ===
          "PRODUCT_NOT_PUBLISHED" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code ===
          "PRODUCT_UNAVAILABLE_FOR_PURCHASE" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
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
      let checkoutInputVariables: CheckoutCreateInput;
      if (tags) {
        checkoutInputVariables = {
          lines: [{ quantity: quantity, variantId: variantId }],
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
        };
      }
      const res = await client.mutate<
        CreateCheckoutMutation,
        CreateCheckoutMutationVariables
      >({
        mutation: CREATE_CHECKOUT_MUTATION,
        variables: {
          checkoutInput: checkoutInputVariables,
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
        window.localStorage?.clear();
        window.location?.reload();
      }
      if (
        res.data?.checkoutLineDelete?.errors &&
        res.data?.checkoutLineDelete?.errors[0]?.code ===
          "PRODUCT_UNAVAILABLE_FOR_PURCHASE" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
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

  const updateItem: CartSDK["updateItem"] = async (
    variantId: string,
    quantity: number,
    prevQuantity: number
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
    }
    return null;
  };

  const addToCartNext: CartSDK["addToCartNext"] = async (
    variantId: string,
    quantity: number,
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

    if (checkout && checkout?.token) {
      const res = await client.mutate<
        AddCheckoutLineNextMutation,
        AddCheckoutLineNextMutationVariables
      >({
        mutation: ADD_CHECKOUT_LINE_MUTATION_NEXT,
        variables: {
          checkoutId: checkout?.id,
          lines: [{ quantity: quantity, variantId: variantId }],
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
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code ===
          "PRODUCT_NOT_PUBLISHED" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code ===
          "PRODUCT_UNAVAILABLE_FOR_PURCHASE" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }
      if (
        res.data?.checkoutLinesAdd?.errors &&
        res.data?.checkoutLinesAdd?.errors[0]?.code === "GRAPHQL_ERROR" &&
        res.data?.checkoutLinesAdd?.errors[0]?.field === "variantId" &&
        typeof window !== "undefined"
      ) {
        window.localStorage?.clear();
        window.location?.reload();
      }

      const variables: UpdateCheckoutShippingMethodNextMutationVariables = {
        checkoutId: res?.data?.checkoutLinesAdd?.checkout?.id,
        shippingMethodId: res?.data?.checkoutLinesAdd?.checkout?.availableShippingMethods[0]?.id,
      };

      try {
        const resShipping = await client.mutate<
          UpdateCheckoutShippingMethodNextMutation,
          UpdateCheckoutShippingMethodNextMutationVariables
        >({
          mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
          variables,
        });

        if (resShipping.data?.checkoutShippingMethodUpdate?.checkout?.id) {
          storage.setCheckout(
            resShipping.data?.checkoutShippingMethodUpdate?.checkout
          );
          const res = {
            data: {
              checkoutDiscounts: {
                prepaidDiscount:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.paymentMethod?.prepaidDiscountAmount,
                couponDiscount:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.paymentMethod?.couponDiscount,
                cashbackDiscount:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.paymentMethod?.cashbackDiscountAmount,
              },
              cashback:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout
                  ?.cashback,
            },
          };

          storage.setDiscounts(res.data);

          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              localCheckout:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout,
              localCheckoutDiscounts: res.data.checkoutDiscounts,
              localCashback: res.data.cashback,
            },
          });
        } else {
          throw new Error("UpdateCheckoutShippingMethodNext failed");
        }
        var returnObject = {
          data: resShipping.data?.checkoutShippingMethodUpdate?.checkout,
          errors: resShipping?.data?.checkoutShippingMethodUpdate?.errors,
        };
      } catch {
        //fallback if the mutation fails
        const checkoutDetailRes = await client.query<
          CheckoutDetailsNextQuery,
          CheckoutDetailsNextQueryVariables
        >({
          query: CHECKOUT_DETAILS_NEXT,
          variables: checkout?.token,
        });
        if (checkoutDetailRes?.data?.checkout?.id) {
          storage.setCheckout(checkoutDetailRes?.data?.checkout);
          const res = {
            data: {
              checkoutDiscounts: {
                prepaidDiscount:
                  checkoutDetailRes?.data?.checkout?.paymentMethod
                    ?.prepaidDiscountAmount,
                couponDiscount:
                  checkoutDetailRes?.data?.checkout?.paymentMethod
                    ?.couponDiscount,
                cashbackDiscount:
                  checkoutDetailRes?.data?.checkout?.paymentMethod
                    ?.cashbackDiscountAmount,
              },
              cashback: checkoutDetailRes?.data?.checkout?.cashback,
            },
          };

          storage.setDiscounts(res.data);

          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              localCheckout: checkoutDetailRes?.data?.checkout,
              localCheckoutDiscounts: res.data.checkoutDiscounts,
              localCashback: res.data.cashback,
            },
          });
        }
        // @ts-ignore
        var returnObject = {
          data: checkoutDetailRes?.data?.checkout,
          errors: checkoutDetailRes?.errors,
        };
      }

      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          checkoutLoading: false,
        },
      });

      return returnObject;
    } else {
      let checkoutInputVariables: CheckoutCreateInput;
      if (tags) {
        checkoutInputVariables = {
          lines: [{ quantity: quantity, variantId: variantId }],
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
        };
      }
      const res = await client.mutate<
        CreateCheckoutNextMutation,
        CreateCheckoutNextMutationVariables
      >({
        mutation: CREATE_CHECKOUT_MUTATION_NEXT,
        variables: {
          checkoutInput: checkoutInputVariables,
        },
      });
      const checkout = res?.data?.checkoutCreate?.checkout;
      const variables: UpdateCheckoutShippingMethodNextMutationVariables = {
        checkoutId: checkout?.id,
        shippingMethodId: checkout?.availableShippingMethods[0]?.id,
      };

      try {
        const resShipping = await client.mutate<
          UpdateCheckoutShippingMethodNextMutation,
          UpdateCheckoutShippingMethodNextMutationVariables
        >({
          mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
          variables,
        });

        if (resShipping.data?.checkoutShippingMethodUpdate?.checkout?.id) {
          storage.setCheckout(
            resShipping.data?.checkoutShippingMethodUpdate?.checkout
          );
          const res = {
            data: {
              checkoutDiscounts: {
                prepaidDiscount:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.paymentMethod?.prepaidDiscountAmount,
                couponDiscount:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.paymentMethod?.couponDiscount,
                cashbackDiscount:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.paymentMethod?.cashbackDiscountAmount,
              },
              cashback:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout
                  ?.cashback,
            },
          };

          storage.setDiscounts(res.data);

          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              localCheckout:
                resShipping.data?.checkoutShippingMethodUpdate?.checkout,
              localCheckoutDiscounts: res.data.checkoutDiscounts,
              localCashback: res.data.cashback,
            },
          });
        } else {
          throw new Error("UpdateCheckoutShippingMethodNext failed");
        }
        var returnObject = {
          data: resShipping.data?.checkoutShippingMethodUpdate?.checkout,
          errors: resShipping?.data?.checkoutShippingMethodUpdate?.errors,
        };
      } catch {
        //fallback if the mutation fails
        const checkoutDetailRes = await client.query<
          CheckoutDetailsNextQuery,
          CheckoutDetailsNextQueryVariables
        >({
          query: CHECKOUT_DETAILS_NEXT,
          variables: checkout?.token,
        });
        if (checkoutDetailRes?.data?.checkout?.id) {
          storage.setCheckout(checkoutDetailRes?.data?.checkout);
          const res = {
            data: {
              checkoutDiscounts: {
                prepaidDiscount:
                  checkoutDetailRes?.data?.checkout?.paymentMethod
                    ?.prepaidDiscountAmount,
                couponDiscount:
                  checkoutDetailRes?.data?.checkout?.paymentMethod
                    ?.couponDiscount,
                cashbackDiscount:
                  checkoutDetailRes?.data?.checkout?.paymentMethod
                    ?.cashbackDiscountAmount,
              },
              cashback: checkoutDetailRes?.data?.checkout?.cashback,
            },
          };

          storage.setDiscounts(res.data);

          client.writeQuery({
            query: GET_LOCAL_CHECKOUT,
            data: {
              localCheckout: checkoutDetailRes?.data?.checkout,
              localCheckoutDiscounts: res.data.checkoutDiscounts,
              localCashback: res.data.cashback,
            },
          });
        }
        // @ts-ignore
        var returnObject = {
          data: checkoutDetailRes?.data?.checkout,
          errors: checkoutDetailRes?.errors,
        };
      }
      client.writeQuery({
        query: GET_LOCAL_CHECKOUT,
        data: {
          checkoutLoading: false,
        },
      });
      return returnObject;
    }
  };

  const updateItemNext: CartSDK["updateItemNext"] = async (
    variantId: string,
    quantity: number,
    prevQuantity: number
  ) => {
    const differenceQuantity = quantity - prevQuantity;
    if (differenceQuantity > 0) {
      const res = await addToCartNext(variantId, differenceQuantity);
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
          UpdateCheckoutLineNextMutation,
          UpdateCheckoutLineNextMutationVariables
        >({
          mutation: UPDATE_CHECKOUT_LINE_MUTATION_NEXT,
          variables: {
            checkoutId: checkout?.id,
            lines: alteredLines,
          },
        });
        const variables: UpdateCheckoutShippingMethodNextMutationVariables = {
          checkoutId: checkout?.id,
          shippingMethodId: checkout.availableShippingMethods[0]?.id,
        };

        try {
          if (!res?.data?.checkoutLinesUpdate?.checkout?.id) {
            throw new Error("UpdateCheckoutLineNext failed");
          }
          const resShipping = await client.mutate<
            UpdateCheckoutShippingMethodNextMutation,
            UpdateCheckoutShippingMethodNextMutationVariables
          >({
            mutation: UPDATE_CHECKOUT_SHIPPING_METHOD_MUTATION_NEXT,
            variables,
          });

          if (resShipping.data?.checkoutShippingMethodUpdate?.checkout?.id) {
            storage.setCheckout(
              resShipping.data?.checkoutShippingMethodUpdate?.checkout
            );
            const res = {
              data: {
                checkoutDiscounts: {
                  prepaidDiscount:
                    resShipping.data?.checkoutShippingMethodUpdate?.checkout
                      ?.paymentMethod?.prepaidDiscountAmount,
                  couponDiscount:
                    resShipping.data?.checkoutShippingMethodUpdate?.checkout
                      ?.paymentMethod?.couponDiscount,
                  cashbackDiscount:
                    resShipping.data?.checkoutShippingMethodUpdate?.checkout
                      ?.paymentMethod?.cashbackDiscountAmount,
                },
                cashback:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout
                    ?.cashback,
              },
            };

            storage.setDiscounts(res.data);

            client.writeQuery({
              query: GET_LOCAL_CHECKOUT,
              data: {
                localCheckout:
                  resShipping.data?.checkoutShippingMethodUpdate?.checkout,
                localCheckoutDiscounts: res.data.checkoutDiscounts,
                localCashback: res.data.cashback,
              },
            });
          } else {
            throw new Error("UpdateCheckoutShippingMethodNext failed");
          }
          var returnObject = {
            data: resShipping.data?.checkoutShippingMethodUpdate?.checkout,
            errors: resShipping?.data?.checkoutShippingMethodUpdate?.errors,
          };
        } catch {
          //fallback if the mutation fails
          const checkoutDetailRes = await client.query<
            CheckoutDetailsNextQuery,
            CheckoutDetailsNextQueryVariables
          >({
            query: CHECKOUT_DETAILS_NEXT,
            variables: checkout?.token,
          });
          if (checkoutDetailRes?.data?.checkout?.id) {
            storage.setCheckout(checkoutDetailRes?.data?.checkout);
            const res = {
              data: {
                checkoutDiscounts: {
                  prepaidDiscount:
                    checkoutDetailRes?.data?.checkout?.paymentMethod
                      ?.prepaidDiscountAmount,
                  couponDiscount:
                    checkoutDetailRes?.data?.checkout?.paymentMethod
                      ?.couponDiscount,
                  cashbackDiscount:
                    checkoutDetailRes?.data?.checkout?.paymentMethod
                      ?.cashbackDiscountAmount,
                },
                cashback: checkoutDetailRes?.data?.checkout?.cashback,
              },
            };

            storage.setDiscounts(res.data);

            client.writeQuery({
              query: GET_LOCAL_CHECKOUT,
              data: {
                localCheckout: checkoutDetailRes?.data?.checkout,
                localCheckoutDiscounts: res.data.checkoutDiscounts,
                localCashback: res.data.cashback,
              },
            });
          }
          // @ts-ignore
          var returnObject = {
            data: checkoutDetailRes?.data?.checkout,
            errors: checkoutDetailRes?.errors,
          };
        }

        client.writeQuery({
          query: GET_LOCAL_CHECKOUT,
          data: {
            checkoutLoading: false,
          },
        });

        return returnObject;
      }
    }
    return null;
  };

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    addToCartNext,
    updateItemNext,
  };
};
