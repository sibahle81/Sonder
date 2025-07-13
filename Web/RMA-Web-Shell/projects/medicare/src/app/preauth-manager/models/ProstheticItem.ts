import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ProstheticItem extends BaseClass {
  prostheticItemId: number;
  regionGroupId: number | null;
  prostheticItemCategoryId: number | null;
  itemCode: string;
  noOfUnits: number | null;
  replacementPeriodFromMnths: number | null;
  replacementPeriodToMnths: number | null;
  notes: string;
  isSupplierGurantee: number | null;
  supGuranteePeriodMnths: number | null;
  narration: string;
}