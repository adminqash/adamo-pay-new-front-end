export type Account = {
  id: string
  name: string
  balance: string
  currency: string
  countryCode: string
};

export type AccountMovement = {
  id: string
  date: string
  type: string
  amount: string
};
