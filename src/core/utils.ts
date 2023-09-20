import axios from "axios";
import { REST_API_METHODS_TYPES, WIZZY_ENDPOINTS } from "../constants";

export interface UtilityFunctionsSDK {
  searchProducts: (queryOptions: {} | undefined) => any;
}

export const utilityFunctions = ({ wizzyConfig }: any): UtilityFunctionsSDK => {
  const searchProducts = async (queryOptions: {} | undefined = {}) => {
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
