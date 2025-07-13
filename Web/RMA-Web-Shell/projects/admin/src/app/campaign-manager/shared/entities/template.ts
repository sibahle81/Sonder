import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Template extends BaseClass {
    name: string;
    campaignTemplateType: number;
    templateTypeId: number;
    templateType: string;
    template: string;
    dateViewed: Date;
}
