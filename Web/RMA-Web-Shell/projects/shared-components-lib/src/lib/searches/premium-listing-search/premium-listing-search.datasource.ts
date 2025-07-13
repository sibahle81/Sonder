import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface PremiumListingFilters {
  companyNo: number;
  branchNo: number;
  controlNo: number;
  startDate: string | null;
  endDate: string | null;
}

export abstract class PremiumListingDatasource<T> extends DataSource<T> {
  protected dataSubject = new BehaviorSubject<T[]>([]);
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();

  public data: T[] = [];
  protected paginator: MatPaginator;
  protected sort: MatSort;

  private filters: PremiumListingFilters = {
    companyNo: -1,
    branchNo: -1,
    controlNo: -1,
    startDate: null,
    endDate: null
  };

  private searchFilter: string = '';

  constructor() {
    super();
  }

  connect(): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  disconnect() {
    this.dataSubject.complete();
    this.loadingSubject.complete();
  }

  setControls(paginator: MatPaginator, sort: MatSort) {
    this.paginator = paginator;
    this.sort = sort;
  }

  applyFilters(filters: PremiumListingFilters) {
    this.filters = { ...filters };
    this.filterData();
  }

  applySearch(searchText: string) {
    this.searchFilter = searchText.toLowerCase();
    this.filterData();
  }

  clearFilters() {
    this.filters = {
      companyNo: -1,
      branchNo: -1,
      controlNo: -1,
      startDate: null,
      endDate: null
    };
    this.searchFilter = '';
    this.filterData();
  }

  protected filterData() {
    let filteredData = [...this.data];

    if (this.filters.companyNo !== -1) {
      filteredData = filteredData.filter(item => 
        (item as any).companyNo === this.filters.companyNo
      );
    }

    if (this.filters.branchNo !== -1) {
      filteredData = filteredData.filter(item => 
        (item as any).branchNo === this.filters.branchNo
      );
    }

    if (this.filters.controlNo !== -1) {
      filteredData = filteredData.filter(item => 
        (item as any).level3 === this.filters.controlNo
      );
    }

    if (this.filters.startDate && this.filters.endDate) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date((item as any).createdDate);
        const startDate = new Date(this.filters.startDate);
        const endDate = new Date(this.filters.endDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    if (this.searchFilter) {
      filteredData = filteredData.filter(item => this.filterPredicate(item, this.searchFilter));
    }

    this.dataSubject.next(this.getPagedData(this.getSortedData(filteredData)));
  }

  protected abstract filterPredicate(data: T, filter: string): boolean;

  protected getPagedData(data: T[]): T[] {
    if (!this.paginator) return data;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  protected getSortedData(data: T[]): T[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      const sortColumn = this.sort.active;
      return this.compare(a[sortColumn], b[sortColumn], isAsc);
    });
  }

  protected compare(a: any, b: any, isAsc: boolean) {
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;
    
    if (typeof a === 'string' && typeof b === 'string') {
      return (a.localeCompare(b)) * (isAsc ? 1 : -1);
    }
    
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  abstract getData(): void;
}
