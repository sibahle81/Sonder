import { PensCareNote } from "../../shared-penscare/models/penscare-note";
import { TaxRate } from "./tax-rate.model";

export class TaxRatesNotification {
  public taxYear: number;
  public action: string;
  public taxRates: TaxRate[];
  public notes: PensCareNote[];
}
