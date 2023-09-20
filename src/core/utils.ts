import axios from "axios";
import { REST_API_METHODS_TYPES, WIZZY_ENDPOINTS } from "../constants";

export interface UtilityFunctionsSDK {
  searchProducts: (queryOptions: any) => any;
}

export const utilityFunctions = ({ wizzyConfig }: any): UtilityFunctionsSDK => {
  const searchProducts = async (queryOptions = null) => {
    if (queryOptions && wizzyConfig.headers) {
      try {
        const wizzyHeaders = wizzyConfig.headers;
        const url: string = WIZZY_ENDPOINTS.SEARCH;
        const method: string = REST_API_METHODS_TYPES.POST;
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
