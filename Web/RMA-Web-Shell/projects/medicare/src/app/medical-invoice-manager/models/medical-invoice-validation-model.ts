import { RuleRequestResult } from "projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result";
import { InvoiceLineUnderAssessReason } from "projects/medicare/src/app/medical-invoice-manager/models/invoice-line-under-assess-reason";
import { InvoiceUnderAssessReason } from "projects/medicare/src/app/medical-invoice-manager/models/invoice-under-assess-reason";

export class MedicalInvoiceValidationModel {
    ruleRequestResult: RuleRequestResult;
    underAssessReasons: InvoiceUnderAssessReason[];
    lineUnderAssessReasons: InvoiceLineUnderAssessReason[];
}
