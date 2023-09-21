import axios from "axios";

export interface UtilityFunctionsSDK {
  searchProducts: (queryOptions: {} | undefined, options: any) => any;
}

export const utilityFunctions = ({ wizzyConfig }: any): UtilityFunctionsSDK => {
  const searchProducts = async (
    queryOptions: {} | undefined = {},
    options: any = {}
  ) => {
    if (queryOptions && wizzyConfig.headers) {
      try {
        const wizzyHeaders = wizzyConfig.headers;
        const url = "https://api.wizzy.ai/v1/products/search";
        const method = "POST";
        const response = await axios({
          url,
          method,
          data: queryOptions,
          headers: { ...wizzyHeaders },
          ...options,
        });

        return response;
      } catch (error) {
        console.log("Error occurred in axiosRequest", error);
        return;
      }
    }
    return null;
  };
  return {
    searchProducts,
  };
};
