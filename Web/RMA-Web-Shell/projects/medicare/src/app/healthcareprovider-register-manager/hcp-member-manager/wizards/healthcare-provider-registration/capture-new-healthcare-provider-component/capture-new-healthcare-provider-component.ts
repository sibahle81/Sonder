import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import tr from 'date-fns/esm/locale/tr/index.js';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Validators } from 'ngx-editor';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { HealthCareProviderV2 } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/medical-service-provider.model';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { HealthCareProviderGroupEnum } from 'projects/shared-models-lib/src/lib/enums/health-care-provider-group-enum';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { PractitionerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/practitioner-type-enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-capture-new-healthcare-provider-component',
  templateUrl: './capture-new-healthcare-provider-component.html',
  styleUrls: ['./capture-new-healthcare-provider-component.css']
})
export class CaptureNewHealthcareProviderComponent {

  @Input() rolePlayer: RolePlayer;
  @Input() showActionBtn: boolean = true;
  @Input() editHCPDemographicsActionBtn: boolean = false;
  @Input() editHCPPractiveDetailsFormChanged: boolean = false;
  @Input() editHCPBankingDetailsActionBtn: boolean = false;
  @Input() title: string = 'Register New Healthcare Provider:';
  @Input() isReadOnly = false;
  @Input() context: WizardContext;
  @Output() registerNewHealthCareProviderEmit = new EventEmitter<RolePlayer>();
  @Output() actionPerformedOnHealthCareProviderEmit = new EventEmitter<boolean>();
  isLoading = true;
  isLinear = true;
  isStep1HCPDetailsComplete = false;
  isStep2AddressDetailsComplete = false;
  isStep3ContactsDetailsComplete = false;
  isStep4BankingDetailsComplete = false;
  checkStepValidations: boolean = false;
  formNameGroup: FormGroup;


  registrationTypes: CompanyIdTypeEnum[];
  serviceProviderTypes: PractitionerTypeEnum[];
  vatRegisteredTypes: VatCodeEnum[];
  healthCareProviderGroupTypes: HealthCareProviderGroupEnum[];


  healthcareProviderContacts: RolePlayerContact[];
  healthcareProviderBankingDetails: RolePlayerBankingDetail[];
  healthcareProviderAddressDetails: RolePlayerAddress[];

  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  documentSet = DocumentSetEnum.HealthcareProviderRegistrationDocuments;
  linkedId: number;
  key: string = 'RolePlayerId';
  allRequiredDocumentsUploaded: boolean;

  selectionTypes = [
    { text: "Yes", value: true },
    { text: "No", value: false }
  ];

  agreementTypes = [
    { text: "Specific", value: 0 },
    { text: "Annual", value: 3 },
    { text: "LifeLong", value: 1 }
  ];
  hcpRegisterRoute = 'register-new-healthcare-provider';
  isWizard: boolean;
  formLoaded = false;
  rolePlayerSaved = false;

  constructor(private fb: FormBuilder, private readonly requiredDocumentService: RequiredDocumentService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly wizardService: WizardService, private router: Router, private activatedRoute: ActivatedRoute,
    private readonly toasterService: ToastrManager,
    private readonly authService: AuthService,
    private readonly healthCareProviderService: HealthcareProviderService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

    if (this.router.routerState.snapshot.url.includes(this.hcpRegisterRoute)) {
      this.isWizard = true;
      this.setRolePlayer();
    }
    else {
      this.getLookups();
    }

  }

  ngOnit() {

  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes?.passedRolePlayer?.currentValue) {
      this.rolePlayer = changes?.passedRolePlayer?.currentValue;
      this.linkedId = this.rolePlayer.rolePlayerId;
    }
    if (changes?.showActionBtn?.currentValue) {
      this.showActionBtn = changes?.showActionBtn?.currentValue;
    }
    this.title = changes?.title?.currentValue;

    if (changes?.isReadOnly?.currentValue) {
      this.disableForm(changes?.isReadOnly?.currentValue)
    }

    if (changes?.context?.currentValue) {
      this.linkedId = this.context.wizard.linkedItemId
    }

