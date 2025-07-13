import { RoleplayerGroupPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-group-policy';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { Case } from 'projects/clientcare/src/app/policy-manager/shared/entities/case';
import { RepresentativeSearchComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-search/representative-search.component';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { CreateCaseDocumentsComponent } from '../create-case-documents/create-case-documents.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MovePoliciesCase } from 'projects/clientcare/src/app/policy-manager/shared/entities/move-policies-case';
import { PolicyMovement } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-movement';
import { DatePipe } from '@angular/common';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { CaseTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/case-type.enum';
import { BehaviorSubject, empty } from 'rxjs';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Policy } from '../../shared/entities/policy';
import { map } from 'rxjs/operators';
import { MoveSchemeCase } from '../../shared/entities/move-scheme-case';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { UpgradeDowngradePolicyCase } from '../../shared/entities/upgrade-downgrade-policy-case';

@Component({
  selector: 'app-create-case',
  templateUrl: './create-case.component.html',
  styleUrls: ['./create-case.component.css']
})
export class CreateCaseComponent extends DetailsComponent implements OnInit {

  @ViewChild(CreateCaseDocumentsComponent, { static: false }) createCaseDocumentsComponent: CreateCaseDocumentsComponent;
  @ViewChild(RepresentativeSearchComponent, { static: false }) representativeSearchComponent: RepresentativeSearchComponent;

  generatedCode = '';
  representative: Representative;
  juristicRepresentative: Representative;
  brokerage: Brokerage;
  juristicRepresentativeId: number;
  isProductsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isBrokerageLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingPolicy: BehaviorSubject<boolean> = new BehaviorSubject(false);
  searchingReps: boolean;
  searchingInsuredLife: boolean;
  noRepsFound: boolean;
  selectedProductId: number;
  case = new Case();
  hasIndividualPermission: boolean;
  hasGroupPermission: boolean;
  hasClientRefPermission: boolean;
  displayedColumns = ['code', 'name', 'idNumber', 'actions'];
  clientreference: string;
  displayedPolicyColumns = ['policyNumber', 'displayName', 'policyStatus', 'actions'];
  mainMember: RolePlayer;
  activeProducts: Product[] = [];
  brokerages: Brokerage[] = [];
  representatives: Representative[] = [];
  policies: RolePlayerPolicy[] = [];
  idTypes: Lookup[] = [];
  wizardRecord: Wizard;
  idType = 0;
  selectedCaseTypeId = 0;
  selectedIndex = 0;
  selectedBrokerId = 0;
  selectedRepresentativeId = 0;
  policyId = 0;
  isGroupPolicy = false;
  clientReferenceDuplicated = false;
  searchingClientReferenceDuplicates = false;
  setRepresentativeValidation = true;
  policySelected = false;
  noPoliciesFound = false;
  searchingPolicies = false;
  showPolicies = false;
  hasSearchedPolicies = false;
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasCancelPermission = false;
  hasLapsePermission = false;
  hasMaintainPolicyPermission = false;
  hasCreateCasePermission = false;
  allDocumentsSupplied = false;
  documentsRequired = true;
  applyInsuredLifeValidations = false;
  movePolicyCase: MovePoliciesCase;
  isReclaimPolicies = false;
  policyMovementFound = false;
  selectedBrokerage: Brokerage;
  searchingPolicyMovements = false;
  hasMovePoliciesPermission = false;
  hasMovePolicySchemePermission = false;
  hasUpgradeDowngradePolicyPermission = false;
  documentSetLoading = true;
  hasMaintainMemberRelationsPermission = false;
  cannotReclaimPolicies = false;
  hasReinstatePolicyPermission = false;
  hasContinuePolicyPermission = false;
  hasGroupPolicyMemberPermission = false;
  hasChangePolicyStatusPermission = false;
  canCreateCase = true;
  createCaseWarning = '';
  canSelectPolicy = false;
  validStatus: string;
  validAction: string;
  policiesWithInvalidActions = 0;
  mainMemberDeceased = false;
  inputReadonly = true;
  actionBlockedReason = '';
  hasSelectedSearchedPolicy = false;

  constructor(
    appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly representativeService: RepresentativeService,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly productService: ProductService,
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService,
    private readonly rolePlayerPolicyService: RolePlayerPolicyService,
    private readonly policyService: PolicyService,
    private readonly roleplayerService: RolePlayerService,
    private readonly datePipe: DatePipe
  ) {
    super(appEventsManager, alertService, router, '', '', 1);
    this.case = new Case();
    this.createForm();
    this.generateCaseCode();
    this.loadLookups();
  }

  ngOnInit() {
    this.configurePermissions();
  }

  loadLookups() {
    this.loadIdTypes();
  }

  configurePermissions() {
    this.hasIndividualPermission = userUtility.hasPermission('Create New Business Individual Case');
    this.hasGroupPermission = userUtility.hasPermission('Create New Business Group Case');
    this.hasClientRefPermission = userUtility.hasPermission('Create New Business Individual Case Client Ref');
    this.hasMaintainPolicyPermission = userUtility.hasPermission('Create Manage Policy Case');
    this.hasCancelPermission = userUtility.hasPermission('Create Cancel Policy Case');
    this.hasLapsePermission = userUtility.hasPermission('Create Lapse Policy Case');
    this.hasMovePoliciesPermission = userUtility.hasPermission('Create move-agent-policy');
    this.hasMovePolicySchemePermission = userUtility.hasPermission('Create move policy scheme');
    this.hasUpgradeDowngradePolicyPermission = userUtility.hasPermission('Create Upgrade/Downgrade Policy Case')
    this.hasMaintainMemberRelationsPermission = userUtility.hasPermission('Create Main Member Relations');
    this.hasReinstatePolicyPermission = userUtility.hasPermission('Create Reinstate Policy Case');
    this.hasContinuePolicyPermission = userUtility.hasPermission('Create Continue Policy Case');
    this.hasGroupPolicyMemberPermission = userUtility.hasPermission('Create Manage Policy Case');
    this.hasChangePolicyStatusPermission = userUtility.hasPermission('Create Change Policy Status Case');

    if (this.hasIndividualPermission
      || this.hasGroupPermission
      || this.hasClientRefPermission
      || this.hasMaintainPolicyPermission
      || this.hasCancelPermission
      || this.hasLapsePermission
      || this.hasMovePoliciesPermission
      || this.hasMaintainMemberRelationsPermission
      || this.hasReinstatePolicyPermission
      || this.hasContinuePolicyPermission
      || this.hasGroupPolicyMemberPermission
      || this.hasChangePolicyStatusPermission) {
      this.hasCreateCasePermission = true;
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      code: new UntypedFormControl(''),
      caseType: new UntypedFormControl(''),
      representative: new UntypedFormControl('', [Validators.required]),
      brokerage: new UntypedFormControl('', [Validators.required]),
      juristiceRepresentative: new UntypedFormControl(''),
      product: new UntypedFormControl('', [Validators.required]),
      idType: ['', [Validators.required]],
      idNumber: new UntypedFormControl('', null, (control: UntypedFormControl) => {
        return new Promise((resolve) => {
          if (this.selectedCaseTypeId !== CaseType.IndividualNewBusiness && this.selectedCaseTypeId !== CaseType.GroupNewBusiness) {
            this.applyInsuredLifeValidations ? resolve({ exists: true }) : resolve(null);
          } else { resolve(null); }
        });
      }),
      policyNumber: new UntypedFormControl('', [Validators.required]),
      clientreference: new UntypedFormControl('', null, (control: UntypedFormControl) => {
        return new Promise((resolve) => {
          this.clientReferenceDuplicated ? resolve({ exists: true }) : resolve(null);
        });
      }),
      filter: new UntypedFormControl('', [Validators.minLength(3)]),
      filterPolicy: new UntypedFormControl('', [Validators.minLength(3)]),
      insuredLife: new UntypedFormControl(''),
      policyMovementReference: new UntypedFormControl(''),
      reclaimPolicies: [false],
      policyMovementCurrentRep: new UntypedFormControl(''),
      policyMovementCurrentBrokerage: new UntypedFormControl(''),
      policyMovementPreviousRep: new UntypedFormControl(''),
      policyMovementPreviousBrokerage: new UntypedFormControl(''),
      policyMovementPoliciesCount: new UntypedFormControl(''),
      policyMovementDate: new UntypedFormControl('')
    });
    this.form.get('code').disable();
    this.form.get('representative').disable();
    this.form.get('juristiceRepresentative').disable();
  }

  setForm() {
    this.form.patchValue({
      code: this.generatedCode
    });
  }

  readForm() {
    const clientReference = this.form.value.clientreference as string;
    this.case.caseTypeId = this.selectedCaseTypeId;
    this.case.representativeId = this.selectedRepresentativeId;
    this.case.brokerageId = this.selectedBrokerId;
    this.case.productId = this.selectedProductId;
    this.case.idNumber = this.form.value.idNumber as string;
    this.case.clientReference = clientReference.trim();
    this.case.representative = this.representative;
    this.case.juristicRepresentative = this.juristicRepresentative;
    this.case.brokerage = this.brokerage;
  }

  save() { }

  get isOldCaseNumberRequired() {
    return (this.selectedCaseTypeId === CaseType.IndividualNewBusiness || this.selectedCaseTypeId === CaseType.GroupNewBusiness);
  }

  get canSearchRepresentative(): boolean {
    const result = (this.selectedCaseTypeId === CaseType.IndividualNewBusiness
      || this.selectedCaseTypeId === CaseType.GroupNewBusiness
      || (this.selectedCaseTypeId === CaseType.MovePolicies && !this.isReclaimPolicies));
    if (result && this.setRepresentativeValidation) {
      this.applyRequiredValidation(true, 'representative');
      this.setRepresentativeValidation = false;
    }

    if (!result) {
      this.setRepresentativeValidation = true;
    }

    return result;
  }

  get showRepresentatives(): boolean {
    return !this.representative && this.representatives.length > 0;
  }

  get individualFicaIdRequired(): boolean {
    if (!this.createCaseDocumentsComponent) { return; }
    if (!this.createCaseDocumentsComponent.dataSource) { return; }
    if (!this.createCaseDocumentsComponent.dataSource.documents) { return; }
    if (this.selectedCaseTypeId === CaseType.IndividualNewBusiness) {
      const docs = this.createCaseDocumentsComponent.dataSource.documents.filter(
        s => [82, 83].includes(s.docTypeId) && s.documentStatus === DocumentStatusEnum.Awaiting);
      return docs.length === 2;
    }
    return false;
  }

  generateCaseCode() {
    this.requiredDocumentService.generateDocumentNumber('PolicyCase').subscribe(result => {
      this.generatedCode = result;
      this.case.code = this.generatedCode;
      if (this.createCaseDocumentsComponent) {
        this.createCaseDocumentsComponent.keys = { CaseCode: `${this.generatedCode}` };
      }
      this.setForm();
      this.documentSetLoading = false;
    });
  }

  getBrokeragesForRepresentative() {
    this.isBrokerageLoading.next(true);
    this.representativeService.GetBrokeragesForRepresentative(this.representative.id).subscribe(data => {
      this.brokerages = data.filter(b => b.id === this.representative.activeBrokerage.brokerageId);

      if (!this.brokerages || this.brokerages.length === 0) {
        this.brokerage = null;
        this.isBrokerageLoading.next(false);
        return;
      }

      const brokerage = this.brokerages[0];
      this.selectedBrokerId = brokerage.id;
      this.brokerage = brokerage;
      this.form.patchValue({ brokerage: brokerage.id });
      this.getJuristicRepresentative(this.selectedBrokerId);
      this.isBrokerageLoading.next(false);
    });
  }

  getTime(dtm: Date): number {
    return new Date(dtm).getTime();
  }

  getActiveProductsForRepresentative() {
    this.isProductsLoading.next(true);
    this.productService.getActiveProductsForRepresentative(this.representative.id).subscribe(data => {
      if (data.length > 0) {
        this.activeProducts = data;
      }
      this.isProductsLoading.next(false);
    });
  }

  caseTypeChanged(event: any) {
    this.documentSetLoading = true;
    this.selectedCaseTypeId = event.value as number;
    if (this.documentsRequired) {
      this.createCaseDocumentsComponent.refresh(this.selectedCaseTypeId);

      const maintainPolicyCases: number[] = [
        CaseType.MaintainPolicyChanges,
        CaseType.ChangePolicyStatus,
        CaseType.ReinstatePolicy,
        CaseType.CancelPolicy,
        CaseType.MemberRelations,
        CaseType.ContinuePolicy,
        CaseType.LapsePolicy,
        CaseType.GroupPolicyMember,
        CaseType.CancelCoidPolicy,
        CaseType.MovePolicyScheme,
        CaseType.UpgradeDowngradePolicy
      ];

      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.IndividualNewBusiness
        || this.selectedCaseTypeId === CaseType.MemberRelations, 'idType');
      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.MaintainPolicyChanges
        || this.selectedCaseTypeId === CaseType.ReinstatePolicy
        || this.selectedCaseTypeId === CaseType.CancelPolicy
        || this.selectedCaseTypeId === CaseType.ContinuePolicy
        || this.selectedCaseTypeId === CaseType.ChangePolicyStatus
        || this.selectedCaseTypeId === CaseType.MovePolicyScheme
        || this.selectedCaseTypeId === CaseType.UpgradeDowngradePolicy, 'filterPolicy');
      this.setRequiredValidatior(this.selectedCaseTypeId !== CaseType.MaintainPolicyChanges
        && this.selectedCaseTypeId !== CaseType.CancelPolicy
        && this.selectedCaseTypeId !== CaseType.MovePolicies
        && this.selectedCaseTypeId !== CaseType.MemberRelations
        && this.selectedCaseTypeId !== CaseType.ReinstatePolicy
        && this.selectedCaseTypeId !== CaseType.LapsePolicy
        && this.selectedCaseTypeId !== CaseType.ContinuePolicy
        && this.selectedCaseTypeId !== CaseType.ChangePolicyStatus
        && this.selectedCaseTypeId !== CaseType.MovePolicyScheme
        && this.selectedCaseTypeId !== CaseType.UpgradeDowngradePolicy, 'brokerage');
      this.setRequiredValidatior(this.selectedCaseTypeId !== CaseType.MaintainPolicyChanges
        && this.selectedCaseTypeId !== CaseType.CancelPolicy
        && this.selectedCaseTypeId !== CaseType.MovePolicies
        && this.selectedCaseTypeId !== CaseType.MemberRelations
        && this.selectedCaseTypeId !== CaseType.ReinstatePolicy
        && this.selectedCaseTypeId !== CaseType.LapsePolicy
        && this.selectedCaseTypeId !== CaseType.ContinuePolicy
        && this.selectedCaseTypeId !== CaseType.ChangePolicyStatus
        && this.selectedCaseTypeId !== CaseType.MovePolicyScheme
        && this.selectedCaseTypeId !== CaseType.UpgradeDowngradePolicy, 'product');

      this.setRequiredValidatior(maintainPolicyCases.includes(this.selectedCaseTypeId), 'policyNumber');

      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.MovePolicies, 'representative');
      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.MemberRelations, 'insuredLife');
      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.GroupPolicyMember, 'idType');
      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.GroupPolicyMember, 'idNumber');

      if (this.selectedCaseTypeId === CaseType.MemberRelations) {
        this.setRequiredValidatior(false, 'representative');
        this.setRequiredValidatior(false, 'juristiceRepresentative');
      } else if (this.selectedCaseTypeId === CaseType.GroupPolicyMember) {
        this.setRequiredValidatior(false, 'brokerage');
        this.setRequiredValidatior(false, 'juristiceRepresentative');
        this.setRequiredValidatior(false, 'representative');
        this.setRequiredValidatior(false, 'product');
      }

      if (this.selectedCaseTypeId === CaseType.LapsePolicy) {
        this.documentsRequired = false;
      }
    }

    this.form.get('caseType').disable();
    this.documentSetLoading = false;
  }

  setRequiredValidatior(applyValidator: boolean, controlName: string) {
    if (applyValidator) {
      this.form.get(controlName).setValidators([Validators.required]);
      this.form.get(controlName).markAsTouched();
    } else {
      this.form.get(controlName).setValidators(null);
    }
    this.form.get(controlName).updateValueAndValidity();
  }

  brokerageChanged(event: any) {
    this.selectedBrokerId = event.value as number;
    this.getJuristicRepresentative(this.selectedBrokerId);
  }

  getJuristicRepresentative(brokerageId: number): void {
    this.juristicRepresentative = null;
    if (this.representative.activeBrokerage && this.representative.activeBrokerage.brokerageId === brokerageId && this.representative.activeBrokerage.juristicRepId) {
      this.juristicRepresentativeId = this.representative.activeBrokerage.juristicRepId;
      this.representativeService.getRepresentative(this.juristicRepresentativeId).subscribe(data => {
        this.juristicRepresentative = data;
        this.form.patchValue({
          juristiceRepresentative: `${data.code}: ${data.firstName} ${data.surnameOrCompanyName}`
        });
      });
    }
  }

  productChanged(event: any) {
    this.selectedProductId = event.value as number;
  }

  idTypeChanged(event: any) {
    this.idType = event.value as number;

    if (this.idType === 1) {
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(13), ValidateSAIdNumber]);
      this.form.get('idNumber').markAsTouched();
      this.form.get('idNumber').updateValueAndValidity();
    } else {
      this.setRequiredValidatior(true, 'idNumber');
    }
  }

  navigateToWorkflow() {
    if (this.documentsRequired) {
      const awaitingDocuments = this.createCaseDocumentsComponent.dataSource.documents.filter(
        s => s.documentStatus === DocumentStatusEnum.Awaiting && s.required);
      this.allDocumentsSupplied = awaitingDocuments.length === 0;
      if (!this.allDocumentsSupplied) { return; }
    }
    if (this.form.valid) {
      this.startWizard();
    }
  }

  checkDocuments(): void {
    const awaitingDocuments = this.createCaseDocumentsComponent.dataSource.documents.filter(
      s => s.documentStatus === DocumentStatusEnum.Awaiting && s.required);
    this.allDocumentsSupplied = awaitingDocuments.length === 0;
  }

  updateValueAndValidity(): void {
    this.form.get('brokerage').updateValueAndValidity();
    this.form.get('caseType').updateValueAndValidity();
    this.form.get('clientreference').updateValueAndValidity();
    this.form.get('code').updateValueAndValidity();
    this.form.get('filter').updateValueAndValidity();
    this.form.get('filterPolicy').updateValueAndValidity();
    this.form.get('idNumber').updateValueAndValidity();
    this.form.get('idType').updateValueAndValidity();
    this.form.get('insuredLife').updateValueAndValidity();
    this.form.get('juristiceRepresentative').updateValueAndValidity();
    this.form.get('policyMovementCurrentBrokerage').updateValueAndValidity();
    this.form.get('policyMovementCurrentRep').updateValueAndValidity();
    this.form.get('policyMovementDate').updateValueAndValidity();
    this.form.get('policyMovementPoliciesCount').updateValueAndValidity();
    this.form.get('policyMovementPreviousBrokerage').updateValueAndValidity();
    this.form.get('policyMovementPreviousRep').updateValueAndValidity();
    this.form.get('policyMovementReference').updateValueAndValidity();
    this.form.get('policyNumber').updateValueAndValidity();
    this.form.get('product').updateValueAndValidity();
    this.form.get('reclaimPolicies').updateValueAndValidity();
    this.form.get('representative').updateValueAndValidity();
  }

  startWizard() {
    this.isLoading.next(true);
    const startWizardRequest = new StartWizardRequest();
    let wizardRequestType: string;

    switch (this.selectedCaseTypeId) {
      case CaseType.IndividualNewBusiness:
        wizardRequestType = 'new-business-individual';
        this.readForm();
        this.instantiateCaseVariables(startWizardRequest);
        startWizardRequest.linkedItemId = -1;
        break;
      case CaseType.GroupNewBusiness:
        wizardRequestType = 'new-business-group';
        this.readForm();
        this.instantiateCaseVariables(startWizardRequest);
        startWizardRequest.linkedItemId = -1;
        break;
      case CaseType.MaintainPolicyChanges:
        if (this.isGroupPolicy) {
          wizardRequestType = 'manage-policy-group';
        } else {
          wizardRequestType = 'manage-policy-individual';
        }
        this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.policyId);
        break;
      case CaseType.ChangePolicyStatus:
        wizardRequestType = 'change-policy-status';
        this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.policyId);
        break;
      case CaseType.CancelPolicy:
        if (this.isGroupPolicy) {
          wizardRequestType = 'cancel-policy-group';
        } else {
          wizardRequestType = 'cancel-policy-individual';
        }
        this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.policyId);
        break;
      case CaseType.ReinstatePolicy:
        wizardRequestType = 'reinstate-policy';
        this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.policyId);
        break;
      case CaseType.MemberRelations:
        wizardRequestType = 'maintain-policy-members';
        this.instantiateMemberRelationsCaseVariables(startWizardRequest);
        break;
      case CaseType.MovePolicies:
        wizardRequestType = 'move-broker-policies';
        this.readForm();
        this.instantiateMoveBrokerPolicyCaseVariables(startWizardRequest);
        break;
      case CaseType.ContinuePolicy:
        wizardRequestType = 'continue-policy';
        this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.policyId);
        break;
      case CaseType.LapsePolicy:
        wizardRequestType = 'lapse-policy';
        this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.policyId);
        break;
      case CaseType.GroupPolicyMember:
        this.readForm();
        wizardRequestType = 'maintain-group-member';
        this.instantiateMaintainGroupMemberCaseVariables(startWizardRequest, this.policyId);
        break;
      case CaseType.MovePolicyScheme:
        this.readForm;
        wizardRequestType = 'move-policy-scheme';
        this.instantiateMovePolicySchemeVariables(startWizardRequest, this.policyId);
        break;
      case CaseType.UpgradeDowngradePolicy:
        this.readForm;
        wizardRequestType = 'upgrade-downgrade-policy';
        this.instantiateUpgradeDowngradePolicyVariables(startWizardRequest, this.policyId);
        break;
    }
    startWizardRequest.type = wizardRequestType;
    this.doSubmit(startWizardRequest);
  }

  selectTab(index: number): void {
    this.selectedIndex = index;
    this.updateValueAndValidity();
  }

  loadIdTypes(): void {
    this.lookupService.getIdTypes().subscribe(data => {
      this.idTypes = data.filter(idType => idType.id === 1 || idType.id === 2);
    });
  }

  findRepresentative(event: any): void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }

    const query = this.form.get('filter').value;
    if (query.length < 3 || query === '') {
      this.form.get('filter').setErrors({ minlength: true });
      this.form.get('filter').markAsTouched();
      this.form.get('filter').updateValueAndValidity();
      return;
    }

    this.searchingReps = true;
    this.resetRepresentativeSearch();

    this.representativeService.searchNaturalRepresentatives(query).subscribe(data => {
      this.noRepsFound = !(data.length > 0);
      this.noRepsFound ? this.representatives = [] : this.representatives = data;
      this.searchingReps = false;
    });
  }

  resetRepresentativeSearch() {
    this.form.patchValue({
      representative: null,
      juristiceRepresentative: null,
      brokerage: null,
      product: null
    });

    this.selectedRepresentativeId = null;
    this.selectedBrokerId = null;
    this.selectedProductId = null;
    this.representative = null;

    this.brokerages = [];
    this.activeProducts = [];

    this.noRepsFound = false;
  }

  selectRepresentative(rep: Representative): void {
    this.selectedRepresentativeId = rep.id;
    this.representative = rep;

    this.form.patchValue({
      representative: `${rep.code}: ${rep.firstName} ${rep.surnameOrCompanyName}`
    });

    this.applyRequiredValidation(false, 'representative');
    this.getBrokeragesForRepresentative();
    this.getActiveProductsForRepresentative();
  }

  instantiateCaseVariables(startWizardRequest: StartWizardRequest) {
    this.case.mainMember = new RolePlayer();
    this.case.mainMember.person = new Person();
    this.case.mainMember.person.idNumber = this.case.idNumber;
    this.case.mainMember.person.idType = this.idType;
    this.case.juristicRepresentativeId = this.juristicRepresentativeId;
    this.case.juristicRepresentative = this.juristicRepresentativeId > 0 ? this.juristicRepresentative : null;
    const s = JSON.stringify(this.case);
    startWizardRequest.data = s;
  }

  instantiateMemberRelationsCaseVariables(startWizardRequest: StartWizardRequest): void {
    this.case = new Case();
    this.case.mainMember = new RolePlayer();

    this.case.code = this.generatedCode;
    this.case.caseTypeId = this.selectedCaseTypeId;
    this.case.mainMember = this.mainMember;

    const s = JSON.stringify(this.case);

    startWizardRequest.linkedItemId = this.case.policyId && this.case.policyId > 0 ? this.case.policyId : -1;
    startWizardRequest.data = s;
  }

  instantiateMaintainGroupMemberCaseVariables(startWizardRequest: StartWizardRequest, policyId: number) {
    const value = this.form.getRawValue();

    const policy = new RoleplayerGroupPolicy();
    policy.code = value.code;
    policy.parentPolicyId = this.policyId;
    policy.parentPolicyNumber = value.policyNumber;
    policy.clientReference = value.clientreference;
    if (policy.clientReference === '') {
      policy.clientReference = null;
    }
    policy.mainMember = new RolePlayer();
    policy.mainMember.person = new Person();
    policy.mainMember.person.idType = value.idType;
    policy.mainMember.person.idNumber = value.idNumber;

    startWizardRequest.linkedItemId = -1;
    startWizardRequest.data = JSON.stringify(policy);
  }

  instantiateExistingPolicyCaseVaribles(startWizardRequest: StartWizardRequest, policyId: number) {
    this.case = new Case();
    this.case.code = this.generatedCode;
    this.case.caseTypeId = this.selectedCaseTypeId;
    startWizardRequest.linkedItemId = policyId;
    startWizardRequest.data = JSON.stringify(this.case);
  }

  instantiateMovePolicySchemeVariables(startWizardRequest: StartWizardRequest, policyId: number) {
    const moveCase = new MoveSchemeCase();
    moveCase.code = this.generatedCode;
    moveCase.sourcePolicyId = policyId;
    moveCase.sourcePolicyNumber = this.form.get('policyNumber').value;
    startWizardRequest.linkedItemId = policyId;
    startWizardRequest.data = JSON.stringify(moveCase);
  }

  instantiateUpgradeDowngradePolicyVariables(startWizardRequest: StartWizardRequest, policyId: number) {
    const policyCase = new UpgradeDowngradePolicyCase();
    policyCase.code = this.generatedCode;
    policyCase.policyId = policyId;
    startWizardRequest.linkedItemId = policyId;
    startWizardRequest.data = JSON.stringify(policyCase);
  }

  doSubmit(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.alertService.success('Case created successfully');
      this.router.navigateByUrl('clientcare/policy-manager');
    });
  }

  doValidate(policyId: number): boolean {
    if (policyId > 0) {
      this.form.get('policyNumber').setErrors(null);
      return true;
    } else {
      this.form.get('policyNumber').setErrors({ policyNotFound: true });
      return false;
    }
  }

  verifyPolicyExists(startWizardRequest: StartWizardRequest) {
    if (this.form.get('policyNumber').value) {
      this.rolePlayerPolicyService.verifyPolicyExists(this.form.get('policyNumber').value).pipe(
        map((policyId: number) => {
          if (this.doValidate(policyId)) {
            this.instantiateExistingPolicyCaseVaribles(startWizardRequest, policyId);
            this.doSubmit(startWizardRequest);
          }
        })
      ).subscribe();
    }
  }

  findPolicies(event: any) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }

    this.form.patchValue({ policyNumber: '' });
    this.hasSearchedPolicies = false;
    this.noPoliciesFound = false;
    this.showPolicies = false;
    this.policySelected = false;
    this.policies = [];

    const query = this.form.get('filterPolicy').value;
    if (query.length > 3) {
      this.searchingPolicies = true;
      this.rolePlayerPolicyService.searchPoliciesForCase(query.trim()).subscribe(
        data => {
          if (this.selectedCaseTypeId === CaseType.ChangePolicyStatus) {
            // Cannot change the status of group scheme parent policies
            data = data.filter(p => !p.isGroupPolicy);
          } else if (this.selectedCaseTypeId === CaseType.MovePolicyScheme) {
            // Can only move child members of group policies
            data = data.filter(p => p.isGroupPolicy);
          }
          this.noPoliciesFound = data.length <= 0;
          if (!this.noPoliciesFound) {
            this.policies = data;
            this.showPolicies = true;
            this.policySelected = false;
            this.checkIfFoundPoliciesHaveValidActions(data);
          }
          this.searchingPolicies = false;
          this.hasSearchedPolicies = true;
        }
      );
    }
  }

  findMainMemberByIdNumber(event: any) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') { return; }
    this.searchingInsuredLife = true;
    this.mainMember = null;
    this.form.patchValue({ insuredLife: '' });
    const idNumber = this.form.get('idNumber').value;
    this.roleplayerService.getPersonRolePlayerByIdNumber(idNumber, this.idType).subscribe(roleplayers => {
      this.applyInsuredLifeValidations = roleplayers.length === 0;
      if (roleplayers.length > 0) {
        this.mainMember = roleplayers[0];
        this.form.patchValue({ insuredLife: this.mainMember.displayName });
      }
      this.applyExistsValidation(this.applyInsuredLifeValidations, 'idNumber');
      this.searchingInsuredLife = false;
      if (this.selectedCaseTypeId === CaseTypeEnum.MemberRelations) {
        if (this.mainMember) {
          if (!this.mainMember.person.isAlive) {
            this.mainMemberDeceased = true;
            this.form.get('insuredLife').setErrors({ deceasedMember: true });
            return;
          } else {
            this.mainMemberDeceased = false;
            this.form.get('insuredLife').setErrors(null);
          }
        }
      }
    });
  }

  findPoliciesByIdNumber() {
    this.hasSearchedPolicies = false;
    this.noPoliciesFound = false;
    this.showPolicies = false;
    this.policySelected = false;
    this.policies = [];

    this.searchingPolicies = true;
    const query = this.form.get('idNumber').value;
    this.rolePlayerPolicyService.searchPoliciesByIdNumberForCase(query).subscribe(data => {
      if (data.length > 0) {
        this.policies = data;
        this.showPolicies = true;
        this.policySelected = false;
      } else {
        this.noPoliciesFound = true;
      }
      this.searchingPolicies = false;
      this.hasSearchedPolicies = true;
    });
  }

  selectPolicy(policy: RolePlayerPolicy) {
    this.isLoadingPolicy.next(true);
    this.form.get('filterPolicy').setErrors(null);
    this.policyId = policy.policyId;
    this.isGroupPolicy = policy.isGroupPolicy;
    this.policySelected = true;
    if (this.selectedCaseTypeId === CaseType.ReinstatePolicy || this.selectedCaseTypeId === CaseType.ContinuePolicy) {
      switch (this.selectedCaseTypeId) {
        case CaseType.ReinstatePolicy:
          if (policy.policyStatus === PolicyStatusEnum.Cancelled) {
            this.form.patchValue({ policyNumber: policy.policyNumber });
          } else if (policy.lapsedCount < 2) {
            if (this.validateNinetyDaysWindows(policy.lastLapsedDate)) {
              this.hasSelectedSearchedPolicy = true;
              this.actionBlockedReason = '';
            } else {
              this.hasSelectedSearchedPolicy = true;
              this.actionBlockedReason = '90 days has passed since policy lapsed';
              this.form.get('filterPolicy').setErrors({ invalid: true });
              this.isLoadingPolicy.next(false);
              return;
            }
          }
          break;
        case CaseType.ContinuePolicy:
          if (this.validateNinetyDaysWindows(policy.policyPauseDate)) {
            this.hasSelectedSearchedPolicy = true;
            this.actionBlockedReason = '';
          } else {
            this.hasSelectedSearchedPolicy = true;
            this.actionBlockedReason = '90 days has passed since policy was paused';
            this.form.get('filterPolicy').setErrors({ invalid: true });
            this.isLoadingPolicy.next(false);
            return;
          }
          break;
      }
    }

    if (policy.policyNumber.startsWith('02-')) {
      this.createCaseDocumentsComponent.refresh(13);
    }

    this.wizardService.GetWizardByLinkedItemId(this.policyId).subscribe({
      next: (wizard: any) => {
        this.wizardRecord = wizard;
        if (this.wizardRecord === null || this.wizardRecord === undefined) {
          this.createCaseWarning = '';
          this.form.patchValue({ policyNumber: policy.policyNumber });
        }
        else {
          const wizardData: any = JSON.parse(this.wizardRecord.data);
          if (this.wizardRecord.wizardStatusId === WizardStatus.Cancelled
            || this.wizardRecord.wizardStatusId === WizardStatus.Completed
            || this.wizardRecord.wizardStatusId === WizardStatus.Rejected) {
            this.createCaseWarning = '';
            this.form.patchValue({ policyNumber: policy.policyNumber });
          } else {
            const code = wizardData[0].code === undefined ? wizard.name : wizardData[0].code;
            this.createCaseWarning = ' ' + code;
            this.form.get('policyNumber').markAsTouched();
            this.form.get('policyNumber').setErrors({ 'case': true });
          }
        }
      },
      error: () => {
        this.isLoadingPolicy.next(false);
      },
      complete: () => {
        this.isLoadingPolicy.next(false);
      }
    });
  }

  tabSelectionChanged(selectedIndex: number) {
    this.updateValueAndValidity();

    if (selectedIndex !== 1) { return; }
    let applyValidation = false;
    if ((this.selectedCaseTypeId === CaseType.ReinstatePolicy
      || this.selectedCaseTypeId === CaseType.CancelPolicy
      || this.selectedCaseTypeId === CaseType.MaintainPolicyChanges
      || this.selectedCaseTypeId === CaseType.ChangePolicyStatus
      || this.selectedCaseTypeId === CaseType.MovePolicyScheme
      || this.selectedCaseTypeId === CaseType.UpgradeDowngradePolicy)
      && !this.form.get('policyNumber').value) {
      applyValidation = true;
    }

    this.applyRequiredValidation(applyValidation, 'policyNumber');
  }

  applyRequiredValidation(applyValidation: boolean, controlName: string) {
    if (applyValidation) {
      this.form.get(controlName).setErrors({ required: true });
    } else {
      this.form.get(controlName).setErrors(null);
    }
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  applyExistsValidation(applyValidation: boolean, controlName: string) {
    if (applyValidation) {
      this.form.get(controlName).setErrors({ exists: true });
    } else {
      this.form.get(controlName).setErrors(null);
    }
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  clientReferenceExists(event: any) {
    if (event.target.value !== '') {
      const clientReference = event.target.value as string;
      this.searchingClientReferenceDuplicates = true;
      this.policyService.clientReferenceExists(clientReference.trim()).subscribe(result => {
        this.clientReferenceDuplicated = result;
        this.searchingClientReferenceDuplicates = false;
        this.applyExistsValidation(this.clientReferenceDuplicated, 'clientreference');
      });
    }
  }

  instantiateMoveBrokerPolicyCaseVariables(startWizardRequest: StartWizardRequest) {
    this.movePolicyCase = new MovePoliciesCase();
    this.movePolicyCase.policyMovement = new PolicyMovement();
    this.movePolicyCase.caseTypeId = this.selectedCaseTypeId;
    this.movePolicyCase.isReclaimingPolicies = this.isReclaimPolicies;
    this.movePolicyCase.code = this.generatedCode;
    if (this.isReclaimPolicies) {
      if (!this.policyMovementFound || !this.form.get('policyMovementReference').value) {
        this.form.get('policyMovementReference').setErrors({ policyMovementReferenceNotFound: true });
      } else {
        this.movePolicyCase.policyMovement.movementRefNo = this.form.get('policyMovementReference').value;
        const s = JSON.stringify(this.movePolicyCase);
        startWizardRequest.data = s;
        startWizardRequest.linkedItemId = -1;
      }
    } else {
      this.movePolicyCase.policyMovement.sourceRep = this.representative;
      this.movePolicyCase.policyMovement.sourceBrokerage = this.brokerage;
      this.movePolicyCase.juristicRepresentativeId = this.juristicRepresentativeId;
      this.movePolicyCase.juristicRepresentative = this.juristicRepresentativeId > 0 ? this.juristicRepresentative : null;
      const s = JSON.stringify(this.movePolicyCase);
      startWizardRequest.data = s;
      startWizardRequest.linkedItemId = -1;
    }
  }

  searchPolicyMovements() {
    if (this.form.get('policyMovementReference').value) {
      this.searchingPolicyMovements = true;
      this.rolePlayerPolicyService.verifyPolicyMovementExists(this.form.get('policyMovementReference').value).pipe(
        map((policyMovement: PolicyMovement) => {
          this.searchingPolicyMovements = false;
          if (policyMovement) {
            this.policyMovementFound = true;
            this.form.patchValue({ policyMovementCurrentRep: policyMovement.destinationRep.firstName + ' ' + policyMovement.destinationRep.surnameOrCompanyName });
            this.form.patchValue({ policyMovementCurrentBrokerage: policyMovement.destinationBrokerage.name });
            this.form.patchValue({ policyMovementPreviousRep: policyMovement.sourceRep.firstName + ' ' + policyMovement.sourceRep.surnameOrCompanyName });
            this.form.patchValue({ policyMovementPreviousBrokerage: policyMovement.sourceBrokerage.name });
            this.form.patchValue({ policyMovementPoliciesCount: policyMovement.policies.length });
            this.form.patchValue({ policyMovementDate: this.datePipe.transform(policyMovement.effectiveDate, 'yyyy-MM-dd') });
            this.cannotReclaimPolicies = new Date(policyMovement.effectiveDate) > new Date();
          } else {
            this.policyMovementFound = false;
            this.cannotReclaimPolicies = false;
            this.form.get('policyMovementReference').setErrors({ policyMovementReferenceNotFound: true });
          }
        })
      ).subscribe();
    } else {
      this.policyMovementFound = false;
      this.cannotReclaimPolicies = false;
    }
  }

  reclaimPolicySelectionChanged(event: any) {
    if (!event.checked) {
      this.policyMovementFound = false;
      this.cannotReclaimPolicies = false;
    }
  }
  getPolicyStatusDescription(id: number): string {
    const status = PolicyStatusEnum[id];
    return status;
  }

  getValidActionsAndStatus() {
    switch (this.selectedCaseTypeId) {
      case CaseType.MaintainPolicyChanges:
        this.validStatus = 'Active, Continued, Free Cover, Reinstated, Transferred or Pending First Premium';
        this.validAction = 'Managed/Maintained';
        break;
      case CaseType.ChangePolicyStatus:
        this.validStatus = 'Active or Paused';
        this.validAction = 'Status Changed';
        break;
      case CaseType.CancelPolicy:
        this.validStatus = 'Active';
        this.validAction = 'Cancelled';
        break;
      case CaseType.ReinstatePolicy:
        this.validStatus = 'Lapsed';
        this.validAction = 'Reinstated';
        break;
      case CaseType.LapsePolicy:
        this.validStatus = 'Active';
        this.validAction = 'Lapsed';
        break;
      case CaseType.ContinuePolicy:
        this.validStatus = 'Paused';
        this.validAction = 'Continued';
        break;
      case CaseType.GroupPolicyMember:
        this.validStatus = 'Active or Pending First Premium or Pending Cancelled';
        this.validAction = 'Managed/Maintained';
        break;
      case CaseType.MovePolicyScheme:
        this.validStatus = 'Active';
        this.validAction = 'Moved';
        break;
      case CaseType.UpgradeDowngradePolicy:
        this.validStatus = '';
        this.validAction = '';
        break;
    }
  }
  checkIfFoundPoliciesHaveValidActions(policies: RolePlayerPolicy[]) {
    this.policiesWithInvalidActions = 0;
    policies.forEach(c => {
      if (!this.checkIfActionCanOccurOnPolicy(c.policyStatus)) {
        this.policiesWithInvalidActions++;
      }
    });
    if (this.policiesWithInvalidActions > 0) {
      this.getValidActionsAndStatus();
    }
  }

  checkIfActionCanOccurOnPolicy(statusId: number) {
    switch (this.selectedCaseTypeId) {
      case CaseType.MaintainPolicyChanges:
      case CaseType.MovePolicyScheme:
      case CaseType.UpgradeDowngradePolicy:
        return (statusId === PolicyStatusEnum.Active
          || statusId === PolicyStatusEnum.FreeCover
          || statusId === PolicyStatusEnum.Reinstated
          || statusId === PolicyStatusEnum.Transferred
          || statusId === PolicyStatusEnum.Continued
          || statusId === PolicyStatusEnum.PendingFirstPremium);
      case CaseType.ChangePolicyStatus:
        return (statusId === PolicyStatusEnum.Active || statusId === PolicyStatusEnum.Paused);
      case CaseType.CancelPolicy:
        return (statusId !== PolicyStatusEnum.Cancelled && statusId !== PolicyStatusEnum.PendingCancelled);
      case CaseType.ReinstatePolicy:
        return (statusId === PolicyStatusEnum.Lapsed || statusId === PolicyStatusEnum.Cancelled);
      case CaseType.ContinuePolicy:
        return (statusId === PolicyStatusEnum.Paused);
      case CaseType.GroupPolicyMember:
        return (statusId === PolicyStatusEnum.Active || statusId === PolicyStatusEnum.PendingFirstPremium);
      case CaseType.LapsePolicy:
        return (statusId === PolicyStatusEnum.Active);
      default:
        return false;
    }
  }

  validateNinetyDaysWindows(dt: Date) {
    const actionDate = new Date(dt);
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();
    const differenceInTime = today - actionDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return (differenceInDays <= 90);
  }
}
