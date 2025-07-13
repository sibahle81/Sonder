import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';

export class LinkedUserMember {
  rolePlayerId: number;
  memberName: string;
  finPayeNumber: string;
  userCompanyMapStatus: UserCompanyMapStatusEnum;
  roleId: number;
}
