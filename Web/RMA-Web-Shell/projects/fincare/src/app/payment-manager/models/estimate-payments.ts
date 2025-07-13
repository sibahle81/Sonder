export class EstimatePayment {
    senderAccountNo: string;
    industryName: string;
    amount: number[];
    clientType: string;
}
export class EstimatePaymentResponse {
    months: string[];
    data: EstimatePayment[];
}