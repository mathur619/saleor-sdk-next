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

export function getMetadataValue(
  metadata: any,
  key: string,
  alternateValue?: string | number
): string | Object {
  const metaValue = metadata?.filter(
    (meta: { key: string }) => meta?.key === key
  )[0]?.value;

  console.log("metaValue 1 ", metaValue);
  if (metaValue) {
    console.log("metaValue 2 ", metaValue, isValidJSONString(metaValue));

    if (isValidJSONString(metaValue)) return JSON.parse(metaValue);
    return metaValue;
  }
  console.log("metaValue 3 ", alternateValue);

  if (!metaValue && alternateValue !== undefined && alternateValue !== null)
    return alternateValue.toString();

  return metaValue;
}

function isValidJSONString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
