import { UntypedFormGroup } from '@angular/forms';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';

export class PersonalDetailsComponentModel {
  form: UntypedFormGroup;
  formHeader: string;
  showActionButtons: boolean;
  familyUnits?: Lookup[];
  isPensioner?: boolean;
  model?: InitiatePensionCaseData;
  pensCareContext?: PensionCaseContextEnum;
  lookups?: {
    genders : Lookup[],
    communicationTypes : Lookup[],
    languages : Lookup[],
    provinces : Lookup[],
    maritalStatus : Lookup[],
    countries : Lookup[],
    titles : Lookup[],
    idTypes : Lookup[],
  };
  personType: string;
}
