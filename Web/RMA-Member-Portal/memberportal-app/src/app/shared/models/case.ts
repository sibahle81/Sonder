import { BaseClass } from 'src/app/core/models/base-class.model';
import { Brokerage } from './brokerage';
import { Representative } from './representative';
import { RolePlayer } from './roleplayer';

export class Case extends BaseClass {
  code: string;
  caseTypeId: number;
  brokerageId: number;
  representativeId: number;
  productId: number;
  idNumber: string;
  clientReference: string;
  mainMember: RolePlayer;
  spouse: RolePlayer[];
  children: RolePlayer[];
  extendedFamily: RolePlayer[];
  beneficiaries: RolePlayer[];
  company: RolePlayer;
  juristicRepresentativeId: number;
  policyId: number;
  representative: Representative;
  brokerage: Brokerage;
  juristicRepresentative: Representative;
}
