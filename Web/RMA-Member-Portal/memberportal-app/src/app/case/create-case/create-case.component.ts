import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidateSAIdNumber } from 'src/app/shared-utilities/validators/id-number-sa.validator';
import { DetailsComponent } from 'src/app/shared/components/details/details.component';
import { CaseType } from 'src/app/shared/enums/case-type.enum';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { Brokerage } from 'src/app/shared/models/brokerage';
import { Case } from 'src/app/shared/models/case';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { Person } from 'src/app/shared/models/person';
import { Product } from 'src/app/shared/models/product';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { StartWizardRequest } from 'src/app/shared/models/start-wizard-request.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { RequiredDocumentService } from 'src/app/shared/services/required-document.service';
import { WizardService } from 'src/app/shared/services/wizard.service';
import { CreateCaseDocumentsComponent } from '../create-case-documents/create-case-documents.component';
import { BrokerPolicyService } from 'src/app/broker/services/broker-policy-service';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { Representative } from 'src/app/shared/models/representative';
import { Policy } from 'src/app/shared/models/policy';

@Component({
  selector: 'app-create-case',
  templateUrl: './create-case.component.html',
  styleUrls: ['./create-case.component.css']
})
export class CreateCaseComponent extends DetailsComponent implements OnInit {

  @ViewChild(CreateCaseDocumentsComponent) createCaseDocumentsComponent: CreateCaseDocumentsComponent;

  generatedCode = '';
  displayedColumns = ['code', 'name', 'idNumber', 'actions'];
  displayedPolicyColumns = ['policyNumber', 'displayName', 'policyStatus', 'actions'];

  case = new Case();
  user: UserDetails;
  brokerage: Brokerage;
  mainMember: RolePlayer;
  representative: Representative;
  juristicRepresentative: Representative;

  idTypes: Lookup[] = [];
  brokerages: Brokerage[] = [];
  activeProducts: Product[] = [];
  policies: RolePlayerPolicy[] = [];

  selectedProductId: number;
  juristicRepresentativeId: number;

  isProductsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isBrokerageLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  validStatus: string;
  validAction: string;
  clientreference: string;

  idType = 0;
  selectedCaseTypeId = 0;
  selectedIndex = 0;
  selectedBrokerId = 0;
  selectedRepresentativeId = 0;
  policyId = 0;

