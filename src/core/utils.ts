import axios, { AxiosResponse } from "axios";

export interface RestSearchFunctionsSDK {
  restSearchProducts: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  filterProducts: (
    filters: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
}

export const restSearchFunctions = (wizzyConfig: any): RestSearchFunctionsSDK => {
  const restSearchProducts = async (queryOptions: any, options: any = {}) => {
    const { headers, baseUrl } = wizzyConfig;
    if (queryOptions && headers && baseUrl) {
      try {
        const url = `${baseUrl}/products/search`;
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

  const filterProducts = async (filters: any, options: any = {}) => {
    const { headers, baseUrl } = wizzyConfig;
    if (filters && headers && baseUrl) {
      try {
        const url = `${baseUrl}/products/filter`;
        const method = "POST";
        const response = await axios({
          url,
          method,
          data: filters,
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
    restSearchProducts,
    filterProducts,
  };
};