import type { ComplianceCheckDTO } from "@/features/compliance/api/dtos/compliance-check.dto";

export type ComplianceCheck = {
  id: string
  checkType: string
  subjectType: string
  subjectId: string
  batchId?: string
  batchName?: string
  rowNumber?: number
  beneficiaryName?: string
  documentNumber?: string
  status: string
  verdict?: string
  createdAt?: string
};

export class ComplianceCheckMapper {
  public static toDomain(dto: ComplianceCheckDTO): ComplianceCheck {
    return {
      id: dto.id,
      checkType: dto.checkType ?? "batch_payment",
      subjectType: dto.subjectType ?? "batch_item",
      subjectId: dto.subjectId ?? dto.id,
      batchId: dto.batchId,
      batchName: dto.batchName,
      rowNumber: dto.rowNumber,
      beneficiaryName: dto.beneficiaryName,
      documentNumber: dto.documentNumber,
      status: dto.status ?? "pending",
      verdict: dto.screening?.verdict,
      createdAt: dto.createdAt,
    };
  }

  public static toDomainList(dtos: ComplianceCheckDTO[]): ComplianceCheck[] {
    return dtos.map(ComplianceCheckMapper.toDomain);
  }
}