  hasBroker = false;
  isGroup = false;
  inputReadonly = true;
  showPolicies = false;
  isGroupPolicy = false;
  policySelected = false;
  noPoliciesFound = false;
  canSelectPolicy = false;
  documentsRequired = true;
  searchingPolicies = false;
  isReclaimPolicies = false;
  documentSetLoading = true;
  mainMemberDeceased = false;
  policyMovementFound = false;
  hasSearchedPolicies = false;
  allDocumentsSupplied = false;
  cannotReclaimPolicies = false;
  hasCreateCasePermission = false;
  searchingPolicyMovements = false;
  clientReferenceDuplicated = false;
  hasSelectedSearchedPolicy = false;
  setRepresentativeValidation = true;
  applyInsuredLifeValidations = false;
  searchingClientReferenceDuplicates = false;
  requiredDoc = false;
  noRepsFound: boolean;
  searchingReps: boolean;
  hasGroupPermission: boolean;
  searchingInsuredLife: boolean;
  hasIndividualPermission: boolean;
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly productService: ProductService,
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService,
    private readonly policyService: BrokerPolicyService,
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
    this.user = this.authService.getCurrentUser();
    if (this.user.roleName === ConstantPlaceholder.MemberPortalBrokerRole) {
      this.hasCreateCasePermission = true;
      this.hasIndividualPermission = true;
      this.hasGroupPermission = true;

      this.getBrokerage(this.user.id)
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      code: new FormControl(''),
      caseType: new FormControl(''),
      representative: new FormControl('', [Validators.required]),
      brokerage: new FormControl('', [Validators.required]),
      juristicRepresentative: new FormControl(''),
      product: new FormControl('', [Validators.required]),
      idType: ['', [Validators.required]],
      idNumber: new FormControl('', null, (control: FormControl) => {
        return new Promise((resolve) => {
          if (this.selectedCaseTypeId !== CaseType.IndividualNewBusiness && this.selectedCaseTypeId !== CaseType.GroupNewBusiness) {
            this.applyInsuredLifeValidations ? resolve({ exists: true }) : resolve(null);
          } else { resolve(null); }
        });
      }),
    });
    this.form.get('code').disable();
    this.form.get('brokerage').disable();
  }

  getBrokerage(userId: number) {
    this.policyService.GetBrokerageByUserId(userId).subscribe(brokerage => {
      this.brokerage = brokerage;
      this.selectedBrokerId = brokerage.id;
      this.hasBroker = true;

      brokerage.representatives.forEach(rep => {
        if (rep && rep.email === this.user.email) {
          this.representative = rep;
        }
      });

      this.form.patchValue({
        brokerage: `${this.brokerage.fspNumber} : ${this.brokerage.name}`,
        representative: `${this.representative.code}: ${this.representative.firstName} ${this.representative.surnameOrCompanyName}`
      });

      this.getActiveProductsForRepresentative();
      this.getJuristicRepresentative(this.brokerage.id);
    })
  }

  setForm() {
    this.form.patchValue({
      code: this.generatedCode
    });
  }

  readForm() {
    this.case.caseTypeId = this.selectedCaseTypeId;
    this.case.representativeId = this.representative.id;
    this.case.brokerageId = this.selectedBrokerId;
    this.case.productId = this.selectedProductId;
    this.case.idNumber = this.form.value.idNumber as string;
    this.case.clientReference = null;
    this.case.brokerage = this.brokerage;
    this.case.representative = this.representative;
    this.case.juristicRepresentative = this.juristicRepresentative;
  }

  save() { }

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

  getTime(dtm: Date): number {
    return new Date(dtm).getTime();
  }

  getActiveProductsForBroker(brokerageId: number) {
    this.isProductsLoading.next(true);
    this.productService.GetActiveProductsForBroker(brokerageId).subscribe(data => {
      if (data.length > 0) {
        this.activeProducts = data;
      }
      this.isProductsLoading.next(false);
    });
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

  getJuristicRepresentative(brokerageId: number): void {
    this.juristicRepresentative = null;
    if (this.representative.activeBrokerage && this.representative.activeBrokerage.brokerageId === brokerageId && this.representative.activeBrokerage.juristicRepId) {
      this.juristicRepresentativeId = this.representative.activeBrokerage.juristicRepId;
      this.policyService.getRepresentative(this.juristicRepresentativeId).subscribe(data => {
        this.juristicRepresentative = data;
        this.form.patchValue({
          juristicRepresentative: `${data.code}: ${data.firstName} ${data.surnameOrCompanyName}`
        });
      });
    }
  }

  caseTypeChanged(event: any) {
    if (event.value === ConstantPlaceholder.GroupCase) {
      this.isGroup = true;
      this.requiredDoc = true;
      this.allDocumentsSupplied = true;
    } else {
      this.isGroup = false;
      this.requiredDoc = false;
      this.allDocumentsSupplied = false;
    }

    this.documentSetLoading = true;
    this.selectedCaseTypeId = event.value as number;
    if (this.documentsRequired) {
      this.createCaseDocumentsComponent.refresh(this.selectedCaseTypeId);

      this.setRequiredValidatior(this.selectedCaseTypeId === CaseType.IndividualNewBusiness, 'idType');
    }
    this.CheckDocumentStatus();
    this.documentSetLoading = false;
  }

  CheckDocumentStatus() {
    this.createCaseDocumentsComponent.allDocumentsSupplied$.subscribe(result => {
      if (this.createCaseDocumentsComponent.documents) {
        this.createCaseDocumentsComponent.documents.forEach(doc => {
          if (doc.required && doc.documentStatus === DocumentStatusEnum.Received) {
            this.requiredDoc = true;
          }
          if ((doc.documentTypeName === ConstantPlaceholder.IdCopy
            || doc.documentTypeName === ConstantPlaceholder.FicaDeclaration)
            && doc.documentStatus === DocumentStatusEnum.Received) {
            this.allDocumentsSupplied = true;
          }
        })
      }
    })
  }

  setRequiredValidatior(applyValidator: boolean, comntrolName: string) {
    if (applyValidator) {
      this.form.get(comntrolName).setValidators([Validators.required]);
      this.form.get(comntrolName).markAsTouched();
    } else {
      this.form.get(comntrolName).setValidators(null);
    }
    this.form.get(comntrolName).updateValueAndValidity();
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
      const awaitingDocuments = this.createCaseDocumentsComponent.documents.filter(
        s => s.documentStatus === DocumentStatusEnum.Awaiting && s.required);
      this.allDocumentsSupplied = awaitingDocuments.length === 0;
      if (!this.allDocumentsSupplied) { return; }
    }
    if (this.form.valid) {
      this.startWizard();
    }
  }

  checkDocuments(): void {
    const awaitingDocuments = this.createCaseDocumentsComponent.documents.filter(
      s => s.documentStatus === DocumentStatusEnum.Awaiting && s.required);
    this.allDocumentsSupplied = awaitingDocuments.length === 0;
  }

  updateValueAndValidity(): void {
    this.form.get('brokerage').updateValueAndValidity();
    this.form.get('caseType').updateValueAndValidity();
    this.form.get('code').updateValueAndValidity();
    this.form.get('idNumber').updateValueAndValidity();
    this.form.get('idType').updateValueAndValidity();
    this.form.get('product').updateValueAndValidity();
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

  instantiateCaseVariables(startWizardRequest: StartWizardRequest) {
    this.case.mainMember = new RolePlayer();
    this.case.mainMember.person = new Person();
    this.policies.push(new RolePlayerPolicy());
    this.case.mainMember.policies = this.policies;

    this.case.mainMember.person.idNumber = this.case.idNumber;
    this.case.mainMember.person.idType = this.idType;
    this.case.mainMember.policies[0].representativeId = this.representative.id;
    this.case.juristicRepresentativeId = this.juristicRepresentativeId;
    this.case.juristicRepresentative = this.juristicRepresentativeId > 0 ? this.juristicRepresentative : null;

    const s = JSON.stringify(this.case);
    startWizardRequest.data = s;
  }

  doSubmit(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.alertService.success('Case created successfully');
      this.router.navigateByUrl('case-list');
    });
  }

  tabSelectionChanged(selectedIndex: number) {
    this.updateValueAndValidity();

    if (selectedIndex !== 1) { return; }
    let applyValidation = false;
  }

}
