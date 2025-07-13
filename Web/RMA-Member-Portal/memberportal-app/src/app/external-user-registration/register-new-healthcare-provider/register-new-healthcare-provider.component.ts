import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConfirmationDialogsService } from 'src/app/shared/components/confirm-message/confirm-message.service';
import { ClientTypeEnum } from 'src/app/shared/enums/client-type-enum';
import { CompanyIdTypeEnum } from 'src/app/shared/enums/company-id-type-enum';
import { ContactDesignationTypeEnum } from 'src/app/shared/enums/contact-designation-type-enum';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'src/app/shared/enums/document-system-name-enum';
import { HealthCareProviderGroupEnum } from 'src/app/shared/enums/health-care-provider-group-enum';
import { MemberStatusEnum } from 'src/app/shared/enums/member-status-enum';
import { PractitionerTypeEnum } from 'src/app/shared/enums/practitioner-type-enum';
import { RolePlayerIdentificationType } from 'src/app/shared/enums/roleplayer-identification-type-enum';
import { VatCodeEnum } from 'src/app/shared/enums/vat-code.enum';
import { HealthCareProviderModel } from 'src/app/shared/models/healthare-provider-model';
import { RolePlayerAddress } from 'src/app/shared/models/role-player-address';
import { RolePlayerBankingDetail } from 'src/app/shared/models/role-player-banking-detail';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { RolePlayerContact } from 'src/app/shared/models/roleplayer-contact';
import { StartWizardRequest } from 'src/app/shared/models/start-wizard-request.model';
import { HealthCareProviderService } from 'src/app/shared/services/healthcare-provider.service';
import { RequiredDocumentService } from 'src/app/shared/services/required-document.service';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { WizardService } from 'src/app/shared/services/wizard.service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-register-new-healthcare-provider',
  templateUrl: './register-new-healthcare-provider.component.html',
  styleUrls: ['./register-new-healthcare-provider.component.scss']
})
export class RegisterNewHealthcareProviderComponent implements OnInit {

  @Input() rolePlayer: RolePlayer;
  @Input() showActionBtn: boolean = true;
  @Input() editHCPDemographicsActionBtn: boolean = false;
  @Input() editHCPPractiveDetailsFormChanged: boolean = false;
  @Input() editHCPBankingDetailsActionBtn: boolean = false;
  @Input() title: string = 'Register New Healthcare Provider:';
  @Input() isReadOnly = false;
  @Output() registerNewHealthCareProviderEmit = new EventEmitter<RolePlayer>();
  @Output() actionPerformedOnHealthCareProviderEmit = new EventEmitter<boolean>();
  isLoading = true;
  isLinear = true;
  isStep1HCPDetailsComplete = false;
  isStep2AddressDetailsComplete = false;
  isStep3ContactsDetailsComplete = false;
  isStep4BankingDetailsComplete = false;
  isSubmitComplete:boolean = false;
  formNameGroup: FormGroup;

  registrationTypes: CompanyIdTypeEnum[];
  serviceProviderTypes: PractitionerTypeEnum[];
  vatRegisteredTypes: VatCodeEnum[];
  healthCareProviderGroupTypes: HealthCareProviderGroupEnum[];

  healthcareProviderContacts: RolePlayerContact[];
  rolePlayerPrimaryContact: RolePlayerContact;
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
  showFeild = false;

  constructor(private fb: FormBuilder, private readonly requiredDocumentService: RequiredDocumentService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly wizardService: WizardService, private router: Router, private activatedRoute: ActivatedRoute,
    private readonly toasterService: ToastrManager,
    private readonly authService: AuthService,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly healthCareProviderService: HealthCareProviderService,
    private changeDetectorRef: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.setRolePlayer();
    this.onHCPFormChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.passedRolePlayer?.currentValue) {
      this.rolePlayer = changes?.passedRolePlayer?.currentValue;
    }
    if (changes?.showActionBtn?.currentValue) {
      this.showActionBtn = changes?.showActionBtn?.currentValue;
    }
    this.title = changes?.title?.currentValue;

