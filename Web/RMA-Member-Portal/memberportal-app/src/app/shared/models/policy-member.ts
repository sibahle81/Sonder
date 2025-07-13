import { PolicyInsuredLife } from './policy-insured-life';

export class PolicyMember extends PolicyInsuredLife {
  memberName: string;
  idType: string;
  idNumber: string;
  rolePlayerType: string;
  memberStatus: string;
  dateOfBirth: Date;
  age: number;
  dateOfDeath: Date;
  isBeneficiary: boolean;
}
