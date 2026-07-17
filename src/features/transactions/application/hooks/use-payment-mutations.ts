import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaymentsService } from "@/features/transactions/api/services/payments.service";
import type {
  CorrectPaymentCommand,
  CreatePaymentCommand,
  UpdatePaymentStatusCommand,
} from "@/features/transactions/application/commands/payment.commands";
import { queryKeys } from "@/lib/query/query-keys";

function invalidatePayments(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["payments"] });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["transactions"]);

  return useMutation({
    mutationKey: [PaymentsService.CREATE_PAYMENT_KEY],
    mutationFn: (command: CreatePaymentCommand) => PaymentsService.create(command),
    meta: {
      successMessage: t("transactions:transactions.messages.payment_created"),
      errorMessage: t("transactions:errors.create_failed", {
        defaultValue: "Error al crear el pago",
      }),
    },
    onSuccess: () => invalidatePayments(queryClient),
  });
}

export function useCorrectPayment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["transactions"]);

  return useMutation({
    mutationKey: [PaymentsService.CORRECT_PAYMENT_KEY],
    mutationFn: (command: CorrectPaymentCommand) => PaymentsService.correct(command),
    meta: {
      successMessage: t("transactions:transactions.messages.payment_corrected"),
      errorMessage: t("transactions:errors.correct_failed", {
        defaultValue: "Error al corregir el pago",
      }),
    },
    onSuccess: (_data, variables) => {
      invalidatePayments(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.payments.detail(variables.paymentId),
      });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["transactions"]);

  return useMutation({
    mutationKey: [PaymentsService.UPDATE_PAYMENT_STATUS_KEY],
    mutationFn: (command: UpdatePaymentStatusCommand) =>
      PaymentsService.updateStatus(command),
    meta: {
      errorMessage: t("transactions:errors.status_update_failed", {
        defaultValue: "Error al actualizar el estado del pago",
      }),
    },
    onSuccess: (_data, variables) => {
      invalidatePayments(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.payments.detail(variables.paymentId),
      });
    },
  });
}
