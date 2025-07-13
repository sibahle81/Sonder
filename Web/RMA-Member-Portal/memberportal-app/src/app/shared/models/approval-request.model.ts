import { ApprovalType } from "../components/wizard/shared/models/approval-type.enum";

export class ApprovalRequest {
    constructor(
        public readonly approvalType: ApprovalType,
        public readonly comment: string) {
    }
}
