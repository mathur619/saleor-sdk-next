import axios, { AxiosResponse } from "axios";

export interface UtilityFunctionsSDK {
  searchProducts: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  filterProducts: (
    filters: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  clickProductEvent: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  viewProductEvent: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
  convertedProductEvent: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
}

export const utilityFunctions = (wizzyConfig: any): UtilityFunctionsSDK => {
  const searchProducts = async (queryOptions: any, options: any = {}) => {
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

  const clickProductEvent = async (queryOptions: any, options: any = {}) => {
    const { headers, baseUrl } = wizzyConfig;
    if (queryOptions && headers && baseUrl) {
      try {
        const url = `${baseUrl}/events/click`;
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

  const viewProductEvent = async (queryOptions: any, options: any = {}) => {
    const { headers, baseUrl } = wizzyConfig;
    if (queryOptions && headers && baseUrl) {
      try {
        const url = `${baseUrl}/events/view`;
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

  const convertedProductEvent = async (
    queryOptions: any,
    options: any = {}
  ) => {
    const { headers, baseUrl } = wizzyConfig;
    if (queryOptions && headers && baseUrl) {
      try {
        const url = `${baseUrl}/events/converted`;
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
    searchProducts,
    filterProducts,
    clickProductEvent,
    viewProductEvent,
    convertedProductEvent,
  };
};
