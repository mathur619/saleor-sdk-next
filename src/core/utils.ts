import axios, { AxiosResponse } from "axios";

export interface RestSearchFunctionsSDK {
  restSearchProducts: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
}

export const restSearchFunctions = (restApiUrl: any): RestSearchFunctionsSDK => {
  const restSearchProducts = async (queryOptions: any, options: any = {}) => {
    const { headers, baseUrl } = options;
    if (queryOptions && headers && baseUrl) {
      try {
        const url = `${baseUrl}/rest/search_products/`;
        const method = "POST";
        const response = await axios({
          url,
          method,
          data: queryOptions,
          headers,
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
    restSearchProducts
  };
};