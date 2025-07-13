import { ValidityCheckType } from '../enums/validity-check-type.enum';

export class ValidityChecksetRequest {
    checkType: ValidityCheckType;
    modelChecksetIds: number[];
    selectedChecksetIds: number[];
    isReadonly = true;
}
