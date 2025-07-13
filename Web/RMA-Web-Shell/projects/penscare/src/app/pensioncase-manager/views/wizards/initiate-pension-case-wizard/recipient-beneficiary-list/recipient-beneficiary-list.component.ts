import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Form, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { Contact } from 'projects/shared-components-lib/src/lib/models/contact.model';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { isSelectRequired } from 'projects/shared-utilities-lib/src/lib/validators/select.validator';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { ValidateMobileNumber } from 'projects/shared-utilities-lib/src/lib/validators/mobile-number.validator';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PensCareUtilities } from 'projects/penscare/src/app/shared-penscare/utils/penscare-utilities';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ActivatedRoute } from '@angular/router';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';


@Component({
  selector: 'app-recipient-beneficiary-list',
  templateUrl: './recipient-beneficiary-list.component.html',
  styleUrls: [
    './../recipient-information/recipient-information.component.css',
    './recipient-beneficiary-list.component.css'
  ]
})
export class RecipientBeneficiaryListComponent implements OnInit, OnDestroy {
  @Output() viewFormDetailEnabled = new EventEmitter<boolean>();
  @Output() updateModel = new EventEmitter<InitiatePensionCaseData>();
  @Input() context:WizardContext
  @Input() isWizard: boolean;

  @Input() personType: string;
  @Input() viewFormMode = false;
  @Input() addPersonMode = false;
  @Input() dataSource: Person[];
  @Input() benefitType: string;
  @Input() model: InitiatePensionCaseData;

