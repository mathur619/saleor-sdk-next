import { PriceFragment } from "../../apollo/types";

export const createTaxedPriceFromAmount = (
  amount: number | string,
  currency: string = "INR"
): PriceFragment => {
  const actualAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return {
    gross: {
      amount: actualAmount || 0,
      currency,
    },
    net: {
      amount: actualAmount || 0,
      currency,
    },
  };
};
