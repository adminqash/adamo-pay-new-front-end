import type { Batch } from "../entities/batch.entity";

/**
 * hook to manage batches
 */
export const useBatches = () => {
  // sample data matching figma design
  const batches: Batch[] = [
    {
      id: "1",
      date: "10/12/2025",
      name: "Payments_November_25",
      transactions: 140,
      amount: 122350000,
      batchId: "JKL-5678",
      status: "pending",
    },
    {
      id: "2",
      date: "11/15/2025",
      name: "Batch_Payments_December",
      transactions: 1232,
      amount: 218750000,
      batchId: "MNO-1234",
      status: "processing",
    },
    {
      id: "3",
      date: "12/01/2025",
      name: "Salary_Payments_January",
      transactions: 4,
      amount: 237900000,
      batchId: "PQR-9101",
      status: "completed",
    },
    {
      id: "4",
      date: "01/20/2026",
      name: "Invoices_February_15",
      transactions: 993,
      amount: 135500000,
      batchId: "STU-3456",
      status: "pending",
    },
    {
      id: "5",
      date: "02/15/2026",
      name: "Payments_March_5",
      transactions: 12340,
      amount: 122200000,
      batchId: "VWX-7890",
      status: "completed",
    },
    {
      id: "6",
      date: "03/10/2026",
      name: "Batch_Payments_April",
      transactions: 303,
      amount: 23750000,
      batchId: "YZA-4567",
      status: "completed",
    },
    {
      id: "7",
      date: "04/05/2026",
      name: "Payroll_May_30",
      transactions: 829,
      amount: 19300000,
      batchId: "BCD-1234",
      status: "completed",
    },
    {
      id: "8",
      date: "05/25/2026",
      name: "Payments_June_18",
      transactions: 4,
      amount: 25500000,
      batchId: "EFG-5678",
      status: "processing",
    },
    {
      id: "9",
      date: "06/30/2026",
      name: "Batch_Payments_July",
      transactions: 19,
      amount: 120000000,
      batchId: "HIJ-9101",
      status: "pending",
    },
    {
      id: "10",
      date: "07/18/2026",
      name: "Invoices_August_14",
      transactions: 110,
      amount: 128150000,
      batchId: "KLM-2345",
      status: "completed",
    },
    {
      id: "11",
      date: "08/12/2026",
      name: "Payments_September_1",
      transactions: 1300,
      amount: 1336800000,
      batchId: "NOP-6789",
      status: "processing",
    },
    {
      id: "12",
      date: "09/09/2026",
      name: "Batch_Payments_October",
      transactions: 9214,
      amount: 222900000,
      batchId: "QRS-1234",
      status: "completed",
    },
    {
      id: "13",
      date: "10/30/2026",
      name: "Salary_Payments_November",
      transactions: 742,
      amount: 921250000,
      batchId: "TUV-5678",
      status: "completed",
    },
    {
      id: "14",
      date: "11/21/2026",
      name: "Payments_December_10",
      transactions: 662,
      amount: 1224900000,
      batchId: "WXY-9101",
      status: "processing",
    },
    {
      id: "15",
      date: "12/14/2026",
      name: "Invoices_January_12",
      transactions: 1025,
      amount: 929000000,
      batchId: "ZAB-3456",
      status: "processing",
    },
  ];

  const totalCount = batches.length;

  return {
    batches,
    totalCount,
  };
};
