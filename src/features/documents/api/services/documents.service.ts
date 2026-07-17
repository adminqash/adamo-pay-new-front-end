import type { ServiceResult } from "@/features/common/services/service-result";
import type { CreateDocumentDTO } from "@/features/documents/api/dtos/create-document.dto";
import type { DocumentDTO } from "@/features/documents/api/dtos/document.dto";
import type { CreateDocumentCommand } from "@/features/documents/application/commands/create-document.command";
import type { Document } from "@/features/documents/application/entities/document.entity";
import type { APIResponse } from "@/lib/api/api.types";
import { DocumentMapper } from "@/features/documents/api/mappers/document.mapper";
import { coreApi } from "@/lib/api/api";
import { handleAPIResponse, handleAPIError } from "@/lib/api/api.utils";

export class DocumentsService {
  public static GET_DOCUMENTS_KEY = "get_documents_key";
  public static CREATE_DOCUMENT_KEY = "create_document_key";

  public static async getAll(): Promise<ServiceResult<Document[]>> {
    try {
      const response = await coreApi.get<APIResponse<DocumentDTO[]>>("/documents");

      return handleAPIResponse(response, DocumentMapper.toDomainList);
    } catch(error) {
      handleAPIError(error);
    }
  }

  public static async create(command: CreateDocumentCommand): Promise<ServiceResult<Document>> {
    try {
      const dto: CreateDocumentDTO = {
        name: command.name,
      };

      const response = await coreApi.post<APIResponse<DocumentDTO>>("/documents", dto);

      return handleAPIResponse(response, DocumentMapper.toDomain);
    } catch(error) {
      handleAPIError(error);
    }
  }
}
