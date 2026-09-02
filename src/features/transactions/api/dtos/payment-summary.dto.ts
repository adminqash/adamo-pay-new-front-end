export type PaymentStatusSummaryDTO = {
  transactions: {
    total: number
    pending: number
    returned: number
    rejected: number
    validated: number
    paid: number
  }
};
