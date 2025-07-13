import { Brokerage } from './brokerage';
import { Product } from '../../product-manager/models/product';
import { ProductOption } from '../../product-manager/models/product-option';

export class BrokerageProductOption {
  id: number;
  brokerageId: number;
  productOptionId: number;
  startDate: Date;
  endDate: Date;
  productOption: ProductOption;

  constructor(id: number, brokerageId: number, productOptionId: number, startDate: Date, endDate: Date, productOption: ProductOption) {
    this.id = id;
    this.brokerageId = brokerageId;
    this.productOptionId = productOptionId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.productOption = productOption;
  }
}
