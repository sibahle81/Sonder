import { ComplianceResult } from "projects/clientcare/src/app/policy-manager/shared/entities/compliance-result";

export class TermArrangementProductOption{
    productOptionId:number;
    contractAmount:number;
    productOptionName: string;
    finPayenumber: string;
    roleplayerId: number;
    policyId:  number;
    complianceResult: ComplianceResult;

    static copy(termArrangementProductOption: TermArrangementProductOption) :TermArrangementProductOption
    {
       let options =  new TermArrangementProductOption();
       options.productOptionId = termArrangementProductOption.productOptionId;
       options.contractAmount = termArrangementProductOption.contractAmount;
       options.finPayenumber = termArrangementProductOption.finPayenumber;
       options.roleplayerId = termArrangementProductOption.roleplayerId;
       return options;
    }
}
