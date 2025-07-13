export class TermScheduleRefundBreakDown{
    bankAccountNumber: string;
    transactionId: number;
    amount:number;
    overpayment :number;
    reference: string;
    transactionType: string;
    transactionDate: Date;
    refundableTermScheduleIds : number []
}