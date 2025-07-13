import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { ProductOption } from './product-option';
import { ProductCategoryTypeEnum } from '../../policy-manager/shared/enums/product-category-type.enum';

export class Product {
  id: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDeleted: boolean;

  underwriterId: number;
  productClassId: number;
  code: string;
  name: string;
  description: string;
  productStatus: number;
  productStatusText: string;

  startDate: Date;
  endDate: Date;

  productOptions: ProductOption[];
  ruleItems: RuleItem[];
  productNotes: Note[];

  productCategoryType: ProductCategoryTypeEnum;
}
