import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { RolePlayer } from "projects/clientcare/src/app/policy-manager/shared/entities/roleplayer";
import { IdTypeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum";
import { Person } from "projects/shared-components-lib/src/lib/models/person.model";
import { BeneficiaryTypeEnum } from "projects/shared-models-lib/src/lib/enums/beneficiary-type-enum";
import { CommunicationTypeEnum } from "projects/shared-models-lib/src/lib/enums/communication-type-enum";
import { ContactDesignationTypeEnum } from "projects/shared-models-lib/src/lib/enums/contact-designation-type-enum";
import { GenderEnum } from "projects/shared-models-lib/src/lib/enums/gender-enum";
import { NationalityEnum } from "projects/shared-models-lib/src/lib/enums/nationality-enum";
import { PersonTypeEnum } from "projects/shared-models-lib/src/lib/enums/person-type-enum";
import { TitleEnum } from "projects/shared-models-lib/src/lib/enums/title-enum";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { ValidateEmail } from "projects/shared-utilities-lib/src/lib/validators/email.validator";
import { ValidateIdNumber } from "projects/shared-utilities-lib/src/lib/validators/id-number.validator";
import { ValidateMobileNumber } from "projects/shared-utilities-lib/src/lib/validators/mobile-number.validator";
import { PenscareLookups } from "../models/penscare-lookups";
import {LanguageEnum} from '../../../../../clientcare/src/app/policy-manager/shared/enums/language-enum';

export class PensCareUtilities {
  static createPersonDetailsForm(formBuilder: UntypedFormBuilder, rolePlayer: RolePlayer, personType: PersonTypeEnum) {
    const form = formBuilder.group({
      title: new UntypedFormControl({value: rolePlayer.person.title, disabled : true}),
      firstName: new UntypedFormControl({value: rolePlayer.person.firstName, disabled : true}),
      beneficiaryType: new UntypedFormControl({value: BeneficiaryTypeEnum.Child, disabled: true}),
      surname: new UntypedFormControl({value: rolePlayer.person.surname, disabled: true}),
      age: new UntypedFormControl({value: rolePlayer.person.age, disabled: true}),
      dateOfBirth: new UntypedFormControl({value: rolePlayer.person.dateOfBirth, disabled: true}),
      individualIndicator: new UntypedFormControl({value: '', disabled: true}),
      gender: new UntypedFormControl({value: rolePlayer.person.gender, disabled: true}),
      provinceId: new UntypedFormControl({value: '', disabled: true}),
      populationGroup: new UntypedFormControl({value: '', disabled: true}),
      marriageType: new UntypedFormControl({value: '', disabled: true}),
      maritalStatus: new UntypedFormControl({value: '', disabled: true}),
      language: new UntypedFormControl({value: rolePlayer.person.language, disabled: true}),
      marriageDate: new UntypedFormControl({value: '', disabled: true}),
      countryOriginId: new UntypedFormControl({value: rolePlayer.person.countryOriginId, disabled: true}),
      idNumber: new UntypedFormControl({
        value: rolePlayer.person.nationality === NationalityEnum.SouthAfrican || rolePlayer.person.nationality === null?
        rolePlayer.person.idNumber :
        rolePlayer.person.passportNumber,
        disabled: true
      }, [Validators.required, ValidateIdNumber]),
      taxReferenceNumber: new UntypedFormControl({value: '', disabled: true}),
      otherIdNumber: new UntypedFormControl({value: '', disabled: true}),
      col: new UntypedFormControl({value: '', disabled: true}),
      occupation: new UntypedFormControl({value: '', disabled: true}),
      icd10Driver: new UntypedFormControl({value: '', disabled: true}),
      drg: new UntypedFormControl({value: '', disabled: true}),
      beneficiaryTypes: new UntypedFormControl({value: '', disabled: true}),
      titleLabel: new UntypedFormControl({value: '', disabled: true}),
      idType: new UntypedFormControl({value: rolePlayer.person.idType, disabled: true}),
      index: new UntypedFormControl({value: '', disabled: true}),
      workPermitNumber: new UntypedFormControl({value: '', disabled: true}),
      communicationType: new UntypedFormControl({value: '', disabled: true}),
      contactDesignationType: new UntypedFormControl({value: '', disabled: true}),
      email: new UntypedFormControl({value: '', disabled: true}, [Validators.required, ValidateEmail]),
      otherNumber: new UntypedFormControl({value: '', disabled: true}),
      mobileNumber: new UntypedFormControl({value: '', disabled: true}, [Validators.required, ValidateMobileNumber]),
      workNumber: new UntypedFormControl({value: '', disabled: true}),
      telephoneNumber: new UntypedFormControl({value: '', disabled: true}),
      CertificateOfLife: new UntypedFormControl({value: '', disabled: true}),
      dateOfDeath: new UntypedFormControl({value: '', disabled: true}),
      familyUnit: new UntypedFormControl({value: false, disabled: true}),
      colNewEndDate: new UntypedFormControl({value: false, disabled: true}),
      colDateReceived: new UntypedFormControl({value: false, disabled: true}),
      colDateSubmitted: new UntypedFormControl({value: false, disabled: true}),
      colDateVerified: new UntypedFormControl({value: false, disabled: true})
    });

    form.controls['contactDesignationType'].setValue(ContactDesignationTypeEnum.PrimaryContact);
    if (personType === PersonTypeEnum.Beneficiary) {
      form.addControl('isDisabled', new UntypedFormControl({value: false, disabled: true}));
    }
    return form;

  }

  static createPrefferedCommunicationType(person: Person, communicationType: CommunicationTypeEnum): CommunicationTypeEnum{
    if (communicationType) return communicationType;
    if (person.contact.email) {
      return CommunicationTypeEnum.Email;
    }

    if (person.contact.mobileNumber) {
      return CommunicationTypeEnum.SMS;
    } else {
      return CommunicationTypeEnum.Phone;
    }
  }

  static createPersonFromPersonModel(formBuilder: UntypedFormBuilder, person: Person): UntypedFormGroup{

    const form = formBuilder.group({
      title: new UntypedFormControl({value: person.title, disabled : true}),
      firstName: new UntypedFormControl({value: person.firstName, disabled : true}),
      beneficiaryType: new UntypedFormControl({value: BeneficiaryTypeEnum.Child, disabled: true}),
      surname: new UntypedFormControl({value: person.surname, disabled: true}),
      age: new UntypedFormControl({value: person.age, disabled: true}),
      dateOfBirth: new UntypedFormControl({value: person.dateOfBirth, disabled: true}),
      individualIndicator: new UntypedFormControl({value: person.individualIndicator, disabled: true}),
      gender: new UntypedFormControl({value: person.gender, disabled: true}),
      provinceId: new UntypedFormControl({value: person.provinceId, disabled: true}),
      populationGroup: new UntypedFormControl({value: person.populationGroup, disabled: true}),
      marriageType: new UntypedFormControl({value: person.maritalStatus, disabled: true}),
      maritalStatus: new UntypedFormControl({value: person.maritalStatus, disabled: true}),
      language: new UntypedFormControl({value: person.language, disabled: true}),
      marriageDate: new UntypedFormControl({value: person.marriageDate, disabled: true}),
      countryOriginId: new UntypedFormControl({value: person.countryOriginId, disabled: true}),
      idNumber: new UntypedFormControl({ value: person.idNumber, disabled: true }, [Validators.required, ValidateIdNumber]),
      taxReferenceNumber: new UntypedFormControl({value: person.taxReferenceNumber, disabled: true}),
      otherIdNumber: new UntypedFormControl({value: person.otherIdNumber, disabled: true}),
      col: new UntypedFormControl({value: person.col, disabled: true}),
      occupation: new UntypedFormControl({value: person.occupation, disabled: true}),
      icd10Driver: new UntypedFormControl({value: '', disabled: true}),
      drg: new UntypedFormControl({value: '', disabled: true}),
      beneficiaryTypes: new UntypedFormControl({value: '', disabled: true}),
      titleLabel: new UntypedFormControl({value: '', disabled: true}),
      idType: new UntypedFormControl({value: person.idType, disabled: true}),
      index: new UntypedFormControl({value: '', disabled: true}),
      workPermitNumber: new UntypedFormControl({value: '', disabled: true}),
      communicationType: new UntypedFormControl({value: person.contact?.communicationType, disabled: true}),
      contactDesignationType: new UntypedFormControl({value: person.contact?.contactDesignationType, disabled: true}),
      email: new UntypedFormControl({value: person.contact?.email, disabled: true}, [Validators.required, ValidateEmail]),
      otherNumber: new UntypedFormControl({value: person.contact?.otherNumber, disabled: true}),
      mobileNumber: new UntypedFormControl({value: person.contact?.mobileNumber, disabled: true}, [Validators.required, ValidateMobileNumber]),
      workNumber: new UntypedFormControl({value: person.contact?.workNumber, disabled: true}),
      telephoneNumber: new UntypedFormControl({value: person.contact?.telephoneNumber, disabled: true}),
      CertificateOfLife: new UntypedFormControl({value: '', disabled: true}),
      dateOfDeath: new UntypedFormControl({value: person.dateOfDeath, disabled: true}),
      familyUnit: new UntypedFormControl({value: person.familyUnit, disabled: true}),
      colNewEndDate: new UntypedFormControl({value: person.colNewEndDate, disabled: true}),
      colDateReceived: new UntypedFormControl({value: person.colDateReceived, disabled: true}),
      colDateSubmitted: new UntypedFormControl({value: person.colDateSubmitted, disabled: true}),
      colDateVerified: new UntypedFormControl({value: person.colDateVerified, disabled: true})
    });

    return form;
  }

  static generateLookups(rolePlayer: RolePlayer): PenscareLookups {
    const lookups: PenscareLookups = {};
    lookups.maritalStatus = [],
    lookups.idTypes = [new Lookup(
      rolePlayer.person.idType,
      IdTypeEnum[rolePlayer.person?.idType]
    )];
    lookups.genders = [new Lookup(
      rolePlayer.person.gender,
      GenderEnum[rolePlayer.person?.gender]
    )];
    lookups.titles = [new Lookup(
      rolePlayer.person.title,
      TitleEnum[rolePlayer.person?.idType]
    )];
    lookups.communicationTypes = [new Lookup(
      rolePlayer.preferredCommunicationTypeId,
      CommunicationTypeEnum[rolePlayer.preferredCommunicationTypeId]
    )];
    lookups.beneficiaryTypes = [new Lookup(
      BeneficiaryTypeEnum.Child,
      BeneficiaryTypeEnum[BeneficiaryTypeEnum.Child]
    )];
    lookups.languages = [new Lookup(
      rolePlayer.person.language,
      LanguageEnum[rolePlayer.person.language]
    )];
    return lookups;
  }

  static generateLookupsFromPersonModel(person: Person): PenscareLookups {
    const lookups: PenscareLookups = {};
    lookups.maritalStatus = [],
    lookups.idTypes = [new Lookup(
      person.idType,
      IdTypeEnum[person.idType]
    )];
    lookups.genders = [new Lookup(
      person.gender,
      GenderEnum[person.gender]
    )];
    lookups.titles = [new Lookup(
      person.title,
      TitleEnum[person.title]
    )];
    lookups.communicationTypes = [new Lookup(
      person.contact?.communicationType,
      CommunicationTypeEnum[person.contact?.communicationType]
    )];
    lookups.beneficiaryTypes = [new Lookup(
      BeneficiaryTypeEnum.Child,
      BeneficiaryTypeEnum[BeneficiaryTypeEnum.Child]
    )];
    lookups.languages = [new Lookup(
      person.language,
      LanguageEnum[person.language]
    )];
    return lookups;
  }

}
