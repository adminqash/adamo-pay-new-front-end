import type {
  ComplianceBreakdownDTO,
  ComplianceCaseDTO,
  ComplianceCommentDTO,
  ComplianceScreeningDetailDTO,
} from "@/features/compliance/api/dtos/compliance-case.dto";
import { ComplianceCaseMapper } from "@/features/compliance/api/mappers/compliance-case.mapper";
import type {
  ComplianceBreakdown,
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
  public static GET_BREAKDOWN_KEY = "compliance.get-breakdown";
  public static GET_SUMMARY_KEY = "compliance.get-summary";
  public static GET_COMMENTS_KEY = "compliance.get-comments";
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

  public static getBreakdown(
    subjectId: string,
  ): Promise<ServiceResult<ComplianceBreakdown>> {
    return apiGet<ComplianceBreakdownDTO, ComplianceBreakdown>(
      coreApi,
      `/compliance/cases/${subjectId}/breakdown`,
      ComplianceCaseMapper.toBreakdown,
    );
  }

  public static getComments(
    subjectId: string,
  ): Promise<ServiceResult<ComplianceComment[]>> {
    return apiGet<ComplianceCommentDTO[], ComplianceComment[]>(
      coreApi,
      `/compliance/cases/${subjectId}/comments`,
      (dtos) => dtos.map(ComplianceCaseMapper.toComment),
    );
  }

  public static getSummary(): Promise<ServiceResult<{
    pendingFindings: number
    waitingResolution: number
    newActivity: number
  }>> {
    return apiGet(
      coreApi,
      "/compliance/summary",
      (dto: { pendingFindings: number, waitingResolution: number, newActivity: number }) => dto,
    );
  }

  public static async downloadAttachment(attachmentId: string, name: string): Promise<void> {
    const response = await coreApi.get(`/compliance/attachments/${attachmentId}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  public static addComment(
    subjectId: string,
    body: {
      text: string
      attachments?: Array<{
        name: string
        size?: number
        contentType?: string
        contentBase64?: string
      }>
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
    totp: string,
  ): Promise<ServiceResult<ComplianceCase>> {
    return apiPost<ComplianceCaseDTO, ComplianceCase>(
      coreApi,
      `/compliance/cases/${subjectId}/findings/${encodeURIComponent(findingKey)}/resolve`,
      { note, totp },
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
