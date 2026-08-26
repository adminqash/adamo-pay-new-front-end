import type {
  ComplianceCaseDTO,
  ComplianceCommentDTO,
  ComplianceFindingDTO,
  ComplianceScreeningDetailDTO,
  InfolaftMatchDTO,
} from "@/features/compliance/api/dtos/compliance-case.dto";
import type {
  ComplianceCase,
  ComplianceComment,
  ComplianceFinding,
  ComplianceScreeningDetail,
  InfolaftMatch,
} from "@/features/compliance/application/entities/compliance-case.entity";
import { riskBandFromLevel } from "@/features/compliance/application/entities/compliance-case.entity";

function matchFullName(match: InfolaftMatchDTO): string {
  if (match.nombres) {
    return [match.nombres, match.primerApellidoORazonSocial, match.segundoApellido]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return [
    match.primerNombre,
    match.segundoNombre,
    match.primerApellidoORazonSocial,
    match.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function toFinding(dto: ComplianceFindingDTO): ComplianceFinding {
  return {
    codigoLista: dto.codigoLista,
    findingId: dto.findingId,
    key: dto.key,
    nombreLista: dto.nombreLista,
    riskLevel: dto.riskLevel,
    riskBand: riskBandFromLevel(dto.riskLevel),
    resolved: dto.resolved === true,
    resolutionNote: dto.resolutionNote,
    resolvedByName: dto.resolvedByName,
    resolvedAt: dto.resolvedAt,
  };
}

function toComment(dto: ComplianceCommentDTO): ComplianceComment {
  return {
    id: dto.id,
    type: dto.type,
    text: dto.text,
    authorName: dto.authorName,
    authorRole: dto.authorRole,
    attachments: dto.attachments ?? [],
    createdAt: dto.createdAt,
  };
}

function toMatch(dto: InfolaftMatchDTO): InfolaftMatch {
  return {
    id: String(dto.id),
    codigoLista: dto.codigoLista,
    nombreLista: dto.nombreLista,
    infoListId: dto.infoListId,
    comentarios: dto.comentarios,
    link: dto.link,
    fullName: matchFullName(dto),
    tipo: dto.tipo,
    documentId: dto.idIdentfy,
    country: dto.direccionPais,
    score: dto.score,
    riskLevel: dto.riskLevel,
    comments: dto.comentarios,
    listNames: dto.nombreLista,
    type: dto.tipo,
  };
}

export class ComplianceCaseMapper {
  public static toDomain(dto: ComplianceCaseDTO): ComplianceCase {
    const findings = (dto.screening?.findings ?? []).map(toFinding);
    return {
      id: dto.id,
      subjectType: dto.subjectType,
      subjectId: dto.subjectId,
      batchId: dto.batchId,
      batchName: dto.batchName,
      paymentId: dto.paymentId,
      reference: dto.reference,
      status: dto.status,
      createdAt: dto.createdAt,
      beneficiary: dto.beneficiary,
      payment: dto.payment,
      findings,
      maxRiskLevel: dto.screening?.maxRiskLevel
        ?? findings.reduce((max, finding) => Math.max(max, finding.riskLevel), 0),
      verdict: dto.screening?.verdict,
      comments: (dto.comments ?? []).map(toComment),
      canResolveFindings: dto.canResolveFindings === true,
      canApprove: dto.canApprove === true,
      canReject: dto.canReject === true,
      canComment: dto.canComment === true,
      findingsResolved: dto.findingsResolved === true
        || (findings.length > 0 && findings.every((finding) => finding.resolved)),
      awaitingAdamo: dto.awaitingAdamo === true,
    };
  }

  public static toScreeningDetail(dto: ComplianceScreeningDetailDTO): ComplianceScreeningDetail {
    return {
      subjectId: dto.subjectId,
      byDocumentNumber: (dto.byDocumentNumber?.content ?? []).map(toMatch),
      byName: (dto.byName?.content ?? []).map(toMatch),
    };
  }

  public static toComment(dto: ComplianceCommentDTO): ComplianceComment {
    return toComment(dto);
  }
}
