import { Policy } from "projects/clientcare/src/app/policy-manager/shared/entities/policy";
import { ProductClassEnum } from "projects/shared-models-lib/src/lib/enums/product-class-enum";
import { UnderwriterEnum } from "projects/shared-models-lib/src/lib/enums/underwriter-enum";

export class policyUtility {
  static isCoid(policy: Policy): boolean {
    if (policy && policy.productOption && policy.productOption.product) {
      return policy.productOption.product.underwriterId == UnderwriterEnum.RMAMutualAssurance && policy.productOption.product.productClassId == ProductClassEnum.Statutory;
    }
  }

  static isVaps(policy: Policy): boolean {
    if (policy && policy.productOption && policy.productOption.product) {
      return policy.productOption.product.underwriterId == UnderwriterEnum.RMALifeAssurance && policy.productOption.product.productClassId == ProductClassEnum.Assistance || policy.productOption.product.productClassId == ProductClassEnum.NonStatutory;
    }
  }

  static isFuneral(policy: Policy): boolean {
    if (policy && policy.productOption && policy.productOption.product) {
      if (policy.productOption.product.underwriterId == UnderwriterEnum.RMALifeAssurance) {
        return policy.productOption.product.productClassId == ProductClassEnum.Life
            || policy.productOption.product.productClassId == ProductClassEnum.ValuePlus;
      }
      return false;
    }
  }

  static isGroupRisk(policy: Policy): boolean {
    if (policy && policy.productOption && policy.productOption.product) {
      if (policy.productOption.product.underwriterId == UnderwriterEnum.RMALifeAssurance) {
        return policy.productOption.product.productClassId == ProductClassEnum.GroupRisk            
      }
      return false;
    }
  }
}
