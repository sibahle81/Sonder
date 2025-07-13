import { DatePipe, Location } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClientCoverListComponent } from 'projects/clientcare/src/app/policy-manager/views/client-cover-list/client-cover-list.component';
import { PolicyInsuredLifeListComponent } from 'projects/clientcare/src/app/policy-manager/views/policy-insured-life-list/policy-insured-life-list.component';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PolicyInsuredLifeSearchComponent } from 'projects/clientcare/src/app/shared/search/policy-insured-life-search/policy-insured-life-search.component';
import { ClientCover } from 'projects/clientcare/src/app/policy-manager/shared/entities/client-cover';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { BreadcrumbPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/breadcrumb-policy.service';
import { ContactService } from 'projects/clientcare/src/app/client-manager/shared/services/contact.service';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { PolicyCancellationRequest } from 'projects/clientcare/src/app/policy-manager/shared/entities/policyCancellationRequest';
import { PolicyScheduleRequest } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-schedule-request';
import { DomSanitizer } from '@angular/platform-browser';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { PolicyDocumentsListComponent } from 'projects/clientcare/src/app/policy-manager/views/policy-documents-list/policy-documents-list.component';
import { FormLetterResponse } from 'projects/clientcare/src/app/policy-manager/shared/entities/form-letter-response';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { FrequencyTypeEnum } from 'projects/shared-models-lib/src/lib/enums/frequency-type-enum';
import { SendScheduleRequest } from 'projects/clientcare/src/app/policy-manager/shared/entities/send-schedule-request';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { EuropAssistPremiumMatrix } from '../../shared/entities/europ-assist-premium-matrix';
import { ClientTypeEnum } from '../../shared/enums/client-type-enum';

@Component({
  selector: 'policy-detail',
  templateUrl: './policy-details.component.html',
  providers: [DatePipe],
})
export class PolicyDetailsComponent extends DetailsComponent implements OnInit, AfterViewInit {
  @ViewChild(ClientCoverListComponent) clientCoverListComponent: ClientCoverListComponent;
  @ViewChild(PolicyInsuredLifeListComponent) policyInsuredLifeListComponent: PolicyInsuredLifeListComponent;
  @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;
  @ViewChild(AuditLogComponent) auditLogComponent: AuditLogComponent;
  @ViewChild(PolicyDocumentsListComponent) policyDocuments: PolicyDocumentsListComponent;
  @ViewChild(PolicyInsuredLifeSearchComponent) policyInsuredLifeSearchComponent: PolicyInsuredLifeSearchComponent;
  clientCover: ClientCover[];
  currentPolicyNumber: string;
  policy: Policy;
  inceptionDate: Date;
  cancelDate: Date;
  isReinstatePolicy: boolean;
  isCancelPolicy: boolean;
  isIndividualClient: boolean;
  statusChangeAction: string;
  tabIndex: number;
  canAddInsuredLife: boolean;
  policyCancellationRequest: PolicyCancellationRequest;
  billingFrequencyTypes: Lookup[];
  billingFrequencyTypeId: number;
  brokers: Representative[];
  brokerId: number;
  isBrokerSelected: boolean;
  isLoadingCommission: boolean;
  showGenerateScheduleOptions: boolean;
  emailBroker: boolean;
  emailIndividual: boolean;
  emailUser: boolean;
  isEuropAssist = false;
  formEmailSelection: FormGroup;
  showHint: boolean;
  isRecalculating: boolean;
  minDate: Date;
  showEditDocument = true;
  formLetterResponse: FormLetterResponse;
  msDownloaded: boolean;
  reasons: Lookup[];
  communicationTypeList: Lookup[];
  europAssistFee: any;
  hasEuropAssist = false;
  europAssistPremiumMatrix: EuropAssistPremiumMatrix;

  get policyProductListComponentLoading(): boolean {
    if (!this.clientCoverListComponent) { return true; }
    return this.clientCoverListComponent.isLoading;
  }

  get showSave(): boolean {
    return this.canEdit && !this.form.disabled && !this.isCancelPolicy && !this.isReinstatePolicy;
  }

  get showEdit(): boolean {
    if (!this.policy) { return false; }
    return this.canEdit &&
      this.form.disabled &&
      !this.isCancelPolicy &&
      !this.isReinstatePolicy &&
      this.policy.status === 'Active';
  }

  get showCancel(): boolean {
    if (!this.policy) { return false; }
    return this.canEdit && this.form.disabled && this.policy.status === 'Active';
  }

  get showReinstate(): boolean {
    if (!this.policy) { return false; }
    return this.canEdit && this.form.disabled && this.policy.status === 'Cancelled';
  }

  get showGenerateSchedule(): boolean {
    if (!this.policy) { return false; }
    return !this.isCancelPolicy && !this.isReinstatePolicy && !this.isWizard && this.policy.status === 'Active';
  }

  get showTransfer(): boolean {
    if (!this.policy) { return false; }
    return this.canEdit && this.policy.status === 'Active' && !this.isCancelPolicy && !this.isReinstatePolicy;
  }

  get showReminder(): boolean {
    return !this.isCancelPolicy && !this.isReinstatePolicy && !this.isWizard;
  }

  get showBack(): boolean {
    return !this.isCancelPolicy && !this.isReinstatePolicy && !this.isWizard;
  }

  get showAddInsuredLife(): boolean {
    if (!this.policy) { return false; }
    return this.canEdit && this.canAddInsuredLife && this.policy.status === 'Active';
  }

  get getDisplayDate(): string {
    if (!this.policy) { return ''; }
    if (this.policy.cancellationDate != null) { return this.policy.cancellationDate.toString().substring(0, 10); }
    if (this.policy.reinstateDate != null) { return this.policy.reinstateDate.toString().substring(0, 10); }

    return '';
  }

  get getDisplayMessage(): string {

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (this.policy.cancellationDate != null && new Date(this.policy.cancellationDate) <= currentDate) {
      return 'This policy was cancelled on';
    }

    if (this.policy.cancellationDate != null && new Date(this.policy.cancellationDate) > currentDate) {
      return 'This policy is going to be cancelled on';
    }

    if (this.policy.reinstateDate != null && new Date(this.policy.reinstateDate) <= currentDate) {
      return 'This policy was reinstated on';
    }

    if (this.policy.reinstateDate != null && new Date(this.policy.reinstateDate) > currentDate) {
      return 'This policy is going to be reinstated on';
    }

    return '';
  }

  get policyClientName(): string {
    if (this.policy) { return this.policy.clientName; }
    return 'N/A';
  }

  get isCalculating(): boolean {
    return this.isRecalculating && this.isLoadingCommission;
  }

  set isCalculating(isCalc: boolean) {
    this.isRecalculating = isCalc;
    this.isLoadingCommission = isCalc;
  }

  constructor(
    private readonly location: Location,
    appEventsManager: AppEventsManager,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbPolicyService,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly policyService: PolicyService,
    private readonly lookupService: LookupService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly brokerService: RepresentativeService,
    private readonly contactService: ContactService,
    public productService: ProductService,
    private sanitizer: DomSanitizer,
    private readonly notesService: NotesService) {

    super(appEventsManager, alertService, router, 'Policy', 'clientcare/policy-manager', 1);
    this.resetPermissions();
    this.getFrequencyTypes();
    this.getBrokers();
    this.getCancellationReasons();
    this.getCommunicationTypes();
  }

  ngOnInit(): void {

    this.disabledControlsOnEdit = ['policyNumber', 'inceptionDate', 'status', 'payablePremium', 'annualPremium', 'expiryDate', 'renewalDate', 'commissionAmount'];
    this.showGenerateScheduleOptions = false;
    this.resetPermissions();
    this.getFrequencyTypes();
    this.getBrokers();
    this.getCancellationReasons();
    this.getCommunicationTypes();
    this.minDate = new Date();
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.tabIndex) { this.tabIndex = params.tabIndex; }

      if (params.id) {
        this.loadingStart('Loading policy details...');
        this.createForm(params.id);
        this.getPolicy(params.id);
      } else {
        this.createForm('');
        this.breadcrumbService.setBreadcrumb('Add a policy');
        this.checkUserAddPermission();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.tabIndex) { this.matTabGroup.selectedIndex = this.tabIndex; }
  }

  resetPermissions(): void {
    this.canAddInsuredLife = true;
    super.resetPermissions();
  }

  checkUserAddPermission(): void {
    this.canAddInsuredLife = userUtility.hasPermission('Add Insured Life');
  }

  createForm(id: any): void {
    this.clearDisplayName();
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      id,
      clientId: 0,
      leadQuoteId: 0,
      policyNumber: '',
      inceptionDate: null,
      installmentDate: null,
      cancelDate: null,
      expiryDate: null,
      renewalDate: null,
      reinstateDate: null,
      payablePremium: 0,
      annualPremium: 0,
      reason: '',
      status: '',
      billingFrequency: 0,
      broker: 0,
      commissionPercentage: [0, [Validators.max(22.5)]],
      commissionAmount: 0,
      note: '',
      communicationType: [],
      isEuropAssist: null,
      europAssistInceptionDate: null,
      europAssistEndDate: null,
    });

    if (this.formEmailSelection) { return; }
    this.formEmailSelection = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      emailIndividual: false,
      emailBroker: false,
      emailCurrentUser: false
    });
  }

  readForm(): Policy {

    const formModel = this.form.getRawValue();
    const policy = new Policy();

    const initDate = new Date(formModel.inceptionDate);
    const inceptDate = new Date(initDate.setDate(initDate.getDate() + 1));

    policy.id = formModel.id as number;
    policy.clientId = formModel.clientId as number;
    policy.leadQuoteId = formModel.leadQuoteId as number;
    policy.policyNumber = formModel.policyNumber as string;

    policy.policyDate = new Date();
    policy.inceptionDate = inceptDate;
    policy.installmentDate = this.getInstallmentDate(formModel.installmentDate); // formModel.installmentDate as number;
    policy.expiryDate = formModel.expiryDate as Date;
    policy.renewalDate = formModel.renewalDate as Date;
    policy.reinstateDate = !formModel.reinstateDate ? null : formModel.reinstateDate as Date;
    policy.cancellationDate = !formModel.cancelDate ? null : formModel.cancelDate as Date;

    policy.payablePremium = formModel.payablePremium as number;
    policy.annualPremium = formModel.annualPremium as number;

    policy.isEuropAssist = this.isEuropAssist;
    policy.europAssistEffectiveDate = formModel.europAssistInceptionDate as Date;
    policy.europAssistEndDate = formModel.europAssistEndDate as Date;

    policy.reason = formModel.reason as string;
    policy.status = formModel.status as string;

    policy.clientCover = this.clientCover;

    policy.billingFrequencyId = formModel.billingFrequency as number;
    policy.commissionPercentage = formModel.commissionPercentage as number;
    policy.brokerId = formModel.broker as number;

    policy.communicationTypeIds = this.getSelectedCommunicationTypes();

    return policy;
  }

  getInstallmentDate(day: number): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), day);
  }

  setForm(policy: Policy): void {
    if (!this.form) { this.createForm(policy.id); }

    this.canEdit = policy.canEdit;
    this.clientCover = policy.clientCover;

    if (!policy.inceptionDate) {
      policy.inceptionDate = new Date();
    }

    if (!this.policy) {
      this.policy = policy;
    }

    this.form.setValue({
      id: policy.id,
      policyNumber: policy.policyNumber,
      leadQuoteId: policy.leadQuoteId,
      clientId: policy.clientId,
      inceptionDate: policy.inceptionDate,
      installmentDate: this.getDayOfMonth(policy.installmentDate), // policy.installmentDate.getDate() as number,
      expiryDate: policy.expiryDate,
      reinstateDate: policy.reinstateDate ? policy.reinstateDate : null,
      renewalDate: policy.renewalDate,
      cancelDate: policy.cancellationDate ? policy.cancellationDate : null,
      payablePremium: this.policy.payablePremium ? this.policy.payablePremium : policy.payablePremium,
      annualPremium: policy.annualPremium,
      reason: '',
      status: policy.status,
      billingFrequency: policy.billingFrequencyId ? policy.billingFrequencyId : 1,
      broker: policy.brokerId ? policy.brokerId : this.brokerId ? this.brokerId : 0,
      commissionPercentage: policy.commissionPercentage ? policy.commissionPercentage : '',
      commissionAmount: policy.commissionAmount ? policy.commissionAmount : 0,
      note: '',
      communicationType: policy.communicationTypeIds ? policy.communicationTypeIds : [],
      europAssistInceptionDate: policy.europAssistEffectiveDate ? policy.europAssistEffectiveDate : null,
      europAssistEndDate: policy.europAssistEndDate ? policy.europAssistEndDate : null,
      isEuropAssist: policy.isEuropAssist ? policy.isEuropAssist : null,
    });

    this.formEmailSelection.setValue({
      email: '',
      emailBroker: false,
      emailIndividual: false,
      emailCurrentUser: false
    });

    this.billingFrequencyTypeId = policy.billingFrequencyId;
    this.setCurrentValues();

    if (+policy.status === PolicyStatusEnum.Active) {
      this.statusChangeAction = 'cancel';
      this.form.controls.reason.enable();
      this.form.controls.cancelDate.enable();
    } else {
      this.statusChangeAction = 'reinstate';
    }

    this.isIndividualClient = (policy.clientTypeId === ClientTypeEnum.Individual);
    if (!this.isWizard) { this.form.disable(); }
    this.getDisplayName(policy);
  }

  getDayOfMonth(date: Date): number {
    if (!date) { return 1; }
    const dtm = new Date(date);
    return dtm.getDate();
  }

  getPolicy(id: number): void {

    this.policyService.getPolicy(id)
      .subscribe(policy => {
        this.currentPolicyNumber = policy.policyNumber.toLowerCase();
        this.policy = policy;
        this.getPolicyBroker(policy);
        this.hasEuropAssist = policy.isEuropAssist;
        this.setForm(policy);

        this.getNotes(id, ServiceTypeEnum.PolicyManager, 'Policy');
        // this.getAuditDetails(id, ServiceType.PolicyManager, ItemType.Policy);

        this.populateProducts();
        this.populatePolicyDocuments(policy.id);
        this.searchInsuredLives(id);
        this.getAuditDetails(policy.id);
        this.breadcrumbService.setBreadcrumb('Edit a policy');

        this.loadingStop();
      });
  }

  getPolicyBroker(policy: Policy): void {
    this.brokerId = policy.brokerId;
    this.isBrokerSelected = this.brokerId > 0;
  }

  selectedBrokerChange($event: any): void {
    this.brokerId = $event.value;
    if (this.brokerId == null) {
      this.form.patchValue({ commissionPercentage: 0, });
      this.calculateCommissionAndPayablePremium();
      return;
    }

    this.isBrokerSelected = !(this.brokerId > 0);


    this.brokerService.getBroker(this.brokerId).subscribe(broker => {
      this.form.patchValue({ commissionPercentage: broker.defaultCommissionPercentage });
      this.calculateCommissionAndPayablePremium();
      this.isLoadingCommission = false;
    }
    );
  }

  getFrequencyTypes(): void {
    this.lookupService.getPaymentFrequencies().subscribe(billingFrequencyTypes => this.billingFrequencyTypes =
      billingFrequencyTypes);

    this.policyService.getEuropAssistPremiumMatrices().subscribe(matrices => {
      this.europAssistPremiumMatrix = matrices[0];
      this.europAssistFee = this.europAssistPremiumMatrix.basePremium + this.europAssistPremiumMatrix.profitExpenseLoadingPremium;
    })
  }

  getBrokers(): void {
    this.brokerService.getBrokers().subscribe(brokers => this.brokers = brokers);
  }

  setCurrentValues(): void {
    try {
      this.currentPolicyNumber = this.form.getRawValue().policynumber.toLowerCase();
    } catch (error) {
    }
  }

  populateInsuredLives(policyId: number): void {
    if (policyId == null || policyId === 0 || this.isWizard) { return; }
    this.policyInsuredLifeListComponent.getData(policyId);

  }

  searchInsuredLives(policyId: number): void {
    if (policyId == null || policyId === 0 || this.isWizard) { return; }
    this.policyInsuredLifeSearchComponent.getPolicyId(policyId);

  }


  populateProducts(): any {
    if (!this.clientCoverListComponent) { return; }
    this.clientCoverListComponent.getData(this.clientCover);
  }


  validateDate() {
    if (!this.form.get('installmentDate').value) { return; }
    const installDate = this.form.get('installmentDate').value;
    //const minDate = new Date(installDate.setDate(installDate.getDate() + 1));

    if (installDate < 1) {
      this.form.get('installmentDate').setErrors({ min: true });
    }
    else if (installDate > 31) {
      this.form.get('installmentDate').setErrors({ max: true });
    } else {
      this.form.get('installmentDate').setErrors(null);
      this.form.get('installmentDate').updateValueAndValidity();
    }

    if (this.isCancelPolicy) {
      const date = new Date(this.form.get('cancelDate').value);
      const lastDate = new Date(date.setDate(date.getDate() - 1));
      if (!this.isLastDayOfMonth(lastDate)) {
        this.form.get('cancelDate').setErrors({ min: true });
      } else {
        this.form.get('cancelDate').setErrors(null);
      }
    }
  }

  setReinstateDate(): void {
    // this is required because the date picker date is 1 day behind from c#
    const reinstateDate = this.form.controls.reinstateDate.value;
    this.policy.reinstateDate = new Date(reinstateDate.setDate(reinstateDate.getDate() + 1));
  }

  setCancelDate(): void {
    // this is required because the date picker date is 1 day behind from c#
    const cancelDate = this.form.controls.cancelDate.value;
    this.policy.cancellationDate = new Date(cancelDate.setDate(cancelDate.getDate() + 1));
  }

  save(): void {

    this.validateDate();
    if (!this.form.valid) { return; }

    this.loadingStart(`Saving ${this.policy.policyNumber}...`);

    const formModel = this.form.getRawValue();
    this.policy.commissionPercentage = formModel.commissionPercentage as number;
    this.policy.brokerId = this.brokerId as number;
    this.policy.installmentDate = this.getInstallmentDay(formModel.installmentDate); // this.parseForDate(formModel.installmentDate, true);
    this.policy.annualPremium = formModel.annualPremium;
    this.policy.billingFrequencyId = formModel.billingFrequency;
    this.policy.payablePremium = formModel.payablePremium as number;
    this.policy.communicationTypeIds = this.getSelectedCommunicationTypes();
    if (this.isReinstatePolicy) {
      this.policy.cancellationDate = null;
      this.policy.reinstateDate = this.parseForDate(this.form.controls.reinstateDate.value);
      this.policy.actionName = 'ReinstatePolicy';
      this.policy.status = 'Active';
      this.policy.isActive = true;
    }

    if (this.isCancelPolicy) {
      this.policy.reinstateDate = null;
      this.policy.cancellationDate = this.parseForDate(this.form.controls.cancelDate.value);
      this.policy.actionName = 'CancelPolicy';

      if (this.form.controls.note.value) {
        const note = new Note();
        note.itemType = 'Policy';
        note.itemId = this.policy.id;
        note.text = this.form.controls.note.value;
        note.modifiedBy = this.authService.getUserEmail();
        this.notesService.addNote(ServiceTypeEnum.PolicyManager, note).subscribe();
      }
    }
    this.policy.reason = this.form.controls.reason.value;
    const policyNumber = this.policy.policyNumber;
    this.policyService.editPolicy(this.policy).subscribe(() => {
      this.done(policyNumber);
    });
  }

  getInstallmentDay(day: number): Date {
    const today = new Date();
    const installDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return installDate;
  }

  reinstatePolicy(): void {
    this.isReinstatePolicy = true;
    this.form.controls.reinstateDate.setValidators([Validators.required]);
    this.form.controls.reinstateDate.enable();
    this.form.controls.reason.enable();
    this.setReasonValidations();
  }

  cancelPolicy(): void {
    this.isCancelPolicy = true;
    this.form.controls.cancelDate.setValidators([Validators.required]);
    this.form.controls.cancelDate.enable();
    this.form.controls.reason.setValidators([Validators.required]);
    this.form.controls.reason.enable();
    this.form.controls.note.enable();
    this.setReasonValidations();
  }

  cancelReinstate(): void {
    this.isCancelPolicy = false;
    this.isReinstatePolicy = false;
    this.form.disable();
  }

  setReasonValidations() {
    this.form.controls.reason.setValidators([Validators.required]);
  }

  addInsuredLife(): void {
    this.router.navigate(['clientcare/policy-manager/insured-life-details', 'add', this.form.value.id]);
  }

  generateScheduleOptions(): void {
    this.showGenerateScheduleOptions = !this.showGenerateScheduleOptions;
    this.showHint = false;
    const policyId = this.form.controls.id.value;
    this.policyService.getPolicyScheduleData(policyId).subscribe(data => {
      const binary = atob(data.byteData.replace(/\s/g, ''));
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([view], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, 'Policy Schedule.pdf');
        this.msDownloaded = true;
      } else {
        this.formLetterResponse = data;
        this.formLetterResponse.localUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(url +
            '#view=FitH&pagemode=bookmark&toolbar=1&statusbar=1&messages=1&navpanes=1');
      }
    });
  }

  goBack(): void {
    this.showGenerateScheduleOptions = false;
  }

  generateSchedule(): void {
    this.loadingStart('Creating policy schedule....');
    const request = new PolicyScheduleRequest();
    request.policyId = this.form.controls.id.value;
    request.customEmailAddress = '';
    request.customEmailAddress += this.getEmailForSchedule();
    request.isSendClient = this.emailIndividual;
    if (!this.validateScheduleEmail(request)) {
      this.showHint = true;
      this.loadingStop();
      return;
    }
    this.sendPolicySchedule(request);
    this.generateScheduleOptions();
  }

  getEmailForSchedule(): string {
    const formModel = this.formEmailSelection.getRawValue();
    let email = '';
    if (this.emailUser) {
      const userEmail = this.authService.getUserEmail();
      email += userEmail + ';';
    }
    if (this.emailBroker) {
      let brokerEmail = '';
      for (const key in this.brokers) {
        if (this.brokers.hasOwnProperty(key)) {
          if (this.brokers[key].id === this.brokerId) {
            brokerEmail = this.brokers[key].email;
          }
        }
      }
      email += (brokerEmail) + ';';
    }

    const customEmail = formModel.email as string;
    if (customEmail !== '') {
      if (!this.formEmailSelection.valid) {
        this.loadingStop();
        this.showHint = true;
        return;
      }
      email += customEmail + ';';
    }

    return email;
  }

  validateScheduleEmail(request: PolicyScheduleRequest): boolean {
    if (request.customEmailAddress === '') {
      return false;
    }
    return true;
  }

  sendPolicySchedule(request: PolicyScheduleRequest): void {
    this.loadingStart('Creating policy schedule...');
    this.policyService.sendPolicySchedule(request)
      .subscribe(() => {
        this.alertService.success(`Policy Schedule has been sent to: ${request.customEmailAddress}`);
        this.loadingStop();
      });
  }

  transferPolicy(): void {
    this.router.navigate(['clientcare/policy-manager/policy-wizard/new/transfer-policy', this.form.value.id]);
  }

  editPolicy(): void {
    this.form.controls.policyStatus.enable();
    this.form.controls.renewalDate.disable();
  }

  updateDatesOnInceptionDateChanged(): void {
    this.form.controls.inceptionDate.valueChanges.subscribe(value => {
      if (value) {
        const inceptionDate = new Date(value);
        const renewalDate = new Date(value);
        const installmentDate = new Date(value);
        const installmentDay = this.getDayOfMonth(installmentDate);
        renewalDate.setFullYear(inceptionDate.getFullYear() + 1);
        installmentDate.setMonth(installmentDate.getMonth() + 1, 1);

        this.form.patchValue(
          {
            installmentDay,
            expiryDate: renewalDate,
            renewalDate
          });
      }
    });
  }

  setReminder(): void {
    this.router.navigate([`clientcare/policy-manager/follow-up-details/add/${this.policy.id}`]);
  }

  populatePolicyDocuments(policyId: number): void {
    this.policyDocuments.getData(policyId);
  }


  emailBrokerCheckChange(e: any) {
    this.emailBroker = e.checked;
  }

  emailIndividualCheckChange(e: any) {
    this.emailIndividual = e.checked;
  }

  emailCurrentUserCheckChange(e: any) {
    this.emailUser = e.checked;
  }

  isEuropAssistCheckChange(e: any) {
    this.isEuropAssist = e.checked;
    var premium = this.form.get('payablePremium').value;
    var annualPremium = this.form.get('annualPremium').value;
    if (this.isEuropAssist && !this.hasEuropAssist) {
      this.form.get('payablePremium').setValue(premium + this.europAssistFee);
      this.form.get('annualPremium').setValue(annualPremium + (12 * this.europAssistFee));
    }
    if (!this.isEuropAssist && this.hasEuropAssist) {
      this.form.get('payablePremium').setValue(premium - this.europAssistFee);
      this.form.get('annualPremium').setValue(annualPremium - (12 * this.europAssistFee));
    }
  }

  billingFrequencyChanged(): void {
    this.calculateCommissionAndPayablePremium();
  }

  commissionPercentageChanged(): void {
    this.calculateCommissionAndPayablePremium();
  }

  premiumChanged(): void {
    this.calculateCommissionAndPayablePremium();
  }

  //#region 'Calculations'

  calculateCommission(): number {
    const premium = this.form.controls.annualPremium.value;
    const commissionPercentage = this.form.controls.commissionPercentage.value;

    let commission = 0;
    if (premium > 0 && commissionPercentage > 0) {
      commission = (premium * (commissionPercentage / 100));
      const policy = this.readForm();

      switch (policy.billingFrequencyId as FrequencyTypeEnum) {
        case FrequencyTypeEnum.Annually:
          commission = (commission * 12);
          break;
        case FrequencyTypeEnum.Monthly:
          commission = (commission * 1);
          break;
        case FrequencyTypeEnum.Quarterly:
          commission = (commission * 4);
          break;
        case FrequencyTypeEnum.BiAnnually:
          commission = (commission * 6);
          break;
        default:
          commission = (commission * 1);
      }
    }

    commission = +commission.toFixed(2) as number; // round off

    this.form.patchValue({ commissionAmount: commission });
    return commission;
  }

  calculatePayablePremium(defaultProductPaymentFrequencyId: number): number {
    const formModel = this.form.getRawValue();
    const billingFrequency = this.form.controls.billingFrequency.value;
    const premium = this.form.controls.annualPremium.value;
    let payablePremium = 0;
    let multiplier = 1;
    switch (defaultProductPaymentFrequencyId as FrequencyTypeEnum) {
      case FrequencyTypeEnum.Annually:
        multiplier = 1;
        break;
      case FrequencyTypeEnum.Monthly:
        multiplier = 12;
        break;
      case FrequencyTypeEnum.Quarterly:
        multiplier = 4;
        break;
      case FrequencyTypeEnum.BiAnnually:
        multiplier = 2;
        break;
      default:
        throw new Error(
          `'Unable to calculate payable premium based on unknown payment frequency: ${defaultProductPaymentFrequencyId}'`);
    }

    switch (billingFrequency as FrequencyTypeEnum) {
      case FrequencyTypeEnum.Annually:
        payablePremium = (premium as number * multiplier);
        break;
      case FrequencyTypeEnum.BiAnnually:
        payablePremium = (premium as number * multiplier) / 2;
        break;
      case FrequencyTypeEnum.Quarterly:
        payablePremium = (premium as number * multiplier) / 4;
        break;
      case FrequencyTypeEnum.Monthly:
        payablePremium = (premium as number * multiplier) / 12;
        break;
      default:
        throw new Error(
          `'Unable to calculate payable premium based on unknown payment frequency: ${billingFrequency}'`);
    }

    payablePremium +=
      formModel.commissionAmount ? formModel.commissionAmount : 0 as number; // Add commission to payable premium

    payablePremium = +payablePremium.toFixed(2) as number; // Round off

    this.form.patchValue({ payablePremium });
    return payablePremium;
  }

  calculateCommissionAndPayablePremium(): void {
    this.isCalculating = true;
    const productIds = this.clientCover.map(clientCover => clientCover.productId).join(',');
    if (productIds.length > 0) {
      this.productService.getProductsByIds(productIds).subscribe(products => {
        const defaultProductBillingFrequency = 2; // products[0].frequencyTypeId;
        this.calculateCommission();
        this.calculatePayablePremium(defaultProductBillingFrequency);
        this.isCalculating = false;
      });
    } else {
      this.isCalculating = false;
    }
  }

  previousPage() {
    this.location.back();
  }

  sendSchedule(): void {
    this.loadingStart('Sending policy schedule....');
    const request = new SendScheduleRequest();
    request.data = this.formLetterResponse.byteData;
    request.documentName = 'Policy Schedule.pdf';
    request.policyId = this.policy.id;
    request.customEmailAddress = '';
    request.isSendClient = this.emailIndividual;
    if (this.emailIndividual) {
      this.contactService.getContactByItemType('Client', this.policy.clientId).subscribe(contacts => {
        const individualEmail = contacts[0].email + ';';
        request.customEmailAddress += individualEmail;
        request.customEmailAddress += this.getEmailForSchedule();
        if (!request.customEmailAddress) {
          this.showHint = true;
          this.loadingStop();
          return;
        }
        this.sendPolicyScheduleData(request);
      });
    } else {
      request.customEmailAddress += this.getEmailForSchedule();
      if (!request.customEmailAddress) {
        this.showHint = true;
        this.loadingStop();
        return;
      }
      this.sendPolicyScheduleData(request);
    }
  }

  sendPolicyScheduleData(request: SendScheduleRequest) {
    this.policyService.sendGeneratedPolicyData(request).subscribe(result => {
      if (result) {
        this.alertService.success('Schedule has been send successfully.');
      } else {
        this.alertService.error('Unable to send Schedule');
      }

      this.loadingStop();
    });
  }

  openNewWindow() {
    window.open(this.formLetterResponse.localUrl);
  }

  isLastDayOfMonth = (d: Date): boolean => {
    const day = d.getDate();
    const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    // Only Allow Last day of Month
    return day === lastDayOfMonth;
  }

  getCancellationReasons(): any {
    this.lookupService.getCancellationReasons().subscribe(results => {
      this.reasons = results;
    });
  }

  getSelectedCommunicationTypes(): number[] {
    const ids: number[] = [];
    const selectedIds = this.form.controls.communicationType.value ? this.form.controls.communicationType.value.length : 0;
    for (let i = 0; i < selectedIds; i++) {
      ids.push(this.form.controls.communicationType.value[i]);
    }
    return ids;
  }

  getCommunicationTypes(): void {
    this.lookupService.getCommunicationTypes().subscribe(
      data => {
        this.communicationTypeList = data;
      });
  }

  getAuditDetails(id: number): void {
    const auditRequest = new AuditRequest(ServiceTypeEnum.PolicyManager, PolicyItemTypeEnum.Policy, id);
    this.auditLogComponent.getData(auditRequest);
  }
}
