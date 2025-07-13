import { Representative } from './representative';

export class BrokerStatementItem {
    policyNumber: string;
    broker: Representative;
    memberName: string;
    memberIdentityNumber: string;
    memberJoinDate: Date;
    paidForMonth: string;
    debitOrderDate: Date;
    premium: number;
    clawback: number;
    commission: number;
    commissionPercentage: number;
    retentionPercentage: number;
    retentionAmount: number;
    numberPolicies: number;
}
