export interface CheckoutSDK {
  loaded?: any;

  checkout?: any;

  promoCodeDiscount?: any;

  billingAsShipping?: any;

  selectedShippingAddressId?: string;

  selectedBillingAddressId?: string;

  availableShippingMethods?: any;

  availablePaymentGateways?: any[];

  payment?: any;

  setAddressType?: () => {};
  createCheckout?: () => {};
  setShippingAddress?: () => {};
  setShippingAndBillingAddress?: () => {};
  setBillingAddress?: () => {};
  setBillingAsShippingAddress?: () => {};
  setShippingMethod?: () => {};
  addPromoCode?: () => {};
  removePromoCode?: () => {};
  checkoutPaymentMethodUpdate?: () => {};
  createPayment?: () => {};
  completeCheckout?: () => {};
}
