import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Claim } from './funeral/claim.model';

export class AssessorClaims {
  users: User[];
  claims: Claim[];
}
