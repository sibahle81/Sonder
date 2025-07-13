import { Note } from "./note.model";
import { RuleItem } from "./ruleItem";


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

  ruleItems: RuleItem[];
  productNotes: Note[];

}
