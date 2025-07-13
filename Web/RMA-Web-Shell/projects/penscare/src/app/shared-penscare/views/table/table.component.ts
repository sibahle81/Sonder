import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild,} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, fromEvent, merge } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

interface Iform {
  query: FormControl<string|null>
}

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.css"],
})
export class TableComponent implements OnInit {
  @Input() title: string;
  @Input() isSearchable: boolean = false;
  @Input() searchPlaceHolder: string;
  @Input() buttonTitle: string;
  @Input() dataSource: any;
  @Input() pageMetaData: any;
  @Input() ledgerId: number;

  @ViewChild("searchField", { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Output() refreshDate = new EventEmitter();
  @Output() onActionClick = new EventEmitter();
  @Output() buttonClick = new EventEmitter();

  elementKeyUp: Subscription;
  form: FormGroup;
  currentQuery: string;

  creatingWizard: boolean;

  get isLoading(): boolean {
    return this.dataSource.isLoading;
  }
  get isError(): boolean {
    return this.dataSource.isError;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.isSearchable) this.createForm();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.rowCount$.subscribe((count) => (this.paginator.length = count));
    if (this.isSearchable) {
      fromEvent(this.filter.nativeElement, "keyup")
        .pipe(debounceTime(200), distinctUntilChanged(), tap(() => {
            this.currentQuery = this.filter.nativeElement.value;
            if (this.currentQuery.length >= 3) {
              this.paginator.pageIndex = 0;
              this.loadData();
            }
          })).subscribe();
    }

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadData()))
      .subscribe();

    this.search(true);
  }

  loadData(): void {
    this.dataSource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort?.active,
      this.sort?.direction,
      this.currentQuery || this.ledgerId
    );
  }

  createForm(): void {
    this.form = this.fb.group<Iform>({
      query: new FormControl(null, [
        Validators.minLength(3),
        Validators.required,
      ]),
    });
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  search(isInitialLoad?: boolean): void {
    if (this.isSearchable && this.form.valid) {
      this.currentQuery = this.readForm();
      this.dataSource.getData(1, 5, "", "desc", this.currentQuery);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5, "CreatedDate", "desc", this.ledgerId);
    }
  }

  onButtonClick() {
    this.buttonClick.emit();
  }

  onMenuItemClick(item, menu): void {
    let obj = {
      item: item,
      menu: menu
    }
    this.onActionClick.emit(obj)
  }
}
