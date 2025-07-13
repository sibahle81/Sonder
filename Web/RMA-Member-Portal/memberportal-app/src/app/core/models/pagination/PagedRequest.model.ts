export class PagedResult {
    SearchCriteria: string;
    Page: number;
    PageSize: number;
    OrderBy: string;
    IsAscending: boolean;

    constructor() {
        this.Page = 1;
        this.PageSize = 10;
        this.IsAscending = true;
        this.OrderBy = 'Id';
    }
}
