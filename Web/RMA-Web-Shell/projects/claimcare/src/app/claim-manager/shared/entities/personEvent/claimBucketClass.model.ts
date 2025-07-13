import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { InjurySeverityTypeEnum } from './../../enums/injury-severity-type-enum';
import { PersonEventModel } from './personEvent.model';

export class ClaimBucketClassModel {
    claimBucketClassId: number;
    name: string;
    description: string;
    injurySeverityType: InjurySeverityTypeEnum;
    personEvents: PersonEventModel[];
    productClass: ProductClassEnum;
}
