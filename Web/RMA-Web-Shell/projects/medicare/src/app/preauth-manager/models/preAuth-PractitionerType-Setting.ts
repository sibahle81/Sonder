import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class PreAuthPractitionerTypeSetting extends BaseClass
{
    PreAuthPractitionerTypeSettingId: number;
    PreAuthType: number;
    practitionerTypeId: number;
    isHospital: boolean; 
    isTreatingDoctor: boolean;
}