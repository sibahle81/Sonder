import { BeneficiaryFromRecipient } from 'projects/shared-components-lib/src/lib/models/beneficiary.model';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';

export class BeneficiaryUtil {
  getBeneficiariesFromRecipients(recipients: Person[], beneficiaries: Person[]) {
    const beneficiariesFromRecipients: BeneficiaryFromRecipient[] = [];
    beneficiaries.forEach(beneficiary => {
      recipients.forEach(recipient => {
        if (recipient.familyUnit === beneficiary.familyUnit) {
          const beneficiaryFromRecipient = new BeneficiaryFromRecipient();
          beneficiaryFromRecipient.beneficiaryIdNumber = beneficiary.idNumber;
          beneficiaryFromRecipient.beneficiaryFirstName = beneficiary.firstName;
          beneficiaryFromRecipient.beneficiarySurname = beneficiary.surname;
          beneficiaryFromRecipient.recipientFirstName = recipient.firstName;
          beneficiaryFromRecipient.recipientSurname = recipient.surname;
          beneficiaryFromRecipient.dateOfBirth = beneficiary.dateOfBirth;
          beneficiaryFromRecipient.beneficiaryType = beneficiary.beneficiaryType;
          beneficiaryFromRecipient.beneficiaryIdNumber = beneficiary.idNumber;


          beneficiariesFromRecipients.push(beneficiaryFromRecipient);
        }
      })
    });
    return beneficiariesFromRecipients;
  }

  getNumberOfChildren(beneficiaries: Person[]) {
    return beneficiaries.filter(beneficiary => beneficiary.beneficiaryType === BeneficiaryTypeEnum.Child).length;
  }

  getNumberOfSpouses(beneficiaries: Person[]) {
    return beneficiaries.filter(beneficiary => beneficiary.beneficiaryType === BeneficiaryTypeEnum.Spouse).length;
  }
}

