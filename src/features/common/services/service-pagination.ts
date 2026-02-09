export class Pagination {
  public readonly total: number;
  public readonly pages: number;
  public readonly page: number;
  public readonly next: number | null;
  public readonly previous: number | null;

  public constructor(
    total: number,
    pages: number,
    page: number,
    next: number | null = null,
    previous: number | null = null,
  ) {
    this.total = total;
    this.pages = pages;
    this.page = page;
    this.next = next;
    this.previous = previous;
  }

  public static builder(): PaginationBuilder {
    return new PaginationBuilder();
  }
}

export class PaginationBuilder {
  private _total: number = 0;
  private _pages: number = 0;
  private _page: number = 1;
  private _next: number | null = null;
  private _previous: number | null = null;

  public setTotal(total: number): this {
    this._total = total;
    return this;
  }

  public setPages(pages: number): this {
    this._pages = pages;
    return this;
  }

  public setPage(page: number): this {
    this._page = page;
    return this;
  }

  public setNext(next: number | null): this {
    this._next = next;
    return this;
  }

  public setPrevious(previous: number | null): this {
    this._previous = previous;
    return this;
  }

  public build(): Pagination {
    return new Pagination(
      this._total,
      this._pages,
      this._page,
      this._next,
      this._previous,
    );
  }
}
