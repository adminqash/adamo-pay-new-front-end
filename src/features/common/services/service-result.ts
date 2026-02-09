import type { Pagination } from "@/features/common/services/service-pagination";

export class ServiceResult<T> {
  public readonly success: boolean;
  public readonly message: string | null;
  public readonly data: T | null;
  public readonly pagination: Pagination | null;
  public readonly code: string | null;
  public readonly timestamp: string;
  public readonly traceId: string | null;

  public constructor(
    success: boolean,
    message: string | null,
    data: T | null,
    pagination: Pagination | null,
    code: string | null,
    timestamp: string,
    traceId: string | null = null,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.code = code;
    this.timestamp = timestamp;
    this.traceId = traceId;
  }

  public static builder<T>(): ResultBuilder<T> {
    return new ResultBuilder<T>();
  }
}

export class ResultBuilder<T> {
  private _success: boolean = true;
  private _message: string | null = null;
  private _data: T | null = null;
  private _pagination: Pagination | null = null;
  private _code: string | null = null;
  private _timestamp: string = new Date().toISOString();
  private _traceId: string | null = null;

  public setSuccess(success: boolean): this {
    this._success = success;
    return this;
  }

  public setMessage(message: string | null): this {
    this._message = message;
    return this;
  }

  public setData(data: T | null): this {
    this._data = data;
    return this;
  }

  public setPagination(pagination: Pagination | null): this {
    this._pagination = pagination;
    return this;
  }

  public setCode(code: string | null): this {
    this._code = code;
    return this;
  }

  public setTimestamp(timestamp: string): this {
    this._timestamp = timestamp;
    return this;
  }

  public setTraceId(traceId: string | null): this {
    this._traceId = traceId;
    return this;
  }

  public build(): ServiceResult<T> {
    return new ServiceResult<T>(
      this._success,
      this._message,
      this._data,
      this._pagination,
      this._code,
      this._timestamp,
      this._traceId,
    );
  }
}

export function isServiceResult(error: unknown): error is ServiceResult<unknown> {
  return (
    error instanceof ServiceResult
  );
}
