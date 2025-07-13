import { EventTypeEnum } from '../enums/event-type-enum';

export class ICD10CodeEntity {
  EventType: EventTypeEnum;
  ICD10DiagnosticGroupId: number;
  ICD10CategoryId: number;
  ICD10SubCategoryId: number;
  ICD10CodeId: number;
  ICD10Code: string;
  ProductId: number;
}
