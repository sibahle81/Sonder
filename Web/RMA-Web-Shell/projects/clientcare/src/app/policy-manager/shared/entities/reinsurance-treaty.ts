export class ReinsuranceTreaty {
  treatyId: number;
  reinsurerId: number;
  treatyNumber: string;
  treatyName: string;
  treatyTypeId: number;
  startDate: Date;
  endDate: Date | null;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

