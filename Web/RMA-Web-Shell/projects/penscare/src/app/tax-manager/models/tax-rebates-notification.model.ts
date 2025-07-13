import { PensCareNote } from "../../shared-penscare/models/penscare-note";
import { TaxRebate } from "./tax-rebate.model";

export class TaxRebatesNotification extends TaxRebate {
  public action: string;
  public primaryMinimumTax: number;
  public secondaryMinimumTax: number;
  public tertiaryMinimumTax: number;
  public notes: PensCareNote[];
}
