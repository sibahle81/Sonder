
export class PagedRequestResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    pageCount: number;
    rowCount: number;
}
