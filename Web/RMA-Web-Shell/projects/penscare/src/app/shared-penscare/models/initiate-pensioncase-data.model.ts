import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { Benefit, PensionCase, PensionClaim, VerifyCVCalculationResponse } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { PensCareNote } from './penscare-note';

export class InitiatePensionCaseData {
  pensionCase?: PensionCase;
  pensionClaims?: PensionClaim[]
  pensioner?: Person;
  recipients?: Person[];
  beneficiaries?: Person[];
  bankingDetails?: RolePlayerBankingDetail[];
  notes?: PensCareNote[];
  pensionLedger?: PensionLedger[];
  verifyCVCalculationResponse?: VerifyCVCalculationResponse;
  compensationDataSource?: Benefit[];
  sourceSystem?: SourceSystemEnum;
}





