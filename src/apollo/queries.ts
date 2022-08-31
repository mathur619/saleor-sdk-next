import { gql } from "@apollo/client";
import {
  checkoutFragment,
  checkoutLineFragment,
  orderDetailFragment,
  userFragment,
  wishlistFragment,
} from "./fragments";

export const USER = gql`
  ${userFragment}
  query UserDetails {
    user: me {
      ...UserFragment
    }
    authenticated @client
    authenticating @client
  }
`;

export const CHECKOUT_DETAILS = gql`
  ${checkoutFragment}
  query CheckoutDetails($token: UUID) {
    checkout(token: $token) {
      ...Checkout
    }
    checkoutUpdated @client
  }
`;

export const GET_CART_ITEMS = gql`
  ${checkoutLineFragment}
  query GetCartItems {
    cartItems @client {
      ...CheckoutLine
    }
  }
`;
export const GET_LOCAL_CHECKOUT = gql`
  ${orderDetailFragment}
  ${checkoutFragment}
  query GetLocalCheckout {
    localCheckout @client {
      ...Checkout
    }

    localCheckoutDiscounts @client {
      prepaidDiscount
      couponDiscount
      cashbackDiscount
    }
    localCashback @client {
      amount
      willAddOn
    }
    useCashback @client
    checkoutLoading @client
    userWalletBalance @client
    recentOrder @client {
      ...OrderDetail
    }
  }
`;

export const GET_DISCOUNT_CASHBACK_QUERY = gql`
  query DiscountsAndCashbackQuery($token: UUID!) {
    checkoutDiscounts(token: $token) {
      prepaidDiscount
      couponDiscount
      cashbackDiscount
    }
    cashback(checkoutToken: $token) {
      amount
      willAddOn
    }
  }
`;

export const USER_CHECKOUT_DETAILS = gql`
  ${checkoutFragment}
  query UserCheckoutDetails {
    me {
      id
      checkout {
        ...Checkout
      }
    }
  }
`;

export const GET_CITY_STATE_FROM_PINCODE = gql`
  query Pincode($pin: String) {
    pincode(pin: $pin) {
      city
      state
      serviceable
    }
  }
`;

export const USER_ORDER_DETAILS = gql`
  query OrdersByUser($perPage: Int!, $after: String) {
    me {
      id
      orders(first: $perPage, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            shippingAddress {
              id
              postalCode
            }
            invoices {
              createdAt
              id
              message
              externalUrl
              number
              status
              updatedAt
              url
              metadata {
                key
                value
              }
            }
            metadata {
              key
              value
            }
            token
            number
            statusDisplay
            created
            total {
              gross {
                amount
                currency
              }
              net {
                amount
                currency
              }
            }
            lines {
              id

              productName
              quantity
              variant {
                id
                weight {
                  unit
                  value
                }
                sku
                name
                product {
                  id
                  weight {
                    unit
                    value
                  }
                  metadata {
                    key
                    value
                  }
                  category {
                    id
                    name
                    slug
                  }
                  name
                  pricing {
                    discount {
                      net {
                        amount
                      }
                    }
                    priceRange {
                      start {
                        net {
                          amount
                        }
                      }
                    }
                    priceRangeUndiscounted {
                      start {
                        net {
                          amount
                        }
                      }
                    }
                  }
                }
              }
              thumbnail {
                alt
                url
              }
              thumbnail2x: thumbnail(size: 510) {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_LOCAL_WISHLIST = gql`
  ${wishlistFragment}
  query getLocalWishlist {
    localWishlist @client {
      ...Wishlist
    }
  }
`;

export const GET_WISHLIST = gql`
  query Wishlist($first: Int!) {
    wishlist {
      id
      items(first: $first) {
        edges {
          node {
            id

            product {
              id
              name
              slug
              isAvailableForPurchase
              metadata {
                key
                value
              }
              productType {
                name
              }
              thumbnail {
                url
              }
              images {
                id
                url
                alt
              }
              variants {
                id
                sku
                name
                metadata {
                  key
                  value
                }
                attributes {
                  attribute {
                    name
                  }
                  values {
                    name
                  }
                }
                quantityAvailable(countryCode: IN)
                images {
                  id
                  url
                  alt
                }
                pricing {
                  onSale
                  priceUndiscounted {
                    gross {
                      amount
                      currency
                    }
                    net {
                      amount
                      currency
                    }
                  }
                  price {
                    gross {
                      amount
                      currency
                    }
                    net {
                      amount
                      currency
                    }
                  }
                }
              }

              pricing {
                priceRangeUndiscounted {
                  start {
                    net {
                      amount
                      currency
                    }
                    gross {
                      amount
                      currency
                    }
                  }
                  stop {
                    net {
                      amount
                      currency
                    }
                    gross {
                      amount
                      currency
                    }
                  }
                }
                priceRange {
                  start {
                    net {
                      amount
                      currency
                    }
                    gross {
                      amount
                      currency
                    }
                  }
                  stop {
                    net {
                      amount
                      currency
                    }
                    gross {
                      amount
                      currency
                    }
                  }
                }
              }
            }
            variants(first: $first) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_WISHLIST_ITEMS = gql`
  ${wishlistFragment}
  query GetWishlistItems {
    wishlistItems @client {
      ...Wishlist
    }
  }
`;
