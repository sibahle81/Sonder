import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lead } from '../../models/lead';
import { ClientTypeEnum } from '../../../policy-manager/shared/enums/client-type-enum';
import { LeadService } from '../../services/lead.service';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { LeadClientStatusEnum } from '../../../policy-manager/shared/enums/leadClientStatusEnum';
import { DeclarationService } from '../../../member-manager/services/declaration.service';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'lead-view',
  templateUrl: './lead-view.component.html',
  styleUrls: ['./lead-view.component.css']
})
export class LeadViewComponent extends UnSubscribe implements OnInit, OnChanges {

  addPermission = 'Add Lead';
  editPermission = 'Edit Lead';
  viewPermission = 'View Lead';

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingIndustryClassConfiguration$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @Input() leadId: number;
  @Input() isReadOnly = false;

  @Output() leadContextEmit: EventEmitter<Lead> = new EventEmitter();

  lead: Lead;

  individualTypes = [ClientTypeEnum.Individual];
  companyTypes = [ClientTypeEnum.Company, ClientTypeEnum.SoleProprietor, ClientTypeEnum.Trust]

  refreshQuote: boolean;
  refreshSLA: boolean;

  documentSystemName = DocumentSystemNameEnum.MemberManager;
  documentSet = DocumentSetEnum.MemberDocumentSet;

  slaItemType = SLAItemTypeEnum.Lead;

  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Lead;
  referralItemTypeReference: string;

  tabIndex = 0;
  productOfferingTabIndex = 0;

  currentCoverPeriodEndDate: Date;
  currentUser: User;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly leadService: LeadService,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly declarationService: DeclarationService,
    private readonly authService: AuthService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.leadId) {
        this.leadId = params.leadId;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.leadId.currentValue) {
      this.leadId = +changes.leadId.currentValue;
    }
  }

  setLead($event: Lead) {
    this.lead = { ...$event };

    this.referralItemTypeReference = '(' + this.lead.code + ') ' + this.lead.displayName

    this.leadContextEmit.emit(this.lead);

    if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
      this.setTabIndex(1);
    }

    this.refreshSLAs();

    this.getIndustryClassDeclarationConfiguration();
  }

  getIndustryClassDeclarationConfiguration() {
    if (!this.lead.company || this.lead.company.industryClass) {
      this.isLoadingIndustryClassConfiguration$.next(false);
      return;
    }

    this.currentCoverPeriodEndDate = null;
    this.declarationService.getDefaultRenewalPeriodStartDate(+this.lead.company.industryClass, new Date()).subscribe(result => {
      if (result) {
        const date = new Date(new Date(result).getFullYear() + 1, new Date(result).getMonth(), new Date(result).getDate());
        this.currentCoverPeriodEndDate = new Date(date.setDate(date.getDate() - 1));
      }

      this.isLoadingIndustryClassConfiguration$.next(false);
    });
  }

  setTabIndex(index: number) {
    this.tabIndex = index;
  }

  save() {
    this.isLoading$.next(true);
    this.generateCode();
  }

  generateCode() {
    this.requiredDocumentService.generateDocumentNumber('Lead').subscribe(result => {
      this.lead.code = result;
      this.createLead();
    });
  }

  createLead() {
    this.leadService.createNewLead(this.lead).subscribe(result => {
      this.router.navigate([`/clientcare/lead-manager/lead-view/${result.leadId}`]);
    });
  }

  back() {
    this.router.navigate([`/clientcare/lead-manager`]);
  }

  isValid(): boolean {
    return this.isCompanyValid() && this.isContactValid() && this.isAddressValid() && this.isNotesValid();
  }

  isCompanyValid(): boolean {
    return this.lead.company && this.lead.company != null;
  }

  isContactValid(): boolean {
    return this.lead.contactV2 && this.lead.contactV2.length > 0;
  }

  isAddressValid(): boolean {
    return this.lead.addresses && this.lead.addresses.length > 0;
  }

  isNotesValid(): boolean {
    return true;
  }

  refreshQuotes() {
    this.refreshQuote = !this.refreshQuote;
    this.productOfferingTabIndex = 1;
  }

  refreshSLAs() {
    this.refreshSLA = !this.refreshSLA;
  }
}
