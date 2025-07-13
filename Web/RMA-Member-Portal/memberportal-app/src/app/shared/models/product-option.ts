import { CoverTypeEnum } from "../enums/cover-type.enum";
import { PaymentFrequencyEnum } from "../enums/payment-frequency.enum";
import { Benefit } from "./benefit";
import { Note } from "./note.model";
import { Product } from "./product";
import { ProductOptionPaymentFrequency } from "./product-option-payment-frequency";
import { RuleItem } from "./ruleItem";

export class ProductOption {

  id: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  productId: number;
  name: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date;
  product: Product;
  maxAdminFeePercentage: number;
  maxCommissionFeePercentage: number;
  maxBinderFeePercentage: number;
  productTypeId: number;
  coverOptionTypeId: number;
  isTaxabled: boolean;

  productOptionNotes: Note[];
  productOptionPaymentFrequencies: ProductOptionPaymentFrequency[];
  benefitsIds: number[];
  ruleItems: RuleItem[];
  coverTypeIds: CoverTypeEnum[];
  paymentFrequencyIds: PaymentFrequencyEnum[];

  benefits: Benefit[];


  statusText: string;
  selected: boolean;
  benefitRateLatest: number;
  productclassid: number;
}
