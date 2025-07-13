import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10SubCategory } from 'projects/medicare/src/app/medi-manager/models/icd10-sub-category';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ICD10CodeListDataSource } from './icd10-code-list-view.datasource';

@Component({
  selector: 'icd10-code-list-view',
  templateUrl: './icd10-code-list-view.component.html',
  styleUrls: ['./icd10-code-list-view.component.css']
})
export class Icd10CodeListViewComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  displayedColumns: string[] = ['ICD10Code', 'ICD10CodeDescription', 'ICD10SubCategory', 'select'];
  currentQuery = '';
  form: any;
  formBuilder: any;
  query = '';

  dataSource: ICD10CodeListDataSource;
  selectedSubCategory: ICD10SubCategory;
  advancedFiltersExpanded: boolean;
  selectedSubCategoryId: number = 0;
  triggerReset: boolean;

  selection = new SelectionModel<ICD10Code>(true, []);
  icd10SubCategories: ICD10SubCategory[];
  eventType: EventTypeEnum;
  isSelected: boolean;
  selectedValue: ICD10Code;
  public filteredDataToSearch: ICD10SubCategory[];
  public icd10Message: string;

  constructor(
    public dialogRef: MatDialogRef<Icd10CodeListViewComponent>,
    public router: Router,
    public icd10CodeService: ICD10CodeService,
    public lookupService: LookupService,
    private readonly changeDetector: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  public ngOnInit(): void {
    this.dataSource = new ICD10CodeListDataSource(this.icd10CodeService, this.data.personEvent);
    this.eventType = this.data.eventType;
    this.isLoading$.next(false);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  public ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          } else if (this.currentQuery.length == 0) {
            this.loadData();
          }
        })
      ).subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  public search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  public reset() {
    this.paginator.firstPage();
    this.selectedSubCategoryId = 0;
    this.selectedSubCategory = null;
    this.advancedFiltersExpanded = false;
    this.triggerReset = !this.triggerReset;
    this.loadData();
  }

  private loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.selectedSubCategoryId, this.eventType);
  }

  setIcd10SubCategory($event: ICD10SubCategory) {
    this.advancedFiltersExpanded = false;

    this.selectedSubCategory = $event;
    this.selectedSubCategoryId = $event?.icd10SubCategoryId ? $event?.icd10SubCategoryId : 0;
    
    this.currentQuery = '';
    
    this.loadData();
  }

  public save() {
    this.dialogRef.close(this.selection.selected);
  }

  public cancel() {
    this.dialogRef.close();
  }

  lookup(e) {
    let value = String(e);
    value = value.toLowerCase();
    this.filteredDataToSearch = this.icd10SubCategories
      .filter(
        i =>
          (i.icd10SubCategoryCode + ' ' + i.icd10SubCategoryDescription)
            .toString()
            .toLowerCase()
            .indexOf(value) > -1
      )
      .map(w => {
        return w;
      });
  }

  clean(t) {
    t.value = '';
    this.lookup(t.value);
  }

  getICD10SubCategoryCode(icd10SubCategoryId: number): string {
    if (icd10SubCategoryId <= 0) { return; }
    if (this.icd10SubCategories) {
      const icd10SubCategory = this.icd10SubCategories.filter(a => a.icd10SubCategoryId === icd10SubCategoryId);
      if (icd10SubCategory && icd10SubCategory.length > 0) {
        return icd10SubCategory[0].icd10SubCategoryCode
      }
    }
  }

  checkboxLabel(row?: ICD10Code): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row}`;
  }

  checkboxSelected($event: any): boolean {
    let selected: ICD10Code;
    if ($event) {
      let icd10 = this.selection.selected.find(a => a.icd10CodeId === $event.icd10CodeId);

      if (icd10) {
        selected = icd10;
        this.isSelected = true;
      }

      const index = this.selection.selected.findIndex(s => s.icd10Code.includes('.9'));
      this.icd10Message = '';
      if (index >= 0) {
        this.selectedValue = this.selection.selected[index];
        this.icd10Message = 'ICD10 ' + this.selectedValue.icd10Code + ' not RMA Liability';
      }
    }
    return selected ? true : false;
  }
}
