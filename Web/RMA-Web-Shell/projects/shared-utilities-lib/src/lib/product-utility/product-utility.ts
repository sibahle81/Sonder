import { Product } from "projects/clientcare/src/app/product-manager/models/product";
import { ProductClassEnum } from "projects/shared-models-lib/src/lib/enums/product-class-enum";
import { UnderwriterEnum } from "projects/shared-models-lib/src/lib/enums/underwriter-enum";

export class productUtility {
  static isCoid(product: Product): boolean {
    if (product) {
      return product.underwriterId == UnderwriterEnum.RMAMutualAssurance && product.productClassId == ProductClassEnum.Statutory;
    }
  }

  static isVaps(product: Product): boolean {
    if (product) {
      return product.underwriterId == UnderwriterEnum.RMALifeAssurance && (product.productClassId == ProductClassEnum.Assistance || product.productClassId == ProductClassEnum.NonStatutory);
    }
  }

  static isFuneral(product: Product): boolean {
    if (product) {
      return product.underwriterId == UnderwriterEnum.RMALifeAssurance && (product.productClassId == ProductClassEnum.Life);
    }
  }
}
