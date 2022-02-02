import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { GET_LOCAL_CHECKOUT } from "./queries";

export const setLocalCheckoutInCache = async (
  client: ApolloClient<NormalizedCacheObject>,
  checkout: any
) => {
  console.log("setLocalCheckoutInCache in helper");
  //   await client.query<UpdateCheckoutLine, UpdateCheckoutLineVariables>({
  //     query: UPDATE_CHECKOUT_LINE_MUTATION,
  //     variables: {
  //       checkoutId: checkout?.id,
  //       lines: alteredLines,
  //     },
  //     update: (_, { data }) => {
  //       if (data?.checkoutLinesUpdate?.checkout?.id) {
  //         storage.setCheckout(data?.checkoutLinesUpdate?.checkout);
  //       }
  //       setLocalCheckoutInCache(client, data?.checkoutLinesUpdate?.checkout);
  //     },
  //   });
  client.writeQuery({
    query: GET_LOCAL_CHECKOUT,
    data: {
      localCheckout: checkout,
    },
  });
};
