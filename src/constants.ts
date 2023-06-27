export const WINDOW_EXISTS = typeof window !== "undefined";
export const LOCAL_STORAGE_EXISTS = WINDOW_EXISTS && !!window.localStorage;
export const DEVELOPMENT_MODE = process.env.NODE_ENV === "development";

export enum REST_API_METHODS_TYPES {
  GET = "GET",
  POST = "POST",
}

export const REST_API_ENDPOINTS = {
  ADD_TO_CART: "add_to_cart/",
  UPDATE_CART: "update_cart/",
};