  supportedPersonTypes: RolePlayerIdentificationTypeEnum[] = [RolePlayerIdentificationTypeEnum.Person];
  beneficiaryTypeEnum = BeneficiaryTypeEnum;
  benefitTypeEnum = BenefitTypeEnum;
  familyUnits: Lookup[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showTable = true;
  canEdit = true;
  displayedColumns = ['name', 'surname','idFamilyUnit', 'idPassportNumber', 'actions'];
  menus: { title: string, action: string, disable: boolean }[];
  form: UntypedFormGroup;
  blankForm: UntypedFormGroup;
  formHeader = '';
  selectedPerson: Person;
  emitChangeSubscription: any;
  lookupsCacheLoaded: boolean;
  isSaved: boolean;
  isView: boolean = false;

  rolePlayer: RolePlayer;
  tabIndex: number = 0;
  defaultPolicyId: any;


  constructor(
    private formBuilder: UntypedFormBuilder,
    private pensCareService: PensCareService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private readonly activatedRoute: ActivatedRoute,
    private wizardService: WizardService,
    private readonly _rolePlayerService: RolePlayerService,
  ) { }

  ngOnInit() {
    this.setPermissions();
    this.addIndexToDataSource();
    this.createForm();
    this.createBlankForm();
    this.updateFamilyUnitsDropdown();
    this.pensCareService.loadLookupsCache();
    this.emitChangeSubscription = this.pensCareService.changeEmmited$.subscribe(change => {
      this.processChildMessage(change);
    })
    if(!this.isWizard) {
      this.activatedRoute.params.subscribe((params: any) => {
        this.defaultPolicyId = params.policyId ? params.policyId : 0;
      });
    }
  }

  setPermissions(): void {
    this.canEdit = userUtility.hasPermission('Edit Pension Case');
  }

  canAddPersonToList(person: Person): boolean {
    if (person.beneficiaryType == this.beneficiaryTypeEnum.GuardianRecipient) {
      return false;
    }

    if (!this.model.beneficiaries || !this.model.recipients) {
      return false;
    }

    switch (this.personType) {
      case 'recipient':
        return this.model.beneficiaries.find(beneficiary => beneficiary.idNumber === person.idNumber) !== undefined ? false : true;
      default:
        return this.model.recipients.find(recipient => recipient.idNumber === person.idNumber) !== undefined ? false : true;
    }
  }


  addInBeneficiaryRecipientList(person: Person) {
    if (this.personType == 'recipient') {
      this.addInBeneficiaryList(person)
    }
    else {
      this.addInRecipientList(person)
    }
  }

  addInBeneficiaryList(person: Person) {
    let beneficiaries = this.pensCareService.getBeneficiaries();
    beneficiaries.push(person);

    beneficiaries = beneficiaries.map((item, index) => {
      const newItem = item;
      newItem.index = index;
      return newItem;
    });

    const model = this.model;
    model.beneficiaries = beneficiaries;
    this.pensCareService.emitUpdateBeneficiaryModel(model);
    this.alertService.success('Recipient successfully added to beneficiary list');
  }

  addInRecipientList(person: Person) {
    let recipients = this.pensCareService.getRecipients();
    recipients.push(person);

    recipients = recipients.map((item, index) => {
      const newItem = item;
      newItem.index = index;
      return newItem;
    });
    const model = this.model;
    model.recipients = recipients;
    this.pensCareService.emitUpdateRecipientModel(model);
    this.alertService.success('Beneficiary successfully added to recipient list');
  }

  processChildMessage(message: string) {
    switch (message) {
      case 'lookupsCacheLoaded':
        // Not using settimeout produces ExpressionChanged Error
        setTimeout(() =>{
          this.lookupsCacheLoaded = true;
        }, 1);
        break;
      default:
        break;
    }
  }

  viewPerson(person: Person) {
    if (this.isWizard) {
      this.selectedPerson =  person;
      this.form = this.getBlankForm(true);
      this.isView = true;

      this.form.patchValue(person);
      this.setContactDetails(person);
      this.viewFormMode = true;
    }
    else {
      this.getRolePlayer(person)
    }
  }

  editPerson(person: Person) {
    this.selectedPerson =  person;
    this.form = this.getBlankForm();

    this.form.patchValue(person);
    this.updateFamilyUnitsDropdown();
    this.setContactDetails(person);
    this.viewFormMode = true;
  }

  confirmDelete(selectedPerson: Person) {
    const dialog = this.dialog.open(
      ConfirmDeleteDialogComponent, this.getDialogConfig()
    );
    dialog.afterClosed().subscribe((data) => {
      if (data.delete) {
        this.deletePerson(selectedPerson)
      }
    });
  }

  getRolePlayer(person: Person) {
    if (person.rolePlayerId && person.rolePlayerId > 0) {
      this.isLoading$.next(true)
      this._rolePlayerService.getRolePlayer(person.rolePlayerId).subscribe(result => {
        this.rolePlayer = result;
        this.isLoading$.next(false);
        this.viewFormMode = true;
      });
    }
    else {
      this.alertService.error('Invalid RolePlayer ID')
    }
  }

  openAuditDialog(selectedPerson: Person) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.Person,
        itemId: selectedPerson.rolePlayerId,
        heading: 'Recipients/Beneficiary Audit',
        propertiesToDisplay: ['FirstName', 'Surname', 'IdType', 'IdNumber', 'DateOfBirth', 'Nationality', 'CountryOriginId', 'Title', 'MarriageType', 'Gender',
          'MaritalStatus', 'Nationality', 'Country', 'Language', 'ProvinceId', 'PopulationGroup', 'MarriageDate', 'FamilyUnit']
      }
    });
  }

  setContactDetails(person: Person) {
    if (person.contact) {
      this.form.controls['communicationType'].setValue(PensCareUtilities.createPrefferedCommunicationType(person, person.contact.communicationType));
      this.form.controls['contactDesignationType'].setValue(ContactDesignationTypeEnum.PrimaryContact);
      this.form.controls['email'].setValue(person.contact.email);
      this.form.controls['mobileNumber'].setValue(person.contact.mobileNumber);
      this.form.controls['telephoneNumber'].setValue(person.contact.telephoneNumber);
      this.form.controls['workNumber'].setValue(person.contact.workNumber);
      this.form.controls['otherNumber'].setValue(person.contact.otherNumber);
    }
  }

  createForm() {
    this.formHeader = `${this.personType} personal detail`;
    if (this.form) {
      return;
    }

    this.form = this.getBlankForm();
  }

  updateFamilyUnitsDropdown() {
      const recipients = this.pensCareService.getRecipients();
      this.familyUnits = recipients?.map((item, index) => {
        let familyUnit = new Lookup();
        familyUnit.id = index;
        familyUnit.name = index.toString();
        return familyUnit
      })
  }

  addIndexToDataSource() {
    this.dataSource = this.dataSource.map((person, index) => {
      person.index = index;
      return person;
    });
  }

    save(form: UntypedFormGroup) {
        this.addIndexToDataSource();
        if (this.addPersonMode) {
            if (this.validateAddedPerson(form)) {
                this.dataSource.push(this.generatePersonFromForm(form));
            }
        } else {
        this.dataSource = this.dataSource.map(person => {
            if (person.index === form.controls['index'].value) {
                const updatedPerson = this.generatePersonFromForm(this.form);
                return updatedPerson;
            }

            return person;
            });
        }

        this.updateFamilyUnitsDropdown();
        this.updateDataSource(this.dataSource);
        this.enableTableMode();
    }

    validateAddedPerson (form: UntypedFormGroup): boolean {
        if (this.personType === 'beneficiary' && this.model.pensionCase.pdPercentage < 100 && form.controls['beneficiaryType'].value == BeneficiaryTypeEnum.Child) {
            this.alertService.error(`A child beneficiary is not allowed on a disability pension case with a PD percentage of 99% or lower`);
            return false;
        }

        // check if person with same Id number exists
        if (this.dataSource.filter(person => person.idNumber === form.controls['idNumber'].value).length !== 0) {
            this.alertService.error(`${this.personType} with id number ${form.controls['idNumber'].value} already exists`);
            return false;
        }

        return true;
    }

  generatePersonFromForm(form: UntypedFormGroup): Person {
    const person = new Person();
    person.title = form.controls['title'].value;
    person.familyUnit =  person.beneficiaryType === this.beneficiaryTypeEnum.Pensioner ? 0 : form.controls['familyUnit'].value;
    person.firstName = form.controls['firstName'].value;
    person.beneficiaryType = form.controls['beneficiaryType'].value;
    person.surname = form.controls['surname'].value;
    person.age = form.controls['age'].value
    person.dateOfBirth = form.controls['dateOfBirth'].value;
    person.individualIndicator = form.controls['individualIndicator'].value;
    person.gender = form.controls['gender'].value;
    person.provinceId = form.controls['provinceId'].value;
    person.populationGroup = form.controls['populationGroup'].value;
    person.marriageType = form.controls['marriageType'].value;
    person.maritalStatus = form.controls['maritalStatus'].value;
    person.language = form.controls['language'].value;
    person.marriageDate = form.controls['marriageDate'].value;
    person.countryOriginId = form.controls['countryOriginId'].value;
    person.idNumber = form.controls['idNumber'].value;
    person.taxReferenceNumber = form.controls['taxReferenceNumber'].value;
    person.otherIdNumber = form.controls['otherIdNumber'].value;
    person.col = form.controls['col'].value;
    person.occupation = form.controls['occupation'].value;
    person.beneficiaryTypes = form.controls['beneficiaryTypes'].value;
    person.titleLabel = form.controls['titleLabel'].value;
    person.idType = form.controls['idType'].value;
    person.index = form.controls['index'].value;
    person.workPermitNumber = form.controls['workPermitNumber'].value;
    person.CertificateOfLife = form.controls['CertificateOfLife'].value;
    person.dateOfDeath = form.controls['dateOfDeath'].value;
    if (this.personType === 'beneficiary') {
      person.isDisabled = form.controls['isDisabled'].value;
      person.recipientIdNumber = form.controls['recipientIdNumber'].value
    }

    person.contact = new Contact();
    person.contact.communicationType = form.controls['communicationType'].value;
    person.contact.contactDesignationType = ContactDesignationTypeEnum.PrimaryContact;
    person.contact.title = form.controls['title'].value;
    person.contact.email = form.controls['email'].value;
    person.contact.otherNumber = form.controls['otherNumber'].value;
    person.contact.mobileNumber = form.controls['mobileNumber'].value;
    person.contact.workNumber = form.controls['workNumber'].value;
    person.contact.telephoneNumber = form.controls['telephoneNumber'].value;

    return person;
  }

  getDialogConfig(): MatDialogConfig {
    const config = new MatDialogConfig();
    config.data = {
      type: this.personType
    };
    return config;
  }

  deletePerson(selectedPerson: Person) {
    const dataSource = this.dataSource.filter((person) =>
      person.index !== selectedPerson.index
    );

    this.updateDataSource(dataSource)
    this.enableTableMode();
  }

  updateDataSource(dataSource) {
    const model = this.model;

    this.dataSource = dataSource.map((item, index) => {
      const newItem = item;
      newItem.index = index;
      return newItem;
    });
    if (this.personType === 'recipient') {
      model.recipients = this.dataSource;
    } else {
      model.beneficiaries = this.dataSource;
    }
    this.updateModel.emit(model);

    const saveWizardRequest = this.context?.createSaveWizardRequest();
    saveWizardRequest['data'] = JSON.stringify([model])

    this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
  }

  onAddPersonButtonClick() {
    this.createBlankForm();
    this.updateFamilyUnitsDropdown();
    this.addPersonMode = true;
    this.showTable = false;
    this.viewFormMode = true;
  }

  enableTableMode() {
    this.viewFormMode = false;
    this.addPersonMode = false;
    this.showTable = true;
    this.form = undefined;
    this.isView = false;
  }

  getBlankForm(isViewForm?): UntypedFormGroup {
    const form = this.formBuilder.group({
      title: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [isSelectRequired]),
      firstName:new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      beneficiaryType: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [isSelectRequired]),
      surname: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      age: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      dateOfBirth: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      individualIndicator: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      gender: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [isSelectRequired]),
      provinceId: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      populationGroup: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      marriageType: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      maritalStatus: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [isSelectRequired]),
      language: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      marriageDate: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      countryOriginId: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      idNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required, ValidateIdNumber]),
      taxReferenceNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      otherIdNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      col: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      occupation: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      icd10Driver: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      drg: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      beneficiaryTypes: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      titleLabel: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      idType: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      index: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      workPermitNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      communicationType: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [isSelectRequired]),
      contactDesignationType: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      email: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required, ValidateEmail]),
      otherNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required]),
      mobileNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}, [Validators.required, ValidateMobileNumber]),
      workNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      telephoneNumber: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      CertificateOfLife: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      dateOfDeath: new UntypedFormControl({value: '', disabled: isViewForm ? true : false}),
      familyUnit: new UntypedFormControl({value: false, disabled: true}),
      colNewEndDate: new UntypedFormControl({value: false, disabled: true}),
      colDateReceived: new UntypedFormControl({value: false, disabled: true}),
      colDateSubmitted: new UntypedFormControl({value: false, disabled: true}),
      colDateVerified: new UntypedFormControl({value: false, disabled: true})
    });

    form.controls['contactDesignationType'].setValue(ContactDesignationTypeEnum.PrimaryContact);
    if (this.personType === 'beneficiary') {
      form.addControl('isDisabled', new UntypedFormControl({value: false, disabled: isViewForm ? true : false}));
      form.addControl('recipientIdNumber', new UntypedFormControl({value: false, disabled: isViewForm ? true : false}, [Validators.required]));
    }

    return form;
  }

  onCancelButtonClicked() {
    this.enableTableMode();
  }

  createBlankForm() {
    this.blankForm = this.getBlankForm();
  }

  onSaveButtonClicked(form: UntypedFormGroup) {
    this.save(form);
  }

  ngOnDestroy() {
    if (this.emitChangeSubscription) {
      this.emitChangeSubscription.unsubscribe();
    }

  }
}
