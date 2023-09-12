export interface IAddress {
    id?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    streetAddress1?: string;
    streetAddress2?: string;
    city?: string;
    postalCode?: string;
    countryArea?: string;
    phone?: string | null;
    country?: {
      code?: string;
      country?: string;
    };
  }
  export interface IPaymentCreditCard {
    /**
     * Card brand.
     */
    brand: string;
    /**
     * First 4 digits of the card number.
     */
    firstDigits?: string | null;
    /**
     * Last 4 digits of the card number.
     */
    lastDigits: string;
    /**
     * Two-digit number representing the card’s expiration month.
     */
    expMonth?: number | null;
    /**
     * Four-digit number representing the card’s expiration year.
     */
    expYear?: number | null;
  }
  
export type ICreditCard = IPaymentCreditCard;


  export interface CreatePaymentInput {
    gateway: string;
    token?: string;
    creditCard?: ICreditCard;
    returnUrl?: string;
  }

  export type CashBackMethodType =
  | 'CASHBACK'
  | 'RECHARGE_WALLET'
  | 'CASHBACK_AND_RECHARGE_WALLET'




  export interface PaymentMethodUpdateInput {
    gateway: string;
    useCashback: boolean;
    isRecalculate: boolean;
    cashbackType: CashBackMethodType
  }
  
  export interface CompleteCheckoutInput {
    paymentData?: object;
    redirectUrl?: string;
    storeSource?: boolean;
  }
  