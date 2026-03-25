import { useMemo } from "react";

/**
 * transaction detail data
 */
interface TransactionDetail {
  id: string;
  status: "pending" | "validated" | "paid" | "returned" | "rejected";
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
    const mockTransactions: Record<string, TransactionDetail> = {
      "1": {
        id: "1",
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
      },
      "2": {
        id: "2",
        status: "paid",
        beneficiary: {
          fullName: "María Fernanda López Castro",
          idType: "Cédula de ciudadanía",
          idNumber: "85.342.991",
          hasIssues: false,
        },
        payment: {
          amount: 1500000,
          accountType: "Ahorros",
          bank: "Bancolombia",
          accountNumber: "123-45678-90",
          accountMismatch: false,
        },
        reference: {
          number: "REF-2024-001234",
          notFound: false,
        },
        restrictiveList: null,
      },
      "3": {
        id: "3",
        status: "rejected",
        beneficiary: {
          fullName: "Carlos Alberto Ramírez Soto",
          idType: "Cédula de extranjería",
          idNumber: "45.678.912",
          hasIssues: true,
        },
        payment: {
          amount: 3200000,
          accountType: "Corriente",
          bank: "BBVA Colombia",
          accountNumber: "567-89012-34",
          accountMismatch: true,
        },
        reference: {
          number: "REF-2024-005678",
          notFound: false,
        },
        restrictiveList: {
          listName: "Lista Clinton",
          riskLevel: "high",
        },
      },
      "4": {
        id: "4",
        status: "returned",
        beneficiary: {
          fullName: "Ana Patricia Moreno Gómez",
          idType: "Cédula de ciudadanía",
          idNumber: "67.890.123",
          hasIssues: false,
        },
        payment: {
          amount: 980000,
          accountType: "Ahorros",
          bank: "Banco de Bogotá",
          accountNumber: "890-12345-67",
          accountMismatch: false,
        },
        reference: {
          number: null,
          notFound: true,
        },
        restrictiveList: null,
      },
    };

    // Return the specific transaction or default to first one
    return mockTransactions[id] || mockTransactions["1"];
  }, [id]);

  return { transaction };
};