    if (changes?.isReadOnly?.currentValue) {
      this.disableForm(changes?.isReadOnly?.currentValue)
    }

  }

  setRolePlayer() {
    if (isNullOrUndefined(this.rolePlayer)) {
      this.rolePlayer = new RolePlayer();
      this.linkedId = Date.now() % 1_000_000; //Last 6 digits of timestamp
      this.rolePlayer.healthCareProvider = new HealthCareProviderModel();
      this.rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationType.HealthCareProvider;
      this.rolePlayer.clientType = ClientTypeEnum.HealthCareProvider;
      this.rolePlayer.memberStatus = MemberStatusEnum.New;
      this.getLookups();
    }

  }

  saveRolePlayerAndHCPDetails() {
    this.createRolePlayerAndHCPDetails();
    this.isLoading = true;
    const practiceNumber = this.rolePlayer.healthCareProvider.practiceNumber;

    this.healthCareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber).subscribe(healthCareProvider => {
      if (healthCareProvider) {
        this.toasterService.warningToastr('HealthCare Provider with PracticeNumber: ' + practiceNumber + 'already exist');
        this.rolePlayerSaved = healthCareProvider.rolePlayerId > 0;
        this.rolePlayer.healthCareProvider = healthCareProvider;
        this.formNameGroup.reset();
        this.isLoading = false;
      }
      else {
        this.isLoading = false;
        this.createHCPWorkflowWizard();
      }

    });


  }

  createHCPWorkflowWizard() {
    this.isLoading = true;
    this.getRolePlayerPrimaryContact(this.rolePlayer.rolePlayerContacts)
    this.createRolePlayerAndHCPDetails();
    this.rolePlayer.memberStatus = MemberStatusEnum.New;
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.linkedId;
    startWizardRequest.type = 'healthcare-provider-registration';
    startWizardRequest.data = JSON.stringify(this.rolePlayer);
    const message = 'Request for new HCP registration sent successfully.';

    this.wizardService.startWizardAnon(startWizardRequest)
      .subscribe((wizard) => {
        this.actionPerformedOnHealthCareProviderEmit.emit(true);
        this.toasterService.successToastr(message);
        this.isLoading = false;
        this.isSubmitComplete = true;
        this.confirmservice
          .confirmWithoutContainer(message,
            `Once approved, an activation email will be sent to ${this.rolePlayerPrimaryContact?.emailAddress}.` +
            `Click OK to go to the sign-in page and wait for the email.`,
            'Center', 'Center', 'OK').subscribe(result => {
              window.location.href = this.authService.getSingleSignOnIssuerAuthority();
            });
      });

  }


  getRolePlayerPrimaryContact(contacts: RolePlayerContact[]) {
    this.rolePlayerPrimaryContact = contacts.find(x => x.contactDesignationType === ContactDesignationTypeEnum.PrimaryContact);
    if (!this.rolePlayerPrimaryContact)
      this.rolePlayerPrimaryContact = contacts[0];
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
    this.isHealthcarePracticeClosed();
    this.setAuditDetailsAsHCP();
    return this.rolePlayer;

  }

  setAuditDetailsAsHCP() {
    function auditUpdate(obj) {
      Object.keys(obj).forEach(key => {
        switch (key.toLowerCase()) {
          case 'createdBy'.toLowerCase():
            obj[key] = this.rolePlayerPrimaryContact.emailAddress;
            break;
          case 'modifiedBy'.toLowerCase():
            obj[key] = this.rolePlayerPrimaryContact.emailAddress;
            break;
          case 'createdDate'.toLowerCase():
            obj[key] = new Date();
            break;
          case 'modifiedDate'.toLowerCase():
            obj[key] = new Date();
            break;
          default:
            break;
        }
      });
    }

    auditUpdate(this.rolePlayer.healthCareProvider)
    auditUpdate(this.rolePlayer.rolePlayerAddresses)
    auditUpdate(this.rolePlayer.rolePlayerContacts)
    auditUpdate(this.rolePlayer.rolePlayerBankingDetails)
    auditUpdate(this.rolePlayer)
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
    this.rolePlayer.rolePlayerContacts = this.healthcareProviderContacts;
  }

  isContactsEdited($event: boolean) {
    if (this.showActionBtn == false && $event) {
      this.editHCPDemographicsActionBtn = true;
    }
  }

  setAddress($event: RolePlayerAddress[]) {
    this.healthcareProviderAddressDetails = $event;
    this.rolePlayer.rolePlayerAddresses = this.healthcareProviderAddressDetails;
  }

  isAddressEdited($event: boolean) {
    if (this.showActionBtn == false && $event) {
      this.editHCPDemographicsActionBtn = true;
    }

    this.completeStep2AddressDetailsValidation()
  }

  isRequiredDocumentsEdited($event: RolePlayerAddress[]) {
    this.editHCPDemographicsActionBtn = true;
  }

  setBankAccount($event: RolePlayerBankingDetail[]) {
    this.healthcareProviderBankingDetails = $event;
    this.rolePlayer.rolePlayerBankingDetails = this.healthcareProviderBankingDetails;
  }

  isBankAccountEdited($event: boolean) {
    if (this.showActionBtn == false && $event) {
      this.editHCPBankingDetailsActionBtn = true;
    }

    this.completeStep4BankingDetailsValidation();
  }

  contactProvided($event: RolePlayerContact[]) {
    this.completeStep3ContactsDetailsValidation()
  }

  onHCPFormChanges(): void {
    this.formNameGroup.valueChanges.subscribe(val => {
      this.completeStep1HCPDetailsValidation();
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
      needTreatments: [{ value: null, disabled: false }],
      vatRegistationNumber: [{ value: null, disabled: false }],
      isPreferred: [{ value: null, disabled: false }],
      isActive: [{ value: null, disabled: false }],
      isMineHospital: [{ value: null, disabled: false }],
      allowSameDayTreatment: [{ value: null, disabled: false }]
    });

    this.isLoading = false;
  }

  disableForm(disableVal: boolean) {
    if (disableVal) {
      this.formNameGroup.disable();
    }
    else {
      this.formNameGroup.enable();
    }
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
    return this.isStep1HCPDetailsComplete = this.formNameGroup.valid ? true : false;
  }

  completeStep2AddressDetailsValidation(): boolean {
    return this.isStep2AddressDetailsComplete = this.rolePlayer.rolePlayerAddresses.length > 0 ? true : false;
  }

  completeStep3ContactsDetailsValidation(): boolean {
    return this.isStep3ContactsDetailsComplete = this.rolePlayer.rolePlayerContacts.length > 0 ? true : false;
  }

  completeStep4BankingDetailsValidation(): boolean {
    return this.isStep4BankingDetailsComplete = this.rolePlayer.rolePlayerBankingDetails.length > 0 ? true : false;
  }

}