    if (!this.formLoaded) {
      this.formLoaded = true
      this.prepopulateForm()
    }

  }

  setRolePlayer() {

    if (isNullOrUndefined(this.rolePlayer)) {
      this.rolePlayer = new RolePlayer();
      this.rolePlayer.healthCareProvider = new HealthCareProviderModel();
      this.rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.HealthCareProvider;
      this.rolePlayer.clientType = ClientTypeEnum.HealthCareProvider;
      this.rolePlayer.memberStatus = MemberStatusEnum.New;
      this.generateRolePlayerId();
    }
    else {
      this.prepopulateForm();
    }

  }

  saveRolePlayerAndHCPDetails() {
    this.createRolePlayerAndHCPDetails();
    this.isLoading = true;
    const practiceNumber = this.rolePlayer.healthCareProvider.practiceNumber;

    this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
      if (healthCareProvider) {
        this.toasterService.warningToastr('HealthCare Provider with PracticeNumber: ' + practiceNumber + 'already exist');
        this.toasterService.infoToastr('HealthCare Provider details have been pre-populated, confirm and click next.');
        this.rolePlayerSaved = healthCareProvider.rolePlayerId > 0;
        this.rolePlayer.healthCareProvider = healthCareProvider;
        this.formNameGroup.reset();
        this.prepopulateForm();
        this.isLoading = false;
      }
      else {
        this.rolePlayerService.addRolePlayer(this.rolePlayer).subscribe(result => {
          this.rolePlayer.rolePlayerBankingDetails = [];
          this.rolePlayerSaved = result > 0;
          this.isLoading = false;
        });
      }

    });


  }

  createHCPWorkflowWizard() {
    this.isLoading = true;
    this.createRolePlayerAndHCPDetails();
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.rolePlayer.rolePlayerId;
    startWizardRequest.type = 'healthcare-provider-registration';
    startWizardRequest.data = JSON.stringify(this.rolePlayer);
    const message = 'Approval workflow sent successfully.';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.actionPerformedOnHealthCareProviderEmit.emit(true);
        this.toasterService.successToastr(message);
        this.isLoading = false;
        this.router.navigateByUrl('medicare/manage-hcp/manage-hcp-profile');
      });

  }

  editHCPDemographicsWorkflowWizard() {
    this.isLoading = true;
    this.createRolePlayerAndHCPDetails();
    this.rolePlayer.memberStatus = MemberStatusEnum.Active;
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.rolePlayer.rolePlayerId;
    startWizardRequest.type = 'update-healthcare-provider-demographics';
    startWizardRequest.data = JSON.stringify(this.rolePlayer);
    const message = 'Workflow for demographics approval sent successfully.';

    this.createStartWizard(startWizardRequest, message)
  }

  editHCPBankingDetailsWorkflowWizard() {
    this.isLoading = true;
    this.createRolePlayerAndHCPDetails();
    this.rolePlayer.memberStatus = MemberStatusEnum.Active;
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.rolePlayer.rolePlayerId;
    startWizardRequest.type = 'update-healthcare-provider-banking-details';
    startWizardRequest.data = JSON.stringify(this.rolePlayer);
    const message = 'Workflow for banking approval sent successfully.';

    this.createStartWizard(startWizardRequest, message)
  }

  requestApproval(id: number, message: string) {
    this.wizardService.requestApproval(id).subscribe((result) => {
      this.toasterService.successToastr(message);
      this.isLoading = false;
      this.actionPerformedOnHealthCareProviderEmit.emit(true);
      this.router.navigateByUrl('medicare/manage-hcp/manage-hcp-profile');
    });
  }

  createStartWizard(startWizardRequest: StartWizardRequest, message: string) {
    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.requestApproval(wizard.id, message);
      });
  }

  createRolePlayerAndHCPDetails(): RolePlayer {
    this.rolePlayer.displayName = this.formNameGroup.controls.name.value;
    this.rolePlayer.healthCareProvider.name = this.formNameGroup.controls.name.value;
    this.rolePlayer.healthCareProvider.description = this.formNameGroup.controls.description.value;
    this.rolePlayer.healthCareProvider.practiceNumber = this.formNameGroup.controls.practiceNumber.value;
    this.rolePlayer.healthCareProvider.dispensingLicenseNo = this.formNameGroup.controls.dispensingLicenseNumber.value;
    this.rolePlayer.healthCareProvider.datePracticeStarted = this.formNameGroup.controls.datePracticeStarted.value;
    this.rolePlayer.healthCareProvider.datePracticeClosed = this.formNameGroup.controls.datePracticeClosed.value;
    this.rolePlayer.healthCareProvider.agreementType = this.formNameGroup.controls.agreementType.value;
    this.rolePlayer.healthCareProvider.providerTypeId = !(this.formNameGroup.controls.serviceProviderType.value) ? +PractitionerTypeEnum.UnknownAnyType : +PractitionerTypeEnum[this.formNameGroup.controls.serviceProviderType.value];
    this.rolePlayer.healthCareProvider.healthCareProviderGroupId = !(this.formNameGroup.controls.hcpChainGroup.value) ? +HealthCareProviderGroupEnum.Unknown : +HealthCareProviderGroupEnum[this.formNameGroup.controls.hcpChainGroup.value];
    this.rolePlayer.healthCareProvider.vatRegNumber = this.formNameGroup.controls.vatRegistationNumber.value;
    this.rolePlayer.healthCareProvider.isVat = !(this.formNameGroup.controls.vatRegistered.value) ? false : true;
    this.rolePlayer.healthCareProvider.isNeedTreatments = !(this.formNameGroup.controls.needTreatments.value) ? false : true;
    this.rolePlayer.healthCareProvider.isPreferred = !(this.formNameGroup.controls.isPreferred.value) ? false : this.formNameGroup.controls.isPreferred.value;
    this.rolePlayer.healthCareProvider.isActive = !(this.formNameGroup.controls.isActive.value) ? false : true;
    this.rolePlayer.healthCareProvider.isMineHospital = !(this.formNameGroup.controls.isMineHospital.value) ? false : this.formNameGroup.controls.isMineHospital.value;
    this.rolePlayer.healthCareProvider.isAllowSameDayTreatment = !(this.formNameGroup.controls.allowSameDayTreatment.value) ? false : this.formNameGroup.controls.allowSameDayTreatment.value;
    this.rolePlayer.healthCareProvider.modifiedBy = this.authService.getUserEmail();
    this.isHealthcarePracticeClosed()
    return this.rolePlayer;

  }

  isHealthcarePracticeClosed() {
    let closedDate = this.rolePlayer.healthCareProvider.datePracticeClosed
    if ((!isNullOrUndefined(closedDate) && closedDate !== "") || this.rolePlayer.healthCareProvider.isActive == false) {
      this.rolePlayer.healthCareProvider.isAuthorised = false;
      this.rolePlayer.healthCareProvider.isActive = false;
    }
  }

  setContacts($event: RolePlayerContact[]) {
    this.healthcareProviderContacts = $event;
  }

  isContactsEdited($event: boolean[]) {
    if (this.showActionBtn == false && $event) {
      this.editHCPDemographicsActionBtn = true;
    }

  }

  setAddress($event: RolePlayerAddress[]) {
    this.healthcareProviderAddressDetails = $event;
  }

  isAddressEdited($event: boolean) {
    if (this.showActionBtn == false && $event) {
      this.editHCPDemographicsActionBtn = true;
    }
  }

  isRequiredDocumentsEdited($event: RolePlayerAddress[]) {
    this.editHCPDemographicsActionBtn = true;
  }

  setBankAccount($event: RolePlayerBankingDetail[]) {
    this.healthcareProviderBankingDetails = $event;
  }

  isBankAccountEdited($event: boolean) {
    if (this.showActionBtn == false && $event) {
      this.editHCPBankingDetailsActionBtn = true;
    }

  }

  generateRolePlayerId() {
    this.requiredDocumentService.generateDocumentNumber('RolePlayerId').subscribe(result => {
      this.rolePlayer.rolePlayerId = +result;
      this.rolePlayer.healthCareProvider.rolePlayerId = this.rolePlayer.rolePlayerId;
      this.linkedId = this.rolePlayer.rolePlayerId;
      this.getLookups();
    });
  }

  onHCPFormChanges(): void {

    this.formNameGroup.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe(() => {
        //internal reviewer amending details from external request
        if (this.hasUncommittedData()) {
          this.createRolePlayerAndHCPDetails();
          this.toasterService.infoToastr('Healthcare Provider information updated successfully.');
        }

        if (!this.showActionBtn && !this.hasUncommittedData()) {
          this.editHCPDemographicsActionBtn = true;
          this.editHCPPractiveDetailsFormChanged = true;
        }
      });

  }

  getLookups() {
    this.registrationTypes = this.ToArray(CompanyIdTypeEnum);
    this.serviceProviderTypes = this.ToArray(PractitionerTypeEnum);
    this.vatRegisteredTypes = this.ToArray(VatCodeEnum);
    this.healthCareProviderGroupTypes = this.ToArray(HealthCareProviderGroupEnum);
    this.createForm();
  }


  createForm() {
    this.formNameGroup = this.fb.group({
      name: [{ value: null, disabled: false }, Validators.required],
      description: [{ value: null, disabled: false }, Validators.required],
      practiceNumber: [{ value: null, disabled: false }, Validators.required],
      dispensingLicenseNumber: [{ value: null, disabled: false }],
      datePracticeStarted: [{ value: '', disabled: false }, Validators.required],
      datePracticeClosed: [{ value: '', disabled: false }],
      agreementType: [{ value: null, disabled: false }, Validators.required],
      serviceProviderType: [{ value: null, disabled: false }, Validators.required],
      hcpChainGroup: [{ value: null, disabled: false }],
      vatRegistered: [{ value: null, disabled: false }, Validators.required],
      needTreatments: [{ value: null, disabled: false }, Validators.required],
      vatRegistationNumber: [{ value: null, disabled: false }],
      isPreferred: [{ value: null, disabled: false }],
      isActive: [{ value: null, disabled: false }],
      isMineHospital: [{ value: null, disabled: false }],
      allowSameDayTreatment: [{ value: null, disabled: false }]
    });

    this.isLoading = false;
  }

  disableForm(disableVal: boolean) {
    if (disableVal && !this.hasUncommittedData()) {
      this.formNameGroup.disable();
    }
    else {
      this.formNameGroup.enable();
    }
  }

  prepopulateForm() {
    this.isLoading = false
    this.formNameGroup.patchValue({
      name: this.rolePlayer.healthCareProvider.name,
      description: this.rolePlayer.healthCareProvider.description,
      practiceNumber: this.rolePlayer.healthCareProvider.practiceNumber,
      dispensingLicenseNumber: this.rolePlayer.healthCareProvider.dispensingLicenseNo,
      datePracticeStarted: this.rolePlayer.healthCareProvider.datePracticeStarted,
      datePracticeClosed: this.rolePlayer.healthCareProvider.datePracticeClosed,
      agreementType: this.rolePlayer.healthCareProvider.agreementType,
      hcpChainGroup: HealthCareProviderGroupEnum[this.rolePlayer.healthCareProvider.healthCareProviderGroupId],
      serviceProviderType: PractitionerTypeEnum[this.rolePlayer.healthCareProvider.providerTypeId],
      vatRegistationNumber: this.rolePlayer.healthCareProvider.vatRegNumber,
      vatRegistered: this.rolePlayer.healthCareProvider.isVat,
      needTreatments: this.rolePlayer.healthCareProvider.isNeedTreatments,
      isPreferred: this.rolePlayer.healthCareProvider.isPreferred,
      isActive: this.rolePlayer.healthCareProvider.isActive,
      isMineHospital: this.rolePlayer.healthCareProvider.isMineHospital,
      allowSameDayTreatment: this.rolePlayer.healthCareProvider.isAllowSameDayTreatment,
    });

    if (!this.router.routerState.snapshot.url.includes(this.hcpRegisterRoute)) {
      this.isWizard = this.hasUncommittedData();
      this.checkStepValidations = false;
      this.onHCPFormChanges();
    }
    else {
      this.checkStepValidations = true;
    }


  }

  hasUncommittedData() {
    return this.rolePlayer.memberStatus == MemberStatusEnum.New;
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  completeStep1HCPDetailsValidation(): boolean {
    this.isStep1HCPDetailsComplete = this.formNameGroup.valid ? true : false;
    this.changeDetectorRef.detectChanges();
    return this.isStep1HCPDetailsComplete;
  }

  completeStep2AddressDetailsValidation(): boolean {
    this.isStep2AddressDetailsComplete = this.rolePlayer.rolePlayerAddresses.length > 0 ? true : false;
    this.changeDetectorRef.detectChanges();
    return this.isStep2AddressDetailsComplete
  }

  completeStep3ContactsDetailsValidation(): boolean {
    this.isStep3ContactsDetailsComplete = this.rolePlayer.rolePlayerContacts.length > 0 ? true : false;
    this.changeDetectorRef.detectChanges();
    return this.isStep3ContactsDetailsComplete
  }

  completeStep4BankingDetailsValidation(): boolean {
    this.isStep4BankingDetailsComplete = this.rolePlayer.rolePlayerBankingDetails.length > 0 ? true : false;
    this.changeDetectorRef.detectChanges();
    return this.isStep4BankingDetailsComplete
  }

}
