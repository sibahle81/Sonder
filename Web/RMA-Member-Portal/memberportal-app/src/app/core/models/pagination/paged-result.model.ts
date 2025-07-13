import { Pagination } from './pagination.model';

export class PagedResult<T> {
    pagination: Pagination;
    resultSet: T;
}
