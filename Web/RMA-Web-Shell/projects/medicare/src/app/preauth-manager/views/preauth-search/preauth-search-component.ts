import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { merge, of, Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, } from 'rxjs/operators';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { DatePipe } from '@angular/common';
import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { isNullOrUndefined } from 'util';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PreAuthPractitionerTypeSetting } from 'projects/medicare/src/app/medi-manager/models/preAuth-practitioner-type-setting';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { PreAuthSearchModel } from 'projects/medicare/src/app/preauth-manager/models/preauth-search-model';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { MedicareMedicalInvoiceCommonService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { InvoiceStatusEnum } from '../../../medical-invoice-manager/enums/invoice-status.enum';

@Component({
  selector: 'preauth-search-component',
  templateUrl: './preauth-search-component.html',
  styleUrls: ['./preauth-search-component.css'],
  providers: [HealthcareProviderService]
})


export class PreauthSearchComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  currentQuery: string;
  displayedColumns: string[] = ['claimReferenceNumber', 'preAuthNumber', 'healthCareProviderDetail', 'dateAuthorisedFrom', 'dateAuthorisedTo', 'dateAuthorised', 'requestComments', 'preAuthStatus', 'createdBy', 'preAuthId', 'viewReport'];
  searchByPreAuthNumberControl = new UntypedFormControl();
  searchByClaimNumberControl = new UntypedFormControl();
  searchByPracticeNumberControl = new UntypedFormControl();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource<PreAuthorisation>();
  pageLength: number;
  loading$ = new BehaviorSubject<boolean>(false);
  search$ = new BehaviorSubject<string>(null);
  canView: boolean;
  canEdit: boolean;
  canReview: boolean;
  canDelete: boolean;
  isInternalUser: boolean = false;
  currentHealthCareProvider: HealthCareProvider = null;
  showPreAuthCaptureButton: boolean = true;
  currentUserEmail: string;
  showSearchProgress: boolean;
  authType: string;
  preauthTypeEnum = PreauthTypeEnum;
  claimStatus: { personEventId: number, claimStatus: string }[] = [];
  isProstheticEditableMap: Map<number, boolean> = new Map<number, boolean>();

  constructor(
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly digiCareService: DigiCareService,
    private readonly wizardService: WizardService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    private readonly datePipe: DatePipe,
    private readonly healthcareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef) { }

  currentUrl = this.router.url;

  ngOnInit(): void {
    this.setPermissions();
    var currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser.email;
    this.isInternalUser = currentUser.isInternalUser;
    this.checkIfAlliedHealthPractitioner(currentUser);
  }

  setPermissions(): void {
    const permissions = this.authService.getCurrentUserPermissions();
    this.canView = permissions.find(permission => permission.name === 'View PreAuthorisation') != null;
    this.canEdit = permissions.find(permission => permission.name === 'Edit PreAuthorisation') != null;
    this.canReview = permissions.find(permission => permission.name === 'Review PreAuthorisation') != null;
    this.canDelete = permissions.find(permission => permission.name === 'Delete PreAuthorisation') != null;

    if (this.canReview)
      this.displayedColumns.push('reviewPreAuth');
    if (this.canEdit)
      this.displayedColumns.push('editPreAuth');
  }

  checkIfAlliedHealthPractitioner(currentUser: User): void {
    let currentUserHCPs = null;
    let userHealthCareProviders = null;
    this.userService.getUserHealthCareProviders(currentUser.email).subscribe((x) => {
      currentUserHCPs = x;
    },
      (error) => {
      },
      () => {
        if (!isNullOrUndefined(currentUserHCPs) && currentUserHCPs.length > 0) {
          this.healthcareProviderService.filterHealthCareProviders(currentUserHCPs[0].practiceNumber)
            .subscribe(healthCareProviders => {
              if (!isNullOrUndefined(healthCareProviders) && healthCareProviders.length > 0) {
                userHealthCareProviders = healthCareProviders;
              }
              else {
                console.log("No Healthcare Providers found for user after filter");
              }
            },
              () => { },
              () => {
                if (!isNullOrUndefined(userHealthCareProviders)) {
                  let preAuthPractitionerTypeSetting = new PreAuthPractitionerTypeSetting();
                  this.mediCarePreAuthService.getPreAuthPractitionerTypeSetting(PreauthTypeEnum.Hospitalization, userHealthCareProviders[0].providerTypeId).subscribe(
                    (result) => {
                      preAuthPractitionerTypeSetting = result as unknown as PreAuthPractitionerTypeSetting;
                    },
                    (error) => {
                    },
                    () => {
                      if (preAuthPractitionerTypeSetting.isHospital || preAuthPractitionerTypeSetting.isTreatingDoctor) {
                        this.showPreAuthCaptureButton = true;
                      }
                      else {
                        this.showPreAuthCaptureButton = false;
                      }
                    }
                  );
                }
              }
            );
        }
        else {
          console.log("No Healthcare Providers found for user");
        }
      }
    );
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.loadAllData();
  }

  async getLiabilityStatusForClaims(preAuths: PagedRequestResult<PreAuthorisation>): Promise<void> {
    if (!isNullOrUndefined(preAuths.data) && preAuths.data.length > 0) {
      this.claimStatus = [];
      const personEventIds: Array<number> = preAuths.data.map(p => p.personEventId);
      personEventIds.map(async personEventId => {
        let claim = await this.mediCarePreAuthService.getPreAuthClaimDetailByPersonEventId(personEventId).toPromise();
        const item: any = { personEventId: personEventId, claimStatus: claim.claimLiabilityStatus };
        this.claimStatus.push(item);
        if (this.claimStatus.length === preAuths.data.length) {
          this.dataSource.data = preAuths.data;
          this.pageLength = preAuths.rowCount;
          this.loading$.next(false);
          this.showSearchProgress = false;
        }
      });
    }
    else {
      this.loading$.next(false);
      this.showSearchProgress = false;
    }
  }

  loadAllData(): void {
    this.showSearchProgress = true;
    this.listOption()
      .pipe(
        tap(() => this.loading$.next(true)))
      .subscribe((result: PagedRequestResult<PreAuthorisation>) => {
        this.getLiabilityStatusForClaims(result);
        this.populateProstheticEditableMap(result.data);
      });

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        switchMap(() => {
          this.loading$.next(true);
          return this.listOption();
        }),
      )
      .subscribe((result: PagedRequestResult<PreAuthorisation>) => {
        if (result) {
          this.getLiabilityStatusForClaims(result);
          this.populateProstheticEditableMap(result.data);
        }
      });
  }

  onSelect(item: PreAuthorisation): void {
    let redirectUrl: string = MedicareUtilities.preAuthWizardType(item.preAuthType, CrudActionType.read);
    this.router.navigate(['/medicare/' + `${redirectUrl}`, item.preAuthId]);
  }

  search() {
    this.showSearchProgress = true;
    if (this.searchByPreAuthNumberControl.value === '' && this.searchByClaimNumberControl.value === '' && this.searchByPracticeNumberControl.value === '') {
      this.showSearchProgress = false;
      this.pageLength = 0;
      this.confirmservice.confirmWithoutContainer('Search validation', 'Capture at least one field for searching PreAuthorisation',
        'Center', 'Center', 'OK').subscribe(result => {

        });
      return;
    }
    else {
      let preauthSearchModel = new PreAuthSearchModel();
      preauthSearchModel.preAuthNumber = this.searchByPreAuthNumberControl.value;
      preauthSearchModel.claimReferenceNumber = this.searchByClaimNumberControl.value;
      preauthSearchModel.practiceNumber = this.searchByPracticeNumberControl.value;
      this.mediCarePreAuthService.searchForPreAuthorisation(preauthSearchModel).subscribe((res) => {
        if (res != null) {
          this.dataSource.data = res;
          this.pageLength = res.length;
        }
        this.showSearchProgress = false;
      });
      this.searchByPreAuthNumberControl.setValue('');
      this.searchByClaimNumberControl.setValue('');
      this.searchByPracticeNumberControl.setValue('');
    }
  }

  refreshList() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  searchOption(search: string): Observable<PagedRequestResult<PreAuthorisation>> {
    return this.mediCarePreAuthService
      .searchPreAuthorisation(this.paginator.pageIndex + 1, this.paginator.pageSize, 'preAuthId', this.sort.direction, search)
  }

  listOption(): Observable<PagedRequestResult<PreAuthorisation>> {
    let queryData = new PreAuthorisation;
    queryData.createdBy = this.authService.getUserEmail();
    return this.mediCarePreAuthService
      .getPreAuthorisationsByUser(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, JSON.stringify(queryData))
  }

  reviewPreAuthWizard(preAuthorisation: PreAuthorisation) {
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new PreAuthorisation();
    wizardModel.claimId = preAuthorisation.claimId;
    wizardModel.preAuthType = preAuthorisation.preAuthType;
    wizardModel.personEventId = preAuthorisation.personEventId;
    wizardModel.preAuthId = preAuthorisation.preAuthId;

    startWizardRequest.type = MedicareUtilities.preAuthWizardType(preAuthorisation.preAuthType, CrudActionType.review);
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = preAuthorisation.preAuthId;
    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
      });
  }

  editPreAuthWizard(preAuthorisation: PreAuthorisation) {
    localStorage.setItem('preAuthId', preAuthorisation.preAuthId.toString());
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new PreAuthorisation();
    wizardModel.preAuthId = preAuthorisation.preAuthId;
    startWizardRequest.type = MedicareUtilities.preAuthWizardType(preAuthorisation.preAuthType, CrudActionType.edit);
    wizardModel.preAuthId = preAuthorisation.preAuthId;
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = preAuthorisation.preAuthId;
    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
      });
  }

  startWizard(authWorkItemType: WorkItemType): Promise<any> {

    let that = this;  // 'this' has a different meaning inside the callbacks provided 'then()'

    let currentUser = this.authService.getCurrentUser();

    let promise = new Promise(function (resolve) {
      let tpromise = that.userService.getTenant(currentUser.email).toPromise();
      let wcpromise = that.wizardConfigurationService.getWizardConfiguration(authWorkItemType.wizardConfigurationId).toPromise();
      wcpromise.then(wizardConfig => {
        tpromise.then(tenant => {

          // Having asyncronously retrieved all required information, pass it to the waiting subscriber's
          //   notification callback

          resolve({ wizardConfigName: wizardConfig.name, workItemType: authWorkItemType, tenant: tenant });
        });
      });
    });


    let resultPromise = new Promise(function (resolve) {
      // Wait for the async fetches to complete at which point our callback is invoked with the retrieved results
      promise.then((blob: any) => {
        that.saveWorkItem(blob.wizardConfigName, blob.workItemType, blob.tenant).then(x => { resolve(true); });
      },
        function (reason: string) { throw `Failed to start the wizard. ${reason}`; });
    });

    // Return the promise that is resolved when 'saveWorkItem()' completes its async request
    return resultPromise;
  }

  saveWorkItem(wizardConfigName: string, workItemType: WorkItemType, tenant: Tenant): Promise<number> {

    let workItem = new WorkItem();
    workItem.workItemName = `${workItemType.workItemTypeName} ${this.formatDate(new Date())}`;
    workItem.workItemType = workItemType;
    workItem.workItemState = WorkItemStateEnum.InProgress;
    workItem.tenantId = tenant.id;

    let that = this;
    let promise = this.digiCareService.addWorkItem(workItem).toPromise();//.subscribe((workItemId) => {
    promise.then(workItemId => {
      const startWizardRequest = new StartWizardRequest(); let wizardModel = new PreAuthorisation();
      startWizardRequest.data = JSON.stringify(wizardModel);
      startWizardRequest.linkedItemId = workItemId;
      startWizardRequest.type = wizardConfigName;

      that.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
        this.router.navigateByUrl(`medicare/work-manager/${wizardConfigName}/continue/${wizard.id}`);
      });
    });

    return promise;
  }

  onStartClick(preAuthTypeParam) {//method starts both Hospitalization & Treatment Auths
    const startWizardRequest = new StartWizardRequest(); let wizardModel = new PreAuthorisation();
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = MedicareUtilities.preAuthWizardType(preAuthTypeParam, CrudActionType.create);

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
      })
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  getPreauthStatus(preAuthStatus: number): string {
    return PreAuthStatus[preAuthStatus];
  }

  showReview(preAuthStatus: number, personEventId: number, createdBy: string) {
    let canReview = true;
    let claimLiabilityStatus = this.claimStatus.find(cs => cs.personEventId == personEventId)?.claimStatus;

    if ((preAuthStatus === PreAuthStatus.ClaimUndecided) || (preAuthStatus === PreAuthStatus.Authorised) ||
      (claimLiabilityStatus !== ClaimLiabilityStatusEnum[ClaimLiabilityStatusEnum.LiabilityAccepted] &&
        claimLiabilityStatus !== ClaimLiabilityStatusEnum[ClaimLiabilityStatusEnum.MedicalLiability] &&
        claimLiabilityStatus !== ClaimLiabilityStatusEnum[ClaimLiabilityStatusEnum.Accepted] &&
        claimLiabilityStatus !== ClaimLiabilityStatusEnum[ClaimLiabilityStatusEnum.FullLiabilityAccepted])) {
      canReview = true;
    }
    else {
      canReview = true;
    }
    return canReview;
  }

  showEdit(preAuthorisation: PreAuthorisation) {
    if (this.isInternalUser) {
      if (preAuthorisation.isRequestFromHcp && PreAuthStatus.Authorised === preAuthorisation.preAuthStatus || PreAuthStatus.PendingReview === preAuthorisation.preAuthStatus
        || PreAuthStatus.InfoRequired === preAuthorisation.preAuthStatus || PreAuthStatus.ClaimUndecided === preAuthorisation.preAuthStatus) {
        return true;
      }
      else if (!preAuthorisation.isRequestFromHcp) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (preAuthorisation.isRequestFromHcp && PreAuthStatus.InfoRequired === preAuthorisation.preAuthStatus
        || PreAuthStatus.PendingReview === preAuthorisation.preAuthStatus || PreAuthStatus.ClaimUndecided === preAuthorisation.preAuthStatus) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  populateProstheticEditableMap(preAuthorisations: PreAuthorisation[]): void {
    for (let idx: number = 0; idx < preAuthorisations.length; idx++) {
      if (!this.isProstheticEditableMap.has(preAuthorisations[idx].preAuthId)) {
        this.medicareMedicalInvoiceCommonService.isPreauthInvoiceProcessed(preAuthorisations[idx].preAuthId)
          .subscribe({
            next: result => {
              this.isProstheticEditableMap.set(preAuthorisations[idx].preAuthId, !result);
            }
          });
      }
    }
  }

  isProstheticEditable(preAuthorisation: PreAuthorisation): boolean {
    let isEditable: boolean = true;
    if (preAuthorisation.preAuthType == PreauthTypeEnum.Prosthetic) {
      isEditable = false;
      if (this.isProstheticEditableMap.has(preAuthorisation.preAuthId)) {
        isEditable = this.isProstheticEditableMap.get(preAuthorisation.preAuthId);
      }
    }
    return isEditable;
  }
}

