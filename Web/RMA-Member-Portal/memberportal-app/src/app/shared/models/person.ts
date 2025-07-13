export class Person {
  rolePlayerId: number;
  firstName: string;
  surname: string;
  idType: number;
  idNumber: string;
  passportNumber: string;
  dateOfBirth: Date;
  isAlive: boolean;
  isStudying: boolean;
  isDisabled: boolean;
  isBeneficiary: boolean;
  dateOfDeath: Date;
  deathCertificateNumber: string;
  isVopdVerified: boolean;
  dateVopdVerified: Date;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  age: number;
  manualBeneficiary = true;
}
