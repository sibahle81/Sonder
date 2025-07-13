import { Pagination } from './pagination';

export class PagedResult<T> {
    pagination: Pagination;
    resultSet: T;
}
