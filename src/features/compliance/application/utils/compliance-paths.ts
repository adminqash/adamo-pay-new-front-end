export function complianceReviewPath(input: {
  subjectId: string
  batchId?: string
}): string {
  if (input.batchId) {
    return `/batches/${input.batchId}/transactions/${input.subjectId}/review`;
  }
  return `/transactions/${input.subjectId}/review`;
}

export function complianceNovedadPath(input: {
  subjectId: string
  batchId?: string
}): string {
  if (input.batchId) {
    return `/batches/${input.batchId}/transactions/${input.subjectId}/novedad`;
  }
  return `/transactions/${input.subjectId}/novedad`;
}

export function isComplianceStatus(status: string | undefined): boolean {
  return (
    status === "for-review" ||
    status === "waiting-for-resolution" ||
    status === "in-review" ||
    status === "client-review" ||
    status === "review"
  );
}
