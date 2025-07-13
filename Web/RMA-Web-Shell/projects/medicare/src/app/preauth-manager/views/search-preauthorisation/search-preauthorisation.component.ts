import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common'
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { isNullOrUndefined } from 'util';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PreAuthPractitionerTypeSetting } from 'projects/medicare/src/app/medi-manager/models/preAuth-practitioner-type-setting';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { SearchPreAuthCriteria } from 'projects/medicare/src/app/preauth-manager/models/search-preauth-criteria';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { SearchPreAuthorisationDataSource } from 'projects/medicare/src/app/preauth-manager/datasources/search-preauthorisation-datasource';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'search-preauthorisation.component',
  templateUrl: './search-preauthorisation.component.html',
  styleUrls: ['./search-preauthorisation.component.css'],
  providers: [HealthcareProviderService]
})

export class SearchPreauthorisationComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  displayedColumns: string[] = ['preAuthNumber', 'healthCareProviderDetail', 'requestComments', 'requestedAmount', 'authorisedAmount', 'createdDate', 'dateAuthorised', 'claimReferenceNumber', 'preAuthStatus', 'preAuthId', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource<PreAuthorisation>();
  pageLength: number;
  loading$ = new BehaviorSubject<boolean>(false);
  search$ = new BehaviorSubject<string>(null);
  isInternalUser: boolean = false;
  disableSubmit: boolean = true;
  currentHealthCareProvider: HealthCareProvider = null;
  userHealthCareProviders: UserHealthCareProvider[] = [];
  selectedValue: string;
  currentUserEmail: string;
  showSearchProgress: boolean;
  preAuthTypes: Lookup[];
  preAuthStatuses: Lookup[];
  searchPreAuthCriteria: SearchPreAuthCriteria;
  searchPreAuthorisationDataSource: SearchPreAuthorisationDataSource;
  searchingPractice = false;
  healthCareProviderId: number = 0;
  event: KeyboardEvent;
  selectedClaimId = 0;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly healthcareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute) 
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
    this.checkIfAlliedHealthPractitioner(currentUser);
  }

  createForm(){
    this.form = this.formBuilder.group({
      searchByPreAuthNumberControl: [''],
      searchByPracticeNumberControl: [''],
      searchByuserHealthCareProvider: [''],
      healthCareProviderControl: [''],
      searchByPreAuthTypeControl: ['0'],
      searchByPreAuthStatusControl: ['0'],
      searchByDateAuthorisedFromControl: [''],
      searchByDateAuthorisedToControl: ['']
    });
    this.searchPreAuthorisationDataSource = new SearchPreAuthorisationDataSource(this.mediCarePreAuthService);
    this.searchPreAuthorisationDataSource.clearData();
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 5;
  }
  
  getLookups() {
    this.getPreAuthTypes();
    this.getPreAuthStatuses();
  }

  getPreAuthTypes(): void {
    this.lookupService.getPreAuthTypes().subscribe(data => {
      this.preAuthTypes = data.filter(x => x.name !== 'Unknown');
    });
  }

  getPreAuthStatuses(): void {
    this.lookupService.getPreAuthStatuses().subscribe(data => {
      this.preAuthStatuses = data;
    });
  }

  getHealthCareProvider(event: any) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }

    if (this.isInternalUser && String.isNullOrEmpty(this.form.controls.searchByPracticeNumberControl.value)) {
      return;
    }
    else if (!this.isInternalUser && String.isNullOrEmpty(this.form.controls.searchByuserHealthCareProvider.value)) {
      return;
    }
    
    const practiceNumber = this.isInternalUser ? this.form.controls.searchByPracticeNumberControl.value : this.form.controls.searchByuserHealthCareProvider.value;
    this.searchingPractice = true;

    this.healthcareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
      if (healthCareProvider) {
        this.form.controls.healthCareProviderControl.patchValue(healthCareProvider.name);
        this.healthCareProviderId = healthCareProvider.rolePlayerId;
      }
      else {
        this.form.controls.healthCareProviderControl.patchValue('');
        this.healthCareProviderId = 0;
        this.alertService.error("Practice not found.");
      }
      this.searchingPractice = false;
    });
  }

  checkIfAlliedHealthPractitioner(currentUser: User): void {
    let currentUserHCPs = null;
    let userHealthCareProviders = null;
    this.userService.getUserHealthCareProviders(currentUser.email).subscribe((result) => {
      currentUserHCPs = result;
      this.userHealthCareProviders = result;
      if (result.length > 0) {
        this.selectedValue = result[0].practiceNumber;
        this.form.controls.searchByuserHealthCareProvider.setValue(this.selectedValue);
        this.disableSubmit = false;
        this.getHealthCareProvider(this.event);
      }
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
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.searchPreAuthorisationDataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
            this.search();
        })
      )
      .subscribe();

      const selectedClaimId = this.route.snapshot.paramMap.get('claimId');
      const selectedPreAuthType = this.route.snapshot.paramMap.get('preauthType');
      if (this.selectedClaimId && selectedPreAuthType)  {
         this.selectedClaimId = Number(selectedClaimId);
         this.form.controls.searchByPreAuthTypeControl.setValue(selectedPreAuthType);
         this.search();
      }
  }

  search() {
    this.showSearchProgress = true;
    this.searchPreAuthCriteria = {
      preAuthNumber: this.form.controls.searchByPreAuthNumberControl.value,
      preAuthTypeId: this.form.controls.searchByPreAuthTypeControl.value,
      preAuthStatusId: this.form.controls.searchByPreAuthStatusControl.value,
      healthCareProviderId: this.healthCareProviderId,
      dateAuthorisedFrom: (this.form.controls.searchByDateAuthorisedFromControl.value != null && this.form.controls.searchByDateAuthorisedFromControl.value != '') ? 
        this.datepipe.transform(this.form.controls.searchByDateAuthorisedFromControl.value, 'yyyy-MM-dd') : this.datepipe.transform("", 'yyyy-MM-dd'),
      dateAuthorisedTo: (this.form.controls.searchByDateAuthorisedToControl.value != null && this.form.controls.searchByDateAuthorisedToControl.value != '') ? 
        this.datepipe.transform(this.form.controls.searchByDateAuthorisedToControl.value, 'yyyy-MM-dd') : this.datepipe.transform("", 'yyyy-MM-dd'),
      pageNumber: 0,
      pageSize: 0,
      claimId: this.selectedClaimId > 0 ? this.selectedClaimId : 0
    }
    
    this.searchPreAuthorisationDataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchPreAuthCriteria);          
  }

  reset() {
    this.form.reset();
    this.form.controls.searchByPreAuthTypeControl.setValue('0');
    this.form.controls.searchByPreAuthStatusControl.setValue('0');
    this.form.controls.searchByuserHealthCareProvider.setValue(this.selectedValue);
  }

  getPreauthStatus(preAuthStatus: number): string {
    return PreAuthStatus[preAuthStatus];
  }

  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(preAuth: PreAuthorisation) {
    this.menus = [
      { title: 'View', url: '', disable: false }
    ];
  }

  onMenuItemClick(preAuth: PreAuthorisation, menu: any): void {
    switch (menu.title) {
      case 'View':
        this.onClickView(preAuth);
        break;
    }
  }

  onClickView(preAuth) {
    this.router.navigate(['/medicare/view-search-results', preAuth.personEventId, preAuth.preAuthType, preAuth.preAuthId]);
  }
}
