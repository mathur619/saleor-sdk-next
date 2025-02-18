export const WINDOW_EXISTS = typeof window !== "undefined";
export const LOCAL_STORAGE_EXISTS = WINDOW_EXISTS && !!window.localStorage;
export const DEVELOPMENT_MODE = process.env.NODE_ENV === "development";

export const dummyCheckoutFields = {
  availablePaymentGateways: [
    {
      currencies: ["INR"],
      id: "mirumee.payments.razorpay",
      name: "Razorpay",
      __typename: "PaymentGateway",
      config: [],
    },
  ],
  billingAddress: null,
  cashback: {
    amount: "0.00",
    willAddOn: null,
    __typename: "CashbackType",
  },
  discount: {
    currency: "INR",
    amount: 0,
    __typename: "Money",
  },
  email: "dummy@dummy.com",
  paymentMethod: {
    cashbackDiscountAmount: 0,
    couponDiscount: "0",
    prepaidDiscountAmount: 0,
    __typename: "PaymentMethodType",
  },
  shippingAddress: null,
  shippingMethod: null,
  shippingPrice: {
    gross: {
      amount: 0,
      currency: "INR",
      __typename: "Money",
    },
    net: {
      amount: 0,
      currency: "INR",
      __typename: "Money",
    },
    __typename: "TaxedMoney",
  },
  subtotalPrice: {
    gross: {
      amount: 0,
      currency: "INR",
      __typename: "Money",
    },
    net: {
      amount: 0,
      currency: "INR",
      __typename: "Money",
    },
    __typename: "TaxedMoney",
  },
  totalPrice: {
    gross: {
      amount: 0,
      currency: "INR",
      __typename: "Money",
    },
    net: {
      amount: 0,
      currency: "INR",
      __typename: "Money",
    },
    __typename: "TaxedMoney",
  },
  translatedDiscountName: null,
  voucherCode: null,
  __typename: "Checkout"
};