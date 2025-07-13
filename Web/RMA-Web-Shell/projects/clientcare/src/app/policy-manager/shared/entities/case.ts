import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { RolePlayer } from './roleplayer';
import { Representative } from '../../../broker-manager/models/representative';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { PolicyLifeExtension } from './policy-life-extension.model';

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
  newMainMember: RolePlayer;
}
