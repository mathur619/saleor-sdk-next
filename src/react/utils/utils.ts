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
): string | number | Object {
  const metaValue = metadata?.filter(
    (meta: { key: string }) => meta?.key === key
  )[0]?.value;

  if (metaValue) {
    if (isValidJSONString(metaValue)) return JSON.parse(metaValue);
    return metaValue;
  }

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

export const getDBIdFromGraphqlId = (
  graphqlId: string,
  schema?: string
): number | void => {
  // This is temporary solution, we will use slugs in the future
  if (typeof window !== "undefined") {
    const rawId = atob(graphqlId);
    const regexp = /(\w+):(\d+)/;
    const arr = regexp.exec(rawId);

    if (schema && schema !== arr![1]) {
      throw new Error("Schema is not correct");
    }
    return parseInt(arr![2], 10);
  }
};
