import { OnInit, ElementRef, ViewChildren, ViewChild, QueryList, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, map } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class ListComponent implements OnInit {
  get isError(): boolean { return this.dataSource.isError; }

  columns: any;
  displayedColumns: string[];

  hideAddButton = false;
  hideAddButtonText: string;
  actionsLinkText = 'View / Edit';
  removeLinkText = 'Remove';
  customActionLinkText = 'Select';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  @ViewChildren(MultiSelectComponent)
  multiSelectComponentChildren: QueryList<MultiSelectComponent>;

  protected constructor(
    readonly alertService: AlertService,
    readonly router: Router,
    readonly dataSource: Datasource,
    readonly detailsUrl: string,
    readonly title: string,
    readonly titlePlural: string,
    readonly searchHint = '',
    readonly hideActionsLink = false,
    readonly hideSelectLink = false,
    readonly hideRemoveLink = true,
    readonly defaultSort = true,
    readonly hideCustomActionLink = true
  ) {
    this.setupDisplayColumns();
    this.displayedColumns = this.columns.map((column: any) => column.columnDefinition);
    if (!this.hideActionsLink) { this.displayedColumns.push('actions'); }
  }

  ngOnInit(): void {
    this.dataSource.setControls(this.paginator, this.sort, this.defaultSort);
    this.dataSource.getData();
    this.clearFilter();

    if (this.filter) {
      fromEvent(this.filter.nativeElement, 'keyup').pipe(
        debounceTime(150)
       , distinctUntilChanged()
       , tap(() => {
          if (!this.dataSource) {
            return;
        }
          this.dataSource.filter = this.filter.nativeElement.value;
        }
        )).subscribe();
    }
  }

  onSelect(item: any): void {
    this.router.navigate([this.detailsUrl, item.id]);
  }

  onRemove(item: any): void { }

  onCustomAction(item: any): void { }

  newItem(): void {
    this.router.navigate([this.detailsUrl]);
  }

  clearFilter(): void {
    this.dataSource.filteredData = new Array();
    this.dataSource.filter = '';
    if (this.filter != null) { this.filter.nativeElement.value = ''; }
  }

  actionsLinkTextChange(row: any): string {
    return this.actionsLinkText;
  }

  removeLinkTextChange(row: any): string {
    return this.removeLinkText;
  }

  customActionLinkTextChange(row: any): string {
    return this.customActionLinkText;
  }
  getLookupControl(lookupName: string) {
    const component = this.multiSelectComponentChildren.find((child) => child.lookupName === lookupName);
    return component;
  }

  abstract setupDisplayColumns(): void;

    resetColumns(): void {
        this.displayedColumns = this.columns.pipe(map((column: any) => column.columnDefinition));
        if (!this.hideActionsLink) { this.displayedColumns.unshift('actions'); }
    }
    refresh(): void {
      this.dataSource.getData();
  }
}
