import type { DocumentDTO } from "@/features/documents/api/dtos/document.dto";
import type { Document } from "@/features/documents/application/entities/document.entity";
import { DOCUMENT_STATUS_MAP } from "@/features/documents/api/maps/document-status.map";

export class DocumentMapper {
  public static toDomain(dto: DocumentDTO): Document {
    return {
      name: dto.name,
      status: DOCUMENT_STATUS_MAP[dto.status] ?? "unknown",
    };
  }

  public static toDomainList(dtos: DocumentDTO[]): Document[] {
    return dtos.map(DocumentMapper.toDomain);
  }
}
