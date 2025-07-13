import { TemplateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/template-type-enum';

export class ProductOptionTemplateType {
  productOptionTemplateTypeId: number;
  productOptionId: number;
  templateType: TemplateTypeEnum;
  templateId: number;
}
