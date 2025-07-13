import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { MarriageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/marriage-type-num';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { takeUntil } from 'rxjs/operators';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Person } from 'projects/clientcare/src/app/policy-manager/shared/entities/person';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';

@Component({
  selector: 'person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent extends UnSubscribe implements OnChanges {
  viewPermission = 'View Person';
  viewAuditPermission = 'View Audits';

  // only one input is required
  @Input() rolePlayer: RolePlayer;

  // optional: set to force override the default behavior
  @Input() title = 'Details';
  @Input() isReadOnly = false;
  @Input() showDocuments = true;

  @Output() rolePlayerPersonContextEmit: EventEmitter<RolePlayer> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isCheckingPersonExists$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  documentSystemName = DocumentSystemNameEnum.RolePlayerDocuments;
  documentSet = DocumentSetEnum.CommonPersonalDocuments;
  documentTypeFilter = [];
  forceRequiredDocumentTypeFilter = [];
  requiredDocumentsUploaded = false;
  triggerReset: boolean;

  form: UntypedFormGroup;
  supportedIdTypes: IdTypeEnum[] = [IdTypeEnum.SA_ID_Document, IdTypeEnum.Passport_Document];
  genders: GenderEnum[];
  titles: TitleEnum[];
  marriageTypes: MarriageTypeEnum[];
  maritalStatuses: MaritalStatusEnum[];

  countries: Lookup[];
  filteredCountries: Lookup[] = [];
  nationalities: Lookup[];
  filteredNationalities: Lookup[] = [];

  isEdit: boolean;

  originalRolePlayer: RolePlayer;

  _new = MemberStatusEnum.New;
  idDocument = IdTypeEnum.SA_ID_Document;
  married = MaritalStatusEnum.Married;

  selectedMaritalStatus: MaritalStatusEnum;
  selectedIsAlive: boolean;

  constructor(
    private readonly lookupService: LookupService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly memberService: MemberService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alert: ToastrManager,
    public dialog: MatDialog,
  ) {
    super();
    this.getLookups();
  }

  getLookups() {
    this.genders = this.ToArray(GenderEnum);
    this.titles = this.ToArray(TitleEnum);
    this.marriageTypes = this.ToArray(MarriageTypeEnum);
    this.maritalStatuses = this.ToArray(MaritalStatusEnum);

    forkJoin(this.lookupService.getNationalities(),
      this.lookupService.getCountries()).pipe(takeUntil(this.unSubscribe$))
      .subscribe(data => {
        if (data) {
          this.nationalities = data[0];
          this.filteredNationalities = data[0];
          this.countries = data[1];
          this.filteredCountries = data[1];
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayer) {
      this.originalRolePlayer = JSON.parse(JSON.stringify(this.rolePlayer)) as RolePlayer;

      if (this.rolePlayer.memberStatus == MemberStatusEnum.New) {
        this.isReadOnly = false;
        this.rolePlayer.person = new Person();
      } else {
        this.isReadOnly = true;
      }

      this.createForm(this.isReadOnly);
      this.isLoading$.next(false);
    }
  }

  createForm(disabled: boolean) {
    this.form = this.formBuilder.group({
      firstName: [{ value: null, disabled: disabled }, Validators.required],
      surname: [{ value: null, disabled: disabled }, Validators.required],
      idType: [{ value: null, disabled: disabled }, Validators.required],
      idNumber: [{ value: null, disabled: disabled }, Validators.required],
      dateOfBirth: [{ value: null, disabled: disabled }, Validators.required],
      age: [{ value: null, disabled: true }],
      gender: [{ value: null, disabled: disabled }, Validators.required],
      nationality: [{ value: null, disabled: disabled }, Validators.required],
      countryOrigin: [{ value: null, disabled: disabled }, Validators.required],
      title: [{ value: null, disabled: disabled }, Validators.required],
      isAlive: [{ value: true, disabled: disabled }, Validators.required],
      maritalStatus: [{ value: null, disabled: disabled }, Validators.required],
      marriageType: [{ value: null, disabled: disabled }],
      marriageDate: [{ value: null, disabled: disabled }],
      deathCertificateNumber: [{ value: null, disabled: disabled }],
      dateOfDeath: [{ value: null, disabled: disabled }],
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      firstName: this.rolePlayer.person.firstName,
      surname: this.rolePlayer.person.surname,
      idType: this.rolePlayer.person.idType,
      idNumber: this.rolePlayer.person.idNumber,
      dateOfBirth: new Date(this.rolePlayer.person.dateOfBirth),
      age: this.rolePlayer.person.age,
      gender: this.rolePlayer.person.gender ? GenderEnum[this.rolePlayer.person.gender] : null,
      nationality: +this.rolePlayer.person.nationality,
      countryOrigin: this.rolePlayer.person.countryOriginId,
      title: this.rolePlayer.person.title ? TitleEnum[this.rolePlayer.person.title] : null,
      maritalStatus: this.rolePlayer.person.maritalStatus ? MaritalStatusEnum[this.rolePlayer.person.maritalStatus] : null,
      marriageType: this.rolePlayer.person.marriageType ? MarriageTypeEnum[this.rolePlayer.person.marriageType] : null,
      marriageDate: this.rolePlayer.person.marriageDate,
      isAlive: this.rolePlayer.person.isAlive,
      deathCertificateNumber: this.rolePlayer.person.deathCertificateNumber,
      dateOfDeath: this.rolePlayer.person.dateOfDeath
    });

    if (this.rolePlayer.person.idType) {
      this.idTypeChanged();
    }

    this.isAliveChanged(this.rolePlayer.person.isAlive);

    if (this.rolePlayer.person.dateOfBirth) {
      this.dateOfBirthChange(this.rolePlayer.person.dateOfBirth);
    }

    if (this.rolePlayer.person.maritalStatus) {
      this.maritalStatusChanged(MaritalStatusEnum[+this.rolePlayer.person.maritalStatus] as any as MaritalStatusEnum);
    }
  }

  readForm() {
    this.rolePlayer.person.title = +TitleEnum[this.form.controls.title.value];
    this.rolePlayer.person.firstName = this.form.controls.firstName.value;
    this.rolePlayer.person.surname = this.form.controls.surname.value;
    this.rolePlayer.person.idType = this.form.controls.idType.value;
    this.rolePlayer.person.idNumber = this.form.controls.idNumber.value;
    this.rolePlayer.person.dateOfBirth = new Date(this.form.controls.dateOfBirth.value);
    this.rolePlayer.person.gender = this.form.controls.gender.value ? +GenderEnum[this.form.controls.gender.value as string] : null;
    this.rolePlayer.person.nationality = this.form.controls.nationality.value;
    this.rolePlayer.person.countryOriginId = this.form.controls.countryOrigin.value;
    this.rolePlayer.person.maritalStatus = +MaritalStatusEnum[this.form.controls.maritalStatus.value];
    this.rolePlayer.person.marriageType = this.form.controls.marriageType.value ? +MarriageTypeEnum[this.form.controls.marriageType.value as string] : null;
    this.rolePlayer.person.marriageDate = this.form.controls.marriageDate.value ? new Date(this.form.controls.marriageDate.value) : null;
    this.rolePlayer.person.isAlive = this.form.controls.isAlive.value;
    this.rolePlayer.person.dateOfDeath = this.form.controls.dateOfDeath.value ? new Date(this.form.controls.dateOfDeath.value) : null;
    this.rolePlayer.person.deathCertificateNumber = this.form.controls.deathCertificateNumber.value;

    this.rolePlayer.displayName = this.form.controls.firstName.value + ' ' + this.form.controls.surname.value;
  }

  edit() {
    this.form.enable();
    this.form.controls.dateOfBirth.disable();
    this.form.controls.age.disable();
    this.form.controls.idNumber.disable();
    this.form.controls.idType.disable();

    this.isEdit = true;
  }

  save() {
    this.isLoading$.next(true);
    this.isEdit = false;

    this.form.disable();
    this.readForm();

    if (this.rolePlayer.memberStatus != MemberStatusEnum.New) {
      this.rolePlayerService.updateRolePlayer(this.rolePlayer).subscribe(result => {
        this.alert.successToastr('update successful');
        this.isLoading$.next(false);
      });
    } else {
      this.rolePlayer.memberStatus = MemberStatusEnum.ActiveWithoutPolicies;

      if (this.rolePlayer.toRolePlayers && this.rolePlayer.toRolePlayers.length > 0) {
        this.rolePlayer.toRolePlayers.forEach(relation => {
          if (!relation.toRolePlayerId || relation.toRolePlayerId <= 0) {
            relation.toRolePlayerId = this.rolePlayer.rolePlayerId;
          }
        });
      }

      this.rolePlayerService.addRolePlayer(this.rolePlayer).subscribe(result => {
        this.getRolePlayer(result);
      });
    }
  }

  getRolePlayer(rolePlayerId: number) {
    this.rolePlayerService.getRolePlayer(rolePlayerId).subscribe(result => {
      this.rolePlayer = result;
      this.rolePlayerPersonContextEmit.emit(this.rolePlayer);
      this.alert.successToastr('created successfully');
      this.isLoading$.next(false);
    });
  }

  cancel() {
    this.isEdit = false;
    this.rolePlayer = this.originalRolePlayer;
    this.setForm();
    this.form.disable();
    this.form.markAsPristine();
  }

  extractDoBFromZAIdNumber(idNumber: string): Date {
    if (!String.isNullOrEmpty(idNumber) && this.rolePlayer.person.idType == IdTypeEnum.SA_ID_Document && idNumber.length == 13) {
      const birthDate = idNumber.substring(0, 6);

      const d = birthDate;
      const yy = d.substr(0, 2);
      const mm = d.substr(2, 2);
      const dd = d.substr(4, 2);
      const yyyy = (+yy < 30) ? '20' + yy : '19' + yy;

      return new Date(yyyy + '-' + mm + '-' + dd);
    }
  }

  dateOfBirthChange($event: Date) {
    this.calculateAge($event);
  }

  calculateAge(dob: Date) {
    if (!dob) { return; }

    let toDate = Date.now();
    if (!this.rolePlayer.person.isAlive) {
      toDate = new Date(this.rolePlayer.person.dateOfDeath).getTime();
    }

    let timeDiff = Math.abs(toDate - new Date(dob).getTime());
    this.rolePlayer.person.age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);

    this.form.patchValue({
      age: this.rolePlayer.person.age
    });

    this.form.updateValueAndValidity();
  }

  checkPersonExists() {
    if (!this.form.controls.idNumber.value || this.form.controls.idNumber.value == '') { return; }
    this.isCheckingPersonExists$.next(true);
    this.rolePlayer.person.idType = +this.form.controls.idType.value;
    const identifyingNumber = this.rolePlayer.person.idType == +IdTypeEnum.SA_ID_Document ? (this.form.controls.idNumber.value.replace(/[^\w\s]/gi, '')).replace(/\s/g, '') : this.form.controls.idNumber.value;

    if (!String.isNullOrEmpty(identifyingNumber)) {
      this.rolePlayerService.getRolePlayerPersonByIdOrPassport(identifyingNumber).subscribe(result => {
        if (result) {
          this.openConfirmationDialog(result, identifyingNumber);
        } else {
          if (this.rolePlayer.person.idType == +IdTypeEnum.SA_ID_Document) {
            const extractedDateOfBirth = this.extractDoBFromZAIdNumber(identifyingNumber);
            if (extractedDateOfBirth) {
              this.rolePlayer.person.dateOfBirth = extractedDateOfBirth;
              this.dateOfBirthChange(extractedDateOfBirth);
              this.form.patchValue({
                dateOfBirth: extractedDateOfBirth
              });
            }
          }
          this.isCheckingPersonExists$.next(false);
        }
      });
    } else {
      this.isCheckingPersonExists$.next(false);
    }
  }

  openConfirmationDialog(rolePlayer: RolePlayer, identifyingNumber: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Existing Person Found`,
        text: `${rolePlayer.person.firstName} ${rolePlayer.person.surname} with Id / Passport number ${identifyingNumber} already exists. Do you want to proceed with the existing person?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rolePlayer = rolePlayer;
        if (!this.rolePlayer.person.dateOfBirth && this.rolePlayer.person.idType == IdTypeEnum.SA_ID_Document) {
          const extractedDateOfBirth = this.extractDoBFromZAIdNumber(identifyingNumber);
          if (extractedDateOfBirth) {
            this.rolePlayer.person.dateOfBirth = extractedDateOfBirth;
            this.dateOfBirthChange(extractedDateOfBirth);
          }
        }
        this.rolePlayerPersonContextEmit.emit(this.rolePlayer);
        this.setForm();
      } else {
        this.form.patchValue({
          idNumber: this.rolePlayer.person.idNumber
        });
      }
      this.isCheckingPersonExists$.next(false);
    });
  }

  idTypeChanged() {
    this.rolePlayer.person.idType = this.form.controls.idType.value;

    if (this.rolePlayer.person.idType == IdTypeEnum.SA_ID_Document) {
      this.form.controls.dateOfBirth.disable();
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required, Validators.minLength(3)]);

      const documentTypeIndex = this.documentTypeFilter.findIndex(s => s == DocumentTypeEnum.PassportDocument);
      if (documentTypeIndex > -1) {
        this.documentTypeFilter.splice(documentTypeIndex, 1);
      }

      const forceRequiredDocumentTypeIndex = this.forceRequiredDocumentTypeFilter.findIndex(s => s == DocumentTypeEnum.PassportDocument);
      if (forceRequiredDocumentTypeIndex > -1) {
        this.forceRequiredDocumentTypeFilter.splice(forceRequiredDocumentTypeIndex, 1);
      }

      this.documentTypeFilter.push(DocumentTypeEnum.EmployeeIDCopy);
      this.forceRequiredDocumentTypeFilter.push(DocumentTypeEnum.EmployeeIDCopy);
    } else {
      if (this.isEdit) {
        this.form.controls.dateOfBirth.enable();
      }
      this.form.get('idNumber').clearValidators();
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);

      const documentTypeIndex = this.documentTypeFilter.findIndex(s => s == DocumentTypeEnum.EmployeeIDCopy);
      if (documentTypeIndex > -1) {
        this.documentTypeFilter.splice(documentTypeIndex, 1);
      }

      const forceRequiredDocumentTypeIndex = this.forceRequiredDocumentTypeFilter.findIndex(s => s == DocumentTypeEnum.EmployeeIDCopy);
      if (forceRequiredDocumentTypeIndex > -1) {
        this.forceRequiredDocumentTypeFilter.splice(forceRequiredDocumentTypeIndex, 1);
      }

      this.documentTypeFilter.push(DocumentTypeEnum.PassportDocument);
      this.forceRequiredDocumentTypeFilter.push(DocumentTypeEnum.PassportDocument);
    }

    this.form.updateValueAndValidity();
    this.triggerReset = !this.triggerReset;
  }

  maritalStatusChanged(value: MaritalStatusEnum) {
    this.selectedMaritalStatus = +MaritalStatusEnum[value];
    if (this.selectedMaritalStatus != MaritalStatusEnum.Married) {
      this.clearValidationToFormControl(this.form, 'marriageType');
      this.clearValidationToFormControl(this.form, 'marriageDate');

      this.form.controls.marriageType.reset();
      this.form.controls.marriageDate.reset();

      const documentTypeIndex = this.documentTypeFilter.findIndex(s => s == DocumentTypeEnum.MarriageCertificate);
      if (documentTypeIndex > -1) {
        this.documentTypeFilter.splice(documentTypeIndex, 1);
      }

      const forceRequiredDocumentTypeIndex = this.forceRequiredDocumentTypeFilter.findIndex(s => s == DocumentTypeEnum.MarriageCertificate);
      if (forceRequiredDocumentTypeIndex > -1) {
        this.forceRequiredDocumentTypeFilter.splice(forceRequiredDocumentTypeIndex, 1);
      }
    } else {
      this.applyValidationToFormControl(this.form, [Validators.required], 'marriageType');
      this.applyValidationToFormControl(this.form, [Validators.required], 'marriageDate');

      this.documentTypeFilter.push(DocumentTypeEnum.MarriageCertificate);
      this.forceRequiredDocumentTypeFilter.push(DocumentTypeEnum.MarriageCertificate);
    }

    this.triggerReset = !this.triggerReset;
  }

  getIdType(idType: IdTypeEnum) {
    return this.formatText(IdTypeEnum[idType]);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  onCountryKey(value) {
    this.filteredCountries = this.dropDownSearch(value, 'country');
  }

  onNationalityKey(value) {
    this.filteredNationalities = this.dropDownSearch(value, 'nationality');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();

    switch (name) {
      case 'country':
        return this.setData(filter, this.filteredCountries, this.countries);
      case 'nationality':
        return this.setData(filter, this.filteredNationalities, this.nationalities);
      default: break;
    }
  }

  setData(filter: string, filteredList: Lookup[], originalList: Lookup[]) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(option => option.name.toLocaleLowerCase().includes(filter));
    }
  }

  isAliveChanged($event: boolean) {
    this.selectedIsAlive = $event;
    if ($event) {
      this.clearValidationToFormControl(this.form, 'deathCertificateNumber');
      this.clearValidationToFormControl(this.form, 'dateOfDeath');

      this.form.controls.deathCertificateNumber.reset();
      this.form.controls.dateOfDeath.reset();

      const documentTypeIndex = this.documentTypeFilter.findIndex(s => s == DocumentTypeEnum.DeathCertificate);
      if (documentTypeIndex > -1) {
        this.documentTypeFilter.splice(documentTypeIndex, 1);
      }

      const forceRequiredDocumentTypeIndex = this.forceRequiredDocumentTypeFilter.findIndex(s => s == DocumentTypeEnum.DeathCertificate);
      if (forceRequiredDocumentTypeIndex > -1) {
        this.forceRequiredDocumentTypeFilter.splice(forceRequiredDocumentTypeIndex, 1);
      }
    } else {
      this.applyValidationToFormControl(this.form, [Validators.required], 'deathCertificateNumber');
      this.applyValidationToFormControl(this.form, [Validators.required], 'dateOfDeath');

      this.documentTypeFilter.push(DocumentTypeEnum.DeathCertificate);
      this.forceRequiredDocumentTypeFilter.push(DocumentTypeEnum.DeathCertificate);
    }

    this.triggerReset = !this.triggerReset;
  }

  setRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }
}
