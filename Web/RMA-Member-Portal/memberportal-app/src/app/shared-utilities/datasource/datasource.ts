import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AppEventsManager } from '../app-events-manager/app-events-manager';
 
export abstract class Datasource extends DataSource<any> {
  filteredData: any[] = [];
  renderedData: any[] = [];

  isLoading: boolean;
  isError: boolean;
  filterChange: BehaviorSubject<string>;
  dataChange: BehaviorSubject<any[]>;

  paginator: MatPaginator;
  sort: MatSort;
  defaultSortColumn = 'id';
  defaultSortDirection: SortDirection = 'asc';

  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }
  get data(): any[] { return this.dataChange.value; }
  get loading(): boolean { return this.isLoading; }

  protected constructor(
    private readonly privateAppEventsManager: AppEventsManager,
    private readonly privateAlertService: AlertService) {
    super();
    this.isLoading = false;
    this.isError = false;
    this.filterChange = new BehaviorSubject('');
    this.dataChange = new BehaviorSubject<any[]>([]);
  }

  abstract connect(): Observable<any[]>;
  abstract getData(data?: any): void;

  setControls(paginator: MatPaginator, sort: MatSort, defaultSort = true): void {
    this.paginator = paginator;
    this.sort = sort;
    if (!sort.active && defaultSort) { this.setDefaultSortOrder(); }
  }

  setDefaultSortOrder(): void {
    if (this.defaultSortColumn) {
      this.sort.active = this.defaultSortColumn;
      this.sort.direction = this.defaultSortDirection;
    }
  }

  getSortedData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];

      const valueA = isNaN(+propertyA) ? propertyA ? propertyA.toString().trim().toLocaleLowerCase() : propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB ? propertyB.toString().trim().toLocaleLowerCase() : propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
  }

  disconnect() {
  }

  startLoading(message: string): void {
    this.isLoading = true;
    this.privateAppEventsManager.loadingStart(message);
  }

  stopLoading(): void {
    this.isLoading = false;
    this.privateAppEventsManager.loadingStop();
  }

  showError(error: any): void {
    this.stopLoading();
    this.isError = true;
    this.privateAlertService.handleError(error);
  }

  clearData(): void {
    this.filteredData = new Array();
    this.dataChange.next(new Array());
  }
}
