import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PremiumListingService } from './../../shared/Services/premium-listing.service';
import { PremiumListing } from '../../shared/entities/premium-listing';
import { PremiumListingDocumentsMemberDatasource } from 'projects/clientcare/src/app/policy-manager/views/premium-listing-documents-member/premium-listing-documents-member.datasource';
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'app-insured-lives-documents-member',
  templateUrl: './insured-lives-documents-member.component.html',
  styleUrls: ['./insured-lives-documents-member.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class InsuredLivesDocumentsMemberComponent extends WizardDetailBaseComponent<PremiumListing> implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PremiumListingDocumentsMemberDatasource;
  memberColumns = ['policyNumber', 'clientReference', 'memberName', 'idNumber', 'dateOfBirth', 'policyJoinDate', 'insuredLifeStatus', 'premium', 'actions'];

  counter = 1;
  policyId: any;
  isLoading = true;
  showReport = false;
  insuredLifeStatuses: Lookup[] = [];
  showStatus = 'showMemberList';

  ssrsBaseUrl: string;
  reportServer: string;
  reportUrl: string;
  showParameters: string;
  parameters: any;
  language: string;
  width: number;
  height: number;
  toolbar: string;

  get showMemberCertificate(): boolean {
    return this.showStatus === 'showMemberCertificate';
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly premiumListingService: PremiumListingService,
    private readonly insuredLifeService: PolicyInsuredLifeService,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.loadInsuredLifeStatuses();
    this.dataSource = new PremiumListingDocumentsMemberDatasource(this.insuredLifeService);
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
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

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = 'RMA.Reports.Common/Placeholder';
    this.showParameters = 'false';
    this.parameters = { default: true };
    this.language = 'en-us';
    this.width = 50;
    this.height = 50;
    this.toolbar = 'false';
  }

  onLoadLookups(): void {
    this.loadInsuredLifeStatuses();
  }

  loadInsuredLifeStatuses(): void {
    this.lookupService.getInsuredLifeStatuses().subscribe(
      data => {
        this.insuredLifeStatuses = data;
      }
    );
  }

  createForm(id: number): void { }

  populateForm(): void {
    this.premiumListingService.getPolicyId(this.model.fileIdentifier).subscribe(
      (data) => {
        this.policyId = data;
        this.loadData();
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.message);
      }
    );
  }

  populateModel(): void {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  loadData() {
    this.dataSource.getData({
      policyId: this.policyId,
      query: '',
      pageNumber: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      orderBy: 'ClientReference',
      sortDirection: 'asc',
      showActive: true
    });
  }

  getInsuredLifeStatus(statusId: number): string {
    const status = this.insuredLifeStatuses.find(s => s.id === statusId);
    return status ? status.name : '<unknown>';
  }

  showMembers(): void {
    this.showReport = false;
    this.showStatus = 'showMemberList';
  }

  membershipCertificate(policyId: number): void {
    this.showStatus = 'showMemberCertificate';
    this.counter++;
    this.showReport = false;
    this.parameters = { policyId, counter: this.counter };
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = 'RMA.Reports.ClientCare.Policy/RMAGroupPolicyMemberCertificate';
    this.showParameters = 'true';
    this.language = 'en-us';
    this.width = 100;
    this.height = 100;
    this.toolbar = 'false';
    this.isLoading = false;
    this.showReport = true;
  }

  reportError(event: any): void {
    this.showReport = false;
    if (event instanceof HttpErrorResponse) {
      this.alertService.error(event.message);
    }
  }

}

