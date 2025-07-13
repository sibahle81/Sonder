import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';

export class ClaimInvestigationModel {
  rolePlayer: RolePlayer;
  claimId: number;
  documentSetEnum: DocumentSetEnum;
  personEventId: number;
  fraudulentCase: boolean;
  claimDocumentSet: DocumentSetEnum;
}
