export enum MonthEndRunStatusEnum {
		None = 0,
		Awaiting = 1,
		MonthlyLedgersProcessed = 2,
		PaymentsProcessed = 3,
		MonthlyLedgersFailed = 4,
		PaymentsFailed = 5,
		ProcessingMonthlyLedgers = 6,
		ProcessingPayments = 7,
}
