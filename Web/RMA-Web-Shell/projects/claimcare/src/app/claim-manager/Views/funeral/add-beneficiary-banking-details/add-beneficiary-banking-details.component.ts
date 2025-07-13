import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { AddBeneficiaryBankingDetailsDataSource } from 'projects/claimcare/src/app/claim-manager/views/funeral/add-beneficiary-banking-details/add-beneficiary-banking-details.datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { UserWizardListComponent } from 'projects/shared-components-lib/src/lib/wizard/views/user-wizard-list/user-wizard-list.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { TracerListComponent } from '../../tracer-list/tracer-list.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'app-add-beneficiary-banking-details',
  templateUrl: './add-beneficiary-banking-details.component.html',
  styleUrls: ['./add-beneficiary-banking-details.component.css']
})

export class AddBeneficiaryBankingDetailsComponent extends BaseSearchComponent implements OnInit, AfterViewInit {

  @ViewChild(UserWizardListComponent, { static: false }) table: UserWizardListComponent;
  @ViewChild(TracerListComponent, { static: true }) tracer: TracerListComponent;

  columnDefinitions: any[] = [
    { display: 'First Name', def: 'firstname', show: true },
    { display: 'Surname', def: 'lastname', show: true },
    { display: 'ID Number', def: 'idNumber', show: true },
    { display: 'Account Holder', def: 'nameOfAccountHolder', show: true },
    { display: 'Account Number', def: 'accountNumber', show: true },
    { display: 'Account Type', def: 'accountType', show: true },
    { display: 'Bank Name', def: 'bankName', show: true },
    { display: 'Is Approved', def: 'isApproved', show: true },
    { display: 'Action', def: 'actions', show: true },
    { display: 'AccountId', def: 'accountId', show: false },
    { display: 'BeneficiaryId', def: 'beneficiaryId', show: false },
    { display: 'haveAllDocumentsAccepted', def: 'haveAllDocumentsAccepted', show: false },
    { display: 'isWizardCompleted', def: 'isWizardCompleted', show: false }
  ];


  constructor(
    router: Router,
    formBuilder: UntypedFormBuilder,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    dataSource: AddBeneficiaryBankingDetailsDataSource,
    private readonly activatedRoute: ActivatedRoute,
    private readonly wizardService: WizardService,
    private readonly claimService: ClaimCareService,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly authService: AuthService,
    private readonly privateAlertService: AlertService,
    private readonly lookUpService: LookupService) {
    super(dataSource, formBuilder, router,
      '', // Redirect URL
      []); // Display Columns
    dateAdapter.setLocale('en-za');
  }

  menus: { title: string, disable: boolean }[];

  claimId: number;
  accountId: number;
  user: User;
  hasTasks = false;
  hasTracerWizard = false;
  beneficiaryId: number;
  bankAccountId: number;
  selectedFilterTypeId: number;
  AddBankingBeneficiaryId: number;
  UpdateBankingBeneficiaryId: number;

  showAddBankingDetail: boolean;
  banks: Lookup[];
  bankAccountTypes: Lookup[];

