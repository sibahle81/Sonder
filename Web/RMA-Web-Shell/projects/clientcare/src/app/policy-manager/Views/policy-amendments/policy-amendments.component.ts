import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Case } from '../../shared/entities/case';
import { PolicyAmendmentsDatasource } from './policy-amendments.datasource';
import { RolePlayerPolicyService } from '../../shared/Services/role-player-policy.service';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

const CANCELGROUP:number[] = [26,53]; 
  

@Component({
  selector: 'app-policy-amendments',
  templateUrl: './policy-amendments.component.html',
  styleUrls: ['./policy-amendments.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class PolicyAmendmentsComponent extends WizardDetailBaseComponent<Case> implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PolicyAmendmentsDatasource;
  memberColumns = ['policyNumber', 'modifiedBy','modifiedDt','actions'];

  counter = 1;
  policyId: any;
  fileIdentifier: string;
  isLoading = true;
  showReport = false;
  insuredLifeStatuses: Lookup[] = [];
  showStatus = 'showMemberList';
  amendEmail = 0;
  amendContact = 0;
  amendBanking = 0;
  amendPostal = 0;
  ssrsBaseUrl: string;
  reportServer: string;
  reportUrl: string;
  showParameters: string;
  parameters: any;
  language: string;
  width: number;
  height: number;
  toolbar: string;
  banks: Lookup[];
  wizardId: number;
  wizardType: string;
  groupCancelwizard: boolean = false;
  arrayData: any[];
  wizardModifiedBy: string;
  wizardModifiedDt: any;

  get showMemberCertificate(): boolean {
    return this.showStatus === 'showMemberCertificate';
  }

  showEmailAmendmentLetter()
  {
     var result = (this.dataSource.data.data[0].policyOwner.emailAddress !== this.arrayData[0].mainMember.emailAddress);
     if (result === true && !this.showGroupCancelLetter) 
      this.amendEmail = 1;

    return result;
  }

  showContactAmendmentLetter()
  {
     var result = (this.dataSource.data.data[0].policyOwner.cellNumber !== this.arrayData[0].mainMember.cellNumber);
     if (result === true  && !this.showGroupCancelLetter)
      this.amendContact = 1;

     return result;
  }

  showGroupCancelLetter()
  {
     var result = (this.groupCancelwizard);
     return result;
  }

  showPostalAmendmentLetter()
  {
    var oldPostal = '';
    var newPostal = '';
    if (this.dataSource.data.data[0].policyOwner.rolePlayerAddresses.length > 0)
        oldPostal = this.dataSource.data.data[0].policyOwner.rolePlayerAddresses.find(r => r.addressType == AddressTypeEnum.Postal)?.addressLine1;
     
     if (this.arrayData[0].mainMember.rolePlayerAddresses.length > 0) 
        newPostal = this.arrayData[0].mainMember.rolePlayerAddresses.find(r => r.rolePlayerAddressId == 0 && r.addressType == AddressTypeEnum.Postal)?.addressLine1;
     
        if (oldPostal !== newPostal && !this.showGroupCancelLetter) 
      {
        this.amendPostal = 1;
        return true;
      }
     return false;
  }

  showBankingAmendmentLetter()
  {
    var oldBank: string = '';
    var newBank: string = '';

    if (this.dataSource.data.data[0].policyOwner.rolePlayerBankingDetails.length > 0)
      oldBank = this.dataSource.data.data[0].policyOwner.rolePlayerBankingDetails[0].accountNumber;
    if (this.arrayData[0].mainMember.rolePlayerBankingDetails.length > 0)
      newBank = this.arrayData[0].mainMember.rolePlayerBankingDetails.find(b => b.rolePlayerBankingId == 0)?.accountNumber;
    if (oldBank !== newBank  && !this.showGroupCancelLetter) 
    {
      this.amendBanking = 1;
      return true;
    }
    return false;
  }

  get showEmailLetter(): boolean {
    if (!this.arrayData[0]) { return false; }
    return true;
  }

  get showPolicySchedule(): boolean {
    if (!this.arrayData[0]) { return false; }
    return true;
  }

  get showTermsAndConditions(): boolean {
    if (!this.arrayData[0]) { return false; }
    return true;
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly policyService: RolePlayerPolicyService,
    private readonly insuredLifeService: PolicyInsuredLifeService,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    
    this.dataSource = new PolicyAmendmentsDatasource(this.policyService);
    this.activatedRoute.params.subscribe((params: any) => {
      this.getBanks();
      this.wizardId = params.linkedId;
      this.wizardType = params.type;
      this.wizardService.getWizard(params.linkedId).subscribe(wizard => {
        this.arrayData = JSON.parse(wizard.data);
          
        if (CANCELGROUP.includes(parseInt(wizard.wizardConfigurationId)))
        {
          this.groupCancelwizard = true;
        }
        this.wizardModifiedBy = wizard.modifiedBy;
        this.wizardModifiedDt = wizard.modifiedDate;
        this.loadData();
      });
    });

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
     
  }
  
  getPolicyDetails() {
    this.policyService.getRolePlayerAmendments(this.arrayData[0].mainMember.rolePlayerId, this.arrayData[0].mainMember.policies[0].policyId).subscribe(result => {
      if (result) {
        var data = result;
      }
    });
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
    this.isLoading = false;
  }

    
  loadData() {
    if (this.arrayData[0])
      this.dataSource.getData({
      policyId: this.arrayData[0].mainMember.policies[0].policyId,
      rolePlayerId: this.arrayData[0].mainMember.rolePlayerId,
      pageNumber: 1,
      pageSize: 10,
      orderBy: 'policyId',
      sortDirection: 'asc',
      showActive: true,
      wizardType: this.wizardType
    });
  }

  populateModel(): void { 
    this.model['AmendEmail'] = this.amendEmail;
    this.model['AmendContact'] = this.amendContact;
    this.model['AmendPostal'] = this.amendPostal;
    this.model['AmendBanking'] = this.amendBanking;
  }  

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
  
  getInsuredLifeStatus(statusId: number): string {
    const status = this.insuredLifeStatuses.find(s => s.id === statusId);
    return status ? status.name : '<unknown>';
  }

  showMembers(): void {
    this.showReport = false;
    this.showStatus = 'showMemberList';
    
  }

  getBanks(): void {
    this.lookupService.getBanks().subscribe(
      banks => {
        this.banks = banks;
      });
  }

  previewEmailLetter(policyId: number): void {
    this.showMemberReport('RMA.Reports.ClientCare.Policy/RMAAmendmentEmailLetter', this.parameters = { policyId, Email: this.arrayData[0].mainMember.emailAddress });
  }

  previewPartialCancelLetter(policyId: number): void {
    this.showMemberReport('RMA.Reports.ClientCare.Policy/RMAFuneralPolicyCancellationLetter', this.parameters = { policyId, wizardId: this.wizardId });
  }

  previewContactLetter(policyId: number): void {
    this.showMemberReport('RMA.Reports.ClientCare.Policy/RMAContactDetailsAmendmentLetter', this.parameters = { policyId, NewCellNumber: this.arrayData[0].mainMember.cellNumber });
  }

  previewPostalLetter(policyId: number): void {
        
      if (this.dataSource.data.data[0].policyOwner.rolePlayerAddresses.length > 0)
      { 
        this.parameters = 0;     
        var addr1 = this.arrayData[0].mainMember.rolePlayerAddresses.find(r => r.rolePlayerAddressId == 0 && r.addressType == AddressTypeEnum.Postal)?.addressLine1;
        var addr2 = this.arrayData[0].mainMember.rolePlayerAddresses.find(r => r.rolePlayerAddressId == 0 && r.addressType == AddressTypeEnum.Postal)?.addressLine2;
        var addr3 = this.arrayData[0].mainMember.rolePlayerAddresses.find(r => r.rolePlayerAddressId == 0 && r.addressType == AddressTypeEnum.Postal)?.city;
        var addrCode = this.arrayData[0].mainMember.rolePlayerAddresses.find(r => r.rolePlayerAddressId == 0 && r.addressType == AddressTypeEnum.Postal)?.postalCode;
        
        this.parameters = { policyId, client_Address1: addr1, client_Address2: addr2, client_Address3: addr3, postal_Code: addrCode };
        this.showMemberReport('RMA.Reports.ClientCare.Policy/RMAAmendmentPostalAddressLetter', this.parameters);
      }
  }
  
  previewBankingLetter(policyId: number): void {
    if (this.arrayData[0].mainMember.rolePlayerBankingDetails.length > 0)
    {   
      this.parameters = 0;
      var accNumber = this.arrayData[0].mainMember.rolePlayerBankingDetails.find(b => b.rolePlayerBankingId == 0)?.accountNumber;
      var accType = BankAccountTypeEnum[this.arrayData[0].mainMember.rolePlayerBankingDetails.find(b => b.rolePlayerBankingId == 0).bankAccountType];
      var accBank = this.banks.find(x => x.universalBranchCode === this.arrayData[0].mainMember.rolePlayerBankingDetails.find(b => b.rolePlayerBankingId === 0).branchCode)?.name;
      var accBranch = this.arrayData[0].mainMember.rolePlayerBankingDetails.find(b => b.rolePlayerBankingId == 0)?.branchCode;
      
      this.parameters = { policyId, Branch_Code: accBranch, Account_Number: accNumber, Account_type: accType , Bank_Name: accBank};
      this.showMemberReport('RMA.Reports.ClientCare.Policy/RMAAmendmentBankingLetter', this.parameters);
    }
  }
  
  showMemberReport(reportName: string, param: any): void {
    this.showStatus = 'showMemberCertificate';
    this.counter++;
    this.showReport = false;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = reportName;
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
