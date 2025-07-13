import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PreAuthWorkItemDataSource } from 'projects/medicare/src/app/medi-manager/datasources/preauth-work-item-datasource';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { PreauthTypeEnum } from '../../enums/preauth-type-enum';
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
@Component({
  selector: 'preauth-work-items-list',
  templateUrl: './preauth-work-items-list.component.html',
  styleUrls: ['./preauth-work-items-list.component.css']
})
export class PreauthWorkItemsListComponent implements OnInit, AfterViewInit {

  displayedColumns = [
    'name',
    'type',
    'requestComments',
    'claimNumber',
    'authorizationFrom',
    'authorizationTo',
    'healthcareProvider',
    'createdBy',
    'lockedStatus',
    'wizardStatusText',
    'overAllSLAHours',
    'actions',
    'delete'
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  dataSource: PreAuthWorkItemDataSource;
  pageLength: number;
  loading$ = new BehaviorSubject<boolean>(false);
  title: string = "Find Incomplete Items (saved or partial captures) to continue...";
  showIfReallocate: boolean;
  isLoading = false;

  constructor(
    private readonly router: Router,
    public datepipe: DatePipe,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService) {
  }

  ngOnInit() {
    this.dataSource = new PreAuthWorkItemDataSource(this.wizardService);
    this.paginator.pageIndex = 0;
    this.sort.direction = "asc";
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData(): void {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, "overAllSLAHours",
      this.sort.direction == '' ? "desc" : this.sort.direction, "pre-authorization form");
  }

  onSelect(item: Wizard): void{
    const arrayData: any[] = JSON.parse(item.data);
    const startWizardRequest = new StartWizardRequest();
    const ActionTypeEnumVal = MedicareUtilities.getCrudActionTypeEnumId(item.type)
    startWizardRequest.type = MedicareUtilities.preAuthWizardType(arrayData[0].preAuthType,ActionTypeEnumVal);
    this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${item.id}`);  
  }

  onDeleteWizard(item: any){
    this.confirmservice.confirmWithoutContainer('Delete Wizard', 'Are you sure you want to delete this wizard?',
    'Center', 'Center', 'Yes', 'No').subscribe(result => {
      if (result === true) {
        this.isLoading = true;
        this.wizardService
          .cancelWizard(item.id)
          .subscribe(() => {
            this.alertService.success('Wizard Deleted successfully');
            this.reloadCurrentRoute();
            this.isLoading = false;
          }, (error) => {
            this.alertService.error(error);
            this.isLoading = false;
          });
      }
    });
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  filterForm = new UntypedFormGroup({
    containsText: new UntypedFormControl(),
    containsDate: new UntypedFormControl(),
    healthCareProviderName: new UntypedFormControl(),
    temporaryReferenceNo: new UntypedFormControl()
  });

  get containsText() { return this.filterForm.get('containsText'); }
  get containsDate() { return this.filterForm.get('containsDate'); }
  get healthCareProviderName() { return this.filterForm.get('healthCareProviderName'); }
  get temporaryReferenceNo() { return this.filterForm.get('temporaryReferenceNo'); }

  onFilterSearch() {

    const filterValues = {
      containsText: this.containsText.value,
      containsDate: this.datepipe.transform(this.containsDate.value, 'yyyy-MM-dd'),
      healthCareProviderName: this.healthCareProviderName.value,
      temporaryReferenceNo: this.temporaryReferenceNo.value
    }
    const size = 100;
    this.dataSource.getWizardDataByQuery(this.paginator.pageIndex + 1, size,
      "overAllSLAHours", this.sort.direction == '' ? "desc" : this.sort.direction, JSON.stringify(filterValues));
  }

  onFilterClear() {
    this.filterForm.reset();
  }

  getWorkItemDataTestMethod(data, index, preAuthData) {
    let dataShow = JSON.parse(data.data);
    if (preAuthData == 'temporaryReferenceNo') {
      return dataShow[0].temporaryReferenceNo;
    }
    else if (preAuthData == 'dateAuthorisedFrom') {
      return dataShow[0].dateAuthorisedFrom;
    }
    else if (preAuthData == 'dateAuthorisedTo') {
      return dataShow[0].dateAuthorisedTo;
    }
    else if (preAuthData == 'healthCareProviderName') {
      return dataShow[0].healthCareProviderName;
    }
    else if (preAuthData == 'requestComments') {
      return dataShow[0].requestComments;
    }
  }

}
