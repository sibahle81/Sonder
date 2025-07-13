import { User } from 'projects/shared-models-lib/src/lib/security/user';

export class CollectionAgent {
  agent: User;
  accountIds: number[];
  clientTypeId: number;
  ageTypeId: number;
  debtorStatus: number;
  assignedStatus: number;
  balanceTypeId: number;
  endDate: string;
}
