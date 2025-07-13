import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HealthCareProvider } from '../../../medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from '../../../medi-manager/services/healthcareProvider.service';
import { Invoice } from '../../../medical-invoice-manager/models/medical-invoice';
import { SearchInvoiceCriteria } from '../../models/search-invoice-criteria';
import { SearchInvoiceDataSource } from '../../datasources/search-invoice-datasource';
import { InvoiceStatusEnum } from '../../../medical-invoice-manager/enums/invoice-status.enum';
import { MedicareMedicalInvoiceCommonService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { InvoiceDetails } from '../../../medical-invoice-manager/models/medical-invoice-details';
import { SelectionModel } from '@angular/cdk/collections';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { isNullOrUndefined } from 'util';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

export enum SelectType {
  single,
  multiple
}

@Component({
  selector: 'app-search-medical-invoice',
  templateUrl: './search-medical-invoice.component.html',
  styleUrls: ['./search-medical-invoice.component.css']
})

export class SearchMedicalInvoiceComponent implements OnInit {

  form: UntypedFormGroup;
  displayedColumns: string[] = [
  'select',
  'claimReferenceNumber',
  'RMAInvoiceNo',
  'invoiceStatus',
  'MSP',
  'hcpInvoiceNumber',
  'hcpAccountNumber',
  'batchNumber',
  'serviceDate',
  'invoiceDate',
  'paymentConfirmationDate',
  'person',
  'status',
  'invoiceAmount',
  'authorisedAmount',
  'SCare',
  'preAuthNumber',
  'actions'];
  practiceNumberControl = new UntypedFormControl();
  practiceNameControl = new UntypedFormControl();
  invoiceDateControl = new UntypedFormControl();
  treatmentFromDateControl = new UntypedFormControl();
  treatmentToDateControl = new UntypedFormControl();
  practitionerTypeControl = new UntypedFormControl();
  invoiceStatusControl = new UntypedFormControl();
  switchBatchInvoiceStatusControl = new UntypedFormControl();
  claimReferenceControl = new UntypedFormControl();
  supplierInvoiceNumberControl = new UntypedFormControl();
  accountNumberControl = new UntypedFormControl();
  userHealthCareProviderControl = new UntypedFormControl();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource<Invoice>();
  pageLength: number;
  loading$ = new BehaviorSubject<boolean>(false);
  search$ = new BehaviorSubject<string>(null);
  isInternalUser: boolean = false;
  currentHealthCareProvider: HealthCareProvider = null;
  currentUserEmail: string;
  showSearchProgress: boolean;
  practitionerTypes: Lookup[];
  invoiceStatuses: Lookup[];
  searchInvoiceCriteria: SearchInvoiceCriteria;
  searchInvoiceDataSource: SearchInvoiceDataSource;
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  selection = new SelectionModel<InvoiceDetails>(true, []);
  selectedInvoice: InvoiceDetails[] = [];

  selectType = [
    { text: "Single", value: SelectType.single },
    { text: "Multiple", value: SelectType.multiple }
  ];

  displayType = SelectType.single;

  searchingPractice = false;
  disableSubmit: boolean = true;
  userHealthCareProviders: UserHealthCareProvider[] = [];
  selectedPracticeNumber: string;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    readonly invoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly healthCareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly lookupService: LookupService,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    private readonly alertService: AlertService,
    private router: Router) 
    { 
      this.getLookups();
    }

  ngOnInit(): void {
    this.createForm();
    var currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser.email;
    this.isInternalUser = currentUser.isInternalUser;
    if (this.isInternalUser)
    this.disableSubmit = false;

    this.practitionerTypeControl.setValue('0');
    this.invoiceStatusControl.setValue('0');
    this.switchBatchInvoiceStatusControl.setValue('0');

    if (!this.isInternalUser) {
       this.getUserHealthCareProviders(currentUser);
    }
  }

  createForm(){
    this.form = this.formBuilder.group({
      practiceNameControl: [''],
      practiceNumberControl: [''],
      supplierInvoiceNumberControl: [''],
      accountNumberControl: [''],
      invoiceDateControl: [''],
      treatmentFromDateControl: [''],
      treatmentToDateControl: [''],
      invoiceStatusControl: ['0'],
      switchBatchInvoiceStatusControl: ['0'],
      practitionerTypeControl: ['0'],
      claimReferenceControl: [''],
      userHealthCareProviderControl: ['']
    });

    this.searchInvoiceDataSource = new SearchInvoiceDataSource(this.invoiceCommonService);
    this.searchInvoiceDataSource.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
  }

  clear() {
    this.form.reset();
    this.practiceNumberControl.reset();
    this.practiceNameControl.reset();
    this.invoiceDateControl.reset();
    this.treatmentFromDateControl.reset();
    this.treatmentToDateControl.reset();
    this.claimReferenceControl.reset();
    this.supplierInvoiceNumberControl.reset();
    this.accountNumberControl.reset();
    this.practitionerTypeControl.patchValue('0');
    this.invoiceStatusControl.patchValue('0');
    this.switchBatchInvoiceStatusControl.patchValue('0');
    this.userHealthCareProviderControl.patchValue(this.selectedPracticeNumber);
    this.searchInvoiceDataSource.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
  }
  
  getLookups() {
    this.getPractitionerTypes();
    this.getInvoiceStatuses();
  }

  getPractitionerTypes(): void {
    this.lookupService.getMedicalPractitionerTypes().subscribe(data => {
      this.practitionerTypes = data;
      this.practitionerTypes.pop();
    });
  }

  getInvoiceStatuses(): void {
    this.lookupService.getMedicalInvoiceStatuses().subscribe(data => {
      this.invoiceStatuses = data;
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.searchInvoiceDataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
            this.search();
        })
      )
      .subscribe();
  }

  search() {
    if (!this.isInternalUser && this.userHealthCareProviders.length <= 0) {
      this.alertService.error("External user must be linked to a medical service provider.")
      return;
    }
    
    this.showSearchProgress = true;
    this.searchInvoiceCriteria = {
      practiceNumber: null,
      practitionerTypeId: this.practitionerTypeControl.value,
      invoiceStatusId: this.invoiceStatusControl.value,
      switchBatchInvoiceStatusId: this.switchBatchInvoiceStatusControl.value,
      treatmentFromDate: (this.treatmentFromDateControl.value != null && this.treatmentFromDateControl.value != '') ? 
        this.datepipe.transform(this.treatmentFromDateControl.value, 'yyyy-MM-dd') : this.datepipe.transform("", 'yyyy-MM-dd'),
      treatmentToDate: (this.treatmentToDateControl.value != null && this.treatmentToDateControl.value != '') ? 
        this.datepipe.transform(this.treatmentToDateControl.value, 'yyyy-MM-dd') : this.datepipe.transform("", 'yyyy-MM-dd'),
      invoiceDate: (this.invoiceDateControl.value != null && this.invoiceDateControl.value != '') ? 
        this.datepipe.transform(this.invoiceDateControl.value, 'yyyy-MM-dd') : this.datepipe.transform("", 'yyyy-MM-dd'),
      supplierInvoiceNumber: this.supplierInvoiceNumberControl.value,
      accountNumber: this.accountNumberControl.value,
      claimReference: this.claimReferenceControl.value,
      pageNumber: 0,
      pageSize: 0
    }

    if (!this.isInternalUser){
       this.searchInvoiceCriteria.practiceNumber = this.selectedPracticeNumber;
    }
    else
    {
       this.searchInvoiceCriteria.practiceNumber = this.practiceNumberControl.value;
    }
    
    this.searchInvoiceDataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchInvoiceCriteria);          
  }

  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(invoice: InvoiceDetails) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false },
      {
        title: 'Payment Breakdown', url: '', disable: false
      }
    ];

  }

  onMenuItemClick(invoice: InvoiceDetails, menu: any): void {
    switch (menu.title) {
      case 'View':
        this.onClickView(invoice);
        break;
      case 'Payment Breakdown':
        break;
    }
  }

  onClickView(invoice) {
    this.router.navigate(['/medicare/view-search-results', invoice.personEventId]);
  }

  selectHandler(row: InvoiceDetails) {
    if (this.displayType == SelectType.single) {
      if (!this.selection.isSelected(row)) {
        this.selection.clear();
      }
    }
    this.selection.toggle(row);
  }

  getMedicalServiceProvider(event: any) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }

    if (String.isNullOrEmpty(this.practiceNumberControl.value)){
      return;
    }

    const practiceNumber = this.practiceNumberControl.value as string;
    this.searchingPractice = true;
    this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
      if (healthCareProvider) {
        this.practiceNameControl.patchValue(healthCareProvider.name);
      }
      else {
        this.alertService.error("Practice not found.")
      }

      this.searchingPractice = false;
    });
  }

  getInvoiceUnderAssessReasons(invoice: InvoiceDetails): string {
    if (invoice.invoiceId && invoice.invoiceId > 0) {
      if (invoice.invoiceUnderAssessReasons
        && invoice.invoiceUnderAssessReasons.length > 0) {
          let underAssessReasons =  invoice.invoiceUnderAssessReasons.map(reason => reason.underAssessReason);
          underAssessReasons = underAssessReasons.filter((value, index) => underAssessReasons.indexOf(value) === index);
          return underAssessReasons.join(",");
        }
        else {
          return String.Empty;
        }
      }
      else {
        return String.Empty;
      }
    }

    getUserHealthCareProviders(currentUser: User): void {
      let currentUserHCPs = null;
      this.userService.getUserHealthCareProviders(currentUser.email).subscribe((result) => {
        currentUserHCPs = result;
        this.userHealthCareProviders = result;
        if (result.length > 0) {
          const hcpContext = userUtility.getSelectedHCPContext();
          if (hcpContext && hcpContext.healthCareProviderId > 0) {
            this.selectedPracticeNumber = hcpContext.practiceNumber;
          }
          else {
            this.selectedPracticeNumber = result[0].practiceNumber;
          }
          this.form.controls.userHealthCareProviderControl.setValue(this.selectedPracticeNumber);
          const practiceNumber = this.selectedPracticeNumber;
          this.searchingPractice = true;
          this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
          if (healthCareProvider) {
              this.practiceNameControl.patchValue(healthCareProvider.name);
              this.searchingPractice = false;
              this.disableSubmit = false;
          }
          else {
               this.alertService.error("Practice not found.")
          }
        });
        }
      },
        (error) => {
        },
        () => {
          if (!isNullOrUndefined(currentUserHCPs) && currentUserHCPs.length > 0) {
            this.healthCareProviderService.filterHealthCareProviders(currentUserHCPs[0].practiceNumber)
              .subscribe(healthCareProviders => {
                if (!isNullOrUndefined(healthCareProviders) && healthCareProviders.length > 0) {
                }
                else {
                  this.alertService.error("No Healthcare Providers found for user after filter");
                }
              }
              );
          }
          else {
            this.alertService.error("No Healthcare Providers found for user");
          }
        }
      );
    }

    onUserHealthCareProviderChanged(event) : void {
      this.selectedPracticeNumber = event.value;
      const practiceNumber = event.value;
      this.searchingPractice = true;
      this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
        if (healthCareProvider) {
          this.practiceNameControl.patchValue(healthCareProvider.name);
        }
        else {
          this.alertService.error("Practice not found.");
        }
        this.searchingPractice = false;
    });
  }
}
