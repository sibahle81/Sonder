import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ProsthetistType extends BaseClass {
  prosthetistTypeId: number;
  prosthetistTypeName: string;
  description: string;
  requireSpecification: boolean;
}