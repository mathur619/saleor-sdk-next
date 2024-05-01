import axios, { AxiosResponse } from "axios";

export interface RestApiFunctionSDK {
  restSearchProducts: (
    queryOptions: any,
    options?: any
  ) => Promise<AxiosResponse<any, any> | null | undefined>;
}

export const restApiFunction = (coreInternals: any): RestApiFunctionSDK => {
  const restSearchProducts = async (queryOptions: any, parameters: any = {}) => {
    const { headers, options } = parameters;
    const { restApiUrl } = coreInternals;
    if (queryOptions && headers && restApiUrl) {
      try {
        const url = `${restApiUrl}/rest/search_products/`;
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