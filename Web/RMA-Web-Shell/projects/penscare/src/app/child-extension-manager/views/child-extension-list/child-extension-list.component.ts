import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ChildToExtensionListDataSource } from './child-extension-list-datasource'

@Component({
  selector: 'app-child-extension-list',
  templateUrl: './child-extension-list.component.html',
  styleUrls: ['./../../styles/child-to-adult-list.css', './../../../styles/penscare.css'],
  providers: [ChildToExtensionListDataSource]
})
export class ChildExtensionListComponent implements OnInit {

  @ViewChild('searchField', { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  currentQuery: string;
  creatingWizard = false;

  menus: { title: string, action: string, disable: boolean}[];
  displayedColumns = ['beneficiaryName', 'dateOfBirth',  'expiryDate', 'pensionCaseNumber','actions'];
  constructor(
    public readonly dataSource: ChildToExtensionListDataSource,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  ngAfterViewInit(): void {
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
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();

    this.search(true);
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }


  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  search(isInitialLoad?: boolean): void {
    if (this.form.valid) {
        this.currentQuery = this.readForm();
        this.dataSource.getData(1, 5 , 'desc', '', this.currentQuery);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5 , 'desc', '', '');
    }
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  filterMenu(item: any) {
    this.menus =
      [
        { title: 'View', action: 'view', disable: false}
      ];
  }

  onMenuItemClick(item, menu): void {
    switch (menu.action) {
      case 'view':
        this.router.navigate(['penscare/child-extension-manager/view-child-extension/', item.beneficiaryRolePlayerId, item.recipientRolePlayerId, item.ledgerId]);
        break
    }
  }
}
