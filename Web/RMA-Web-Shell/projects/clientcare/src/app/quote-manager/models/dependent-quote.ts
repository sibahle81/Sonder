import { ProductOption } from '../../product-manager/models/product-option';
import { Quote } from './quote';

export class DependentQuote {
  policyId: number;
  policyNumber: string;
  productOption: ProductOption;
  quote: Quote;
}
