export interface WishlistSDK {
  loaded?: boolean;

  items?: any;

  getWishlist?: () => {};
  addItemInWishlist?: () => {};
  removeItemInWishlist?: () => {};
}
