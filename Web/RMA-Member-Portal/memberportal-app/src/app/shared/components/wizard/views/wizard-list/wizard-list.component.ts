import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { Wizard } from '../../shared/models/wizard';
import { WizardBreadcrumbService } from '../../shared/services/wizard-breadcumb.service';
import { WizardListDatasource } from './wizard-list.datasource';

@Component({
  templateUrl: './wizard-list.component.html'
})
export class WizardListComponent implements OnInit {
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }

  allowAdd = true;
  label = 'Incomplete Policies';
  buttonLabel = 'Add new policy';
  type: string;
  displayedColumns = ['name', 'type', 'modifiedByDisplayName', 'lockedStatus', 'wizardStatus', 'actions'];
  currentUser: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly breadcrumbService: WizardBreadcrumbService,
    public readonly dataSource: WizardListDatasource) {
  }

  ngOnInit() {
    this.breadcrumbService.setBreadcrumb('Policy Manager', this.label);
    this.currentUser = this.authService.getUserEmail();

    this.activatedRoute.params.subscribe((params: Params) => {
      this.dataSource.setControls(this.paginator, this.sort);
      this.type = params.type;

      this.dataSource.parameter = this.type;
      this.dataSource.getData();
      this.clearFilter();

      fromEvent(this.filter.nativeElement, 'keyup').pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(
          () => {
            if (!this.dataSource) { return; }
            this.dataSource.filter = this.filter.nativeElement.value;
          }
        )
      );
    });
  }

  onSelect(item: Wizard): void {
    Wizard.redirect(this.router, item.type, item.id);
  }

  newWizard(navigate: any[] = ['clientcare/policy-manager/quote-list']): void {
    this.router.navigate(navigate);
  }

  clearFilter(): void {
    this.dataSource.filter = '';
    this.filter.nativeElement.value = '';
  }

  filterData(event: any): void {
    if (this.dataSource) {
      this.dataSource.filter = this.filter.nativeElement.value;
    }
  }
}
