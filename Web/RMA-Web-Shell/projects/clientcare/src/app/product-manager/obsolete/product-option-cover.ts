import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ProductOptionCover extends BaseClass {
    coverMemberTypeId : number;
    name: string;
    minimumAge: number;
    maximumAge:number;
    premium: number;
    coverAmount: number;
    productOptionId: number;
}
