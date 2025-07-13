

CREATE   PROCEDURE [payment].[TribumalPaymentsReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL,
	@PaymentStatus AS int = NULL
AS

BEGIN
SELECT PaymentId, ClaimId, PolicyId, PaymentInstructionId, RefundHeaderId, CanEdit, PaymentStatusId, PaymentTypeId, Payee, Bank, BankBranch, AccountNo, Amount, RetainedCommission, Product, Company, Branch, SenderAccountNo, 
                  BrokerCode, BrokerName, FSBAccredited, ErrorCode, MaxSubmissionCount, SubmissionCount, BankAccountTypeId, IdNumber, EmailAddress, ClaimTypeId, ErrorDescription, SubmissionDate, PaymentConfirmationDate, 
                  ClientNotificationDate, CanResubmit, PaymentRejectionTypeId, ClientTypeId, ClaimReference, PolicyReference, Reference, BatchReference, PaymentSubmissonBatchid, ReconciliationDate, RejectionDate, TransactionType, IsActive, 
                  IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, IsImmediatePayment, RecalledDate, StrikeDate, IsForex, Currency, DestinationCountryId
FROM     payment.Payment
WHERE 
(
	PaymentTypeId = 8
	AND	CreatedDate BETWEEN @StartDate AND @EndDate  
	AND  ((PaymentStatusId = @PaymentStatus) OR (@PaymentStatus = NULL))
)

END