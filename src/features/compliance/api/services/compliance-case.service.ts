import type {
  ComplianceCaseDTO,
  ComplianceCommentDTO,
  ComplianceScreeningDetailDTO,
} from "@/features/compliance/api/dtos/compliance-case.dto";
import { ComplianceCaseMapper } from "@/features/compliance/api/mappers/compliance-case.mapper";
import type {
  ComplianceCase,
  ComplianceComment,
  ComplianceScreeningDetail,
} from "@/features/compliance/application/entities/compliance-case.entity";
import type { ServiceResult } from "@/features/common/services/service-result";
import { coreApi } from "@/lib/api/api";
import { apiGet, apiPost } from "@/lib/api/http.service";

export class ComplianceService {
  public static GET_CASE_KEY = "compliance.get-case";
  public static GET_SCREENING_KEY = "compliance.get-screening";
  public static ADD_COMMENT_KEY = "compliance.add-comment";
  public static RESOLVE_FINDING_KEY = "compliance.resolve-finding";
  public static APPROVE_KEY = "compliance.approve";
  public static REJECT_KEY = "compliance.reject";

  public static getCase(subjectId: string): Promise<ServiceResult<ComplianceCase>> {
    return apiGet<ComplianceCaseDTO, ComplianceCase>(
      coreApi,
      `/compliance/cases/${subjectId}`,
      ComplianceCaseMapper.toDomain,
    );
  }

  public static getScreeningDetail(
    subjectId: string,
  ): Promise<ServiceResult<ComplianceScreeningDetail>> {
    return apiGet<ComplianceScreeningDetailDTO, ComplianceScreeningDetail>(
      coreApi,
      `/compliance/cases/${subjectId}/screening`,
      ComplianceCaseMapper.toScreeningDetail,
    );
  }

  public static addComment(
    subjectId: string,
    body: {
      text: string
      attachments?: Array<{ name: string, size?: number, contentType?: string }>
    },
  ): Promise<ServiceResult<ComplianceComment>> {
    return apiPost<ComplianceCommentDTO, ComplianceComment>(
      coreApi,
      `/compliance/cases/${subjectId}/comments`,
      body,
      ComplianceCaseMapper.toComment,
    );
  }

  public static resolveFinding(
    subjectId: string,
    findingKey: string,
    note: string,
  ): Promise<ServiceResult<ComplianceCase>> {
    return apiPost<ComplianceCaseDTO, ComplianceCase>(
      coreApi,
      `/compliance/cases/${subjectId}/findings/${encodeURIComponent(findingKey)}/resolve`,
      { note },
      ComplianceCaseMapper.toDomain,
    );
  }

  public static approve(
    subjectId: string,
    note?: string,
  ): Promise<ServiceResult<ComplianceCase>> {
    return apiPost<ComplianceCaseDTO, ComplianceCase>(
      coreApi,
      `/compliance/cases/${subjectId}/approve`,
      { note },
      ComplianceCaseMapper.toDomain,
    );
  }

  public static reject(
    subjectId: string,
    note: string,
  ): Promise<ServiceResult<ComplianceCase>> {
    return apiPost<ComplianceCaseDTO, ComplianceCase>(
      coreApi,
      `/compliance/cases/${subjectId}/reject`,
      { note },
      ComplianceCaseMapper.toDomain,
    );
  }
}
