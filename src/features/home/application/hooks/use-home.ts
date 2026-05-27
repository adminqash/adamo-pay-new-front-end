import type { Home } from "@/features/home/application/entities/home.entity";

/**
 * hook for home feature
 * 
 * provides home data and state management
 */
export function useHome() {
  // for now, we return static data
  // in the future, this could fetch from an API
  const homeData: Home = {
    walletBalance: {
      amount: "$190.034.500,59",
      currency: "COP",
      countryCode: "CO",
    },
    transactionStats: {
      pending: 1392,
      returned: 1392,
      rejected: 1392,
      validated: 1392,
      paid: 1392,
    },
  };

  return {
    data: homeData,
    isLoading: false,
    error: null,
  };
}
