import { TemplateContextTypeEnum } from 'projects/shared-models-lib/src/lib/enums/template-context-type-Enum';

export class Template {
  templateId: number;
  name: string;
  description: string;
  templateContextType: TemplateContextTypeEnum;
  templateHtml: string;
  reportTemplateUrl: string;
}