  beneficiaryType = 'Beneficiary';
  createBankingDetailsType = 'Add Banking Details';
  updateBankingDetailsType = 'Update Banking Details';

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.id;
      this.selectedFilterTypeId = params.id;
      this.getData(this.claimId);
      this.dataSource.setControls(this.paginator, this.sort);
      this.user = this.authService.getCurrentUser();
      this.getWizardTasks();
    });
  }

  ngAfterViewInit() {
    if (this.table) {
      // this.table.filterOnLinkedItem(this.claimId);
    }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getWizardTasks() {
    this.wizardService.GetWizardsByConfigIdsAndCreatedBy('27,41', this.user.email, this.claimId).subscribe(wizards => {
      if (wizards.length > 0) {
        this.hasTasks = true;
      }
    });
  }

  getData(claimId): void {
    (this.dataSource as AddBeneficiaryBankingDetailsDataSource).getData(claimId);
  }

  getBanks(): void {
    this.lookUpService.getBanks().subscribe(
      banks => {
        this.banks = banks;
      });
  }

  filterMenu(row: any) {
    if (row.accountNumber !== null && row.accountNumber !== '' && row.accountNumber !== 'undefined') {
      this.menus = null;
      this.showAddBankingDetail = true;
      if (!row.haveAllDocumentsAccepted || !row.isWizardCompleted) {
        this.menus = [
          { title: 'Add Banking Detail', disable: false },
          { title: 'Update Banking Detail', disable: true },
          { title: 'Submit', disable: true },
        ];
      } else {
        this.menus = [
          { title: 'Add Banking Detail', disable: false },
          { title: 'Update Banking Detail', disable: false },
          { title: 'Submit', disable: false }
        ];
      }
    } else {
      this.menus = [
        { title: 'Add Banking Detail', disable: false }
      ];
      this.showAddBankingDetail = false;
    }
  }

  onMenuSelect(accountId: any, beneficiaryId: any, title: any) {
    switch (title) {
      case 'Submit':
        this.payThisAccount(accountId, beneficiaryId);
        break;
      case 'Update Banking Detail':
        this.accountId = accountId;
        this.UpdateBankingBeneficiaryId = beneficiaryId;
        this.addConfirmation(this.updateBankingDetailsType);
        break;
      case 'Add Banking Detail':
        this.AddBankingBeneficiaryId = beneficiaryId;
        this.addConfirmation(this.createBankingDetailsType);
        break;
    }
  }

  getBankAccountTypes(): void {
    this.lookUpService.getBankAccountTypes().subscribe(
      types => {
        this.bankAccountTypes = types;
      });
  }

  payThisAccount(bankAccountId: any, beneficiaryId: any): void {
    this.router.navigateByUrl('claimcare/claim-manager/funeral/claim-payment/' + this.claimId + '/' + beneficiaryId + '/' + bankAccountId);
  }

  back() {
    this.router.navigateByUrl('claimcare/claim-manager/claim-workpool');
  }

  // Confiramtion on whether you want to add or not
  addConfirmation(type: string): void {
    this.confirmservice.confirmWithoutContainer(type, ` Are you sure you want to add a ${type}?`,
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true && type === this.beneficiaryType) {
            this.navigateToBeneficiaryWizard();
          }
          if (result === true && type === this.updateBankingDetailsType) {
            this.updateBankingDetailsWizard(this.accountId, this.UpdateBankingBeneficiaryId);
          }
          if (result === true && type === this.createBankingDetailsType) {
            this.createBankingDetailsWizard(this.AddBankingBeneficiaryId);
          }
        });
  }


  // Kick start the wizard for updating banking details
  updateBankingDetailsWizard(bankAccountId: any, beneficiaryId: any): void {
    const request = new StartWizardRequest();
    request.type = 'update-banking-details';
    request.linkedItemId = bankAccountId;
    this.wizardService.startWizard(request).subscribe(wizard => {
      this.router.navigateByUrl(`/claimcare/claim-manager/update-banking-details/continue/${wizard.id}`);
    });
  }

  // Kick start the wizard for adding a beneficiary
  navigateToBeneficiaryWizard() {
    const request = new StartWizardRequest();
    request.type = 'create-beneficiary';
    request.linkedItemId = this.claimId;  //  28; // This will be the claimId
    this.wizardService.startWizard(request).subscribe(wizard => {
      this.router.navigateByUrl(`/claimcare/claim-manager/create-beneficiary/continue/${wizard.id}`);
    });
  }

  // Kick start the wizard for adding banking details
  createBankingDetailsWizard(beneficiaryId: any) {
    const request = new StartWizardRequest();
    request.type = 'create-banking-details';
    request.linkedItemId = beneficiaryId;
    this.wizardService.startWizard(request).subscribe(wizard => {
      this.router.navigateByUrl(`/claimcare/claim-manager/create-banking-details/continue/${wizard.id}`);
    });
  }

}
