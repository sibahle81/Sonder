import { ApprovalType } from './approval-type.enum';

export class ApprovalRequest {
    constructor(
        public readonly approvalType: ApprovalType,
        public readonly comment: string) {
    }
}
