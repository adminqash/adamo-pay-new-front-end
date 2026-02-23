import { useMemo } from "react";

/**
 * transaction detail data
 */
interface TransactionDetail {
  id: string;
  status: "pending" | "approved" | "rejected";
  beneficiary: {
    fullName: string;
    idType: string;
    idNumber: string;
    hasIssues: boolean;
  };
  payment: {
    amount: number;
    accountType: string;
    bank: string;
    accountNumber: string;
    accountMismatch: boolean;
  };
  reference: {
    number: string | null;
    notFound: boolean;
  };
  restrictiveList: {
    listName: string;
    riskLevel: "low" | "medium" | "high";
  } | null;
}

/**
 * hook to get transaction detail by id
 * TODO: Replace with actual API call
 */
export const useTransactionDetail = (id: string) => {
  const transaction = useMemo<TransactionDetail>(() => {
    // Mock data - replace with actual API call
    return {
      id,
      status: "pending",
      beneficiary: {
        fullName: "Juan Carlos Gutierrez Díaz",
        idType: "Cédula de ciudadanía",
        idNumber: "129.330.220",
        hasIssues: false,
      },
      payment: {
        amount: 2331876,
        accountType: "Corriente",
        bank: "Davivienda",
        accountNumber: "002-83336-90116",
        accountMismatch: true,
      },
      reference: {
        number: null,
        notFound: true,
      },
      restrictiveList: {
        listName: "Procuraduría",
        riskLevel: "medium",
      },
    };
  }, [id]);

  return { transaction };
};
