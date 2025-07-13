import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

export class ClaimRolePlayerBankingModel {
  rolePlayer: RolePlayer;
  rolePlayerBankingDetail: RolePlayerBankingDetail;
  isVerified: boolean;
}
