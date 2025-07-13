import { Contact } from './contact.model';
export class Person {
  rolePlayerId?: number;
  firstName: string;
  surname: string;
  idType?: number;
  idNumber: string;
  passportNumber?: any;
  dateOfBirth: Date;
  isAlive?: boolean;
  isStudying?: boolean;
  isDisabled?: boolean;
  isBeneficiary?: boolean;
  isRecipient?: boolean;
  deathCertificateNumber?: any;
  isVopdVerified?: boolean;
  gender: number;
  maritalStatus?: number;
  nationality?: number;
  countryOriginId?: number;
  title?: number;
  age: number;
  familyUnit: number;
  beneficiaryType?: number;
  individualIndicator?: string;
  provinceId?: string;
  populationGroup?:any
  marriageType?:any
  language?:any
  marriageDate?:any
  titleLabel?:any
  beneficiaryTypes?:any
  occupation?:any
  col?:any
  otherIdNumber?:any
  taxReferenceNumber?:any
  index?: number
  workPermitNumber?: string
  contact?: Contact;
  dateVopdVerified?: Date;
  CertificateOfLife?: Date;
  dateOfDeath?: Date;
  recipientIdNumber?: string;
  member?: string;
  colNewEndDate?: Date;
  colDateReceived?: Date;
  colDateSubmitted?: Date;
  colDateVerified?: Date;
}
