-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
---- Description:	<Description,,>
--The ref number of the payment
--Batch number
--The rejection Reason
--Date of Rejection
--Payee Details i.e. name, account number,
--Rejected Amount
--Policy Number
--Pension Case Number
--Claim Number (
--Product Type e.g. EMP, CJP (business to provide list)
--Date of Notifying Pension team
--Company Number & Branch Number
-- =============================================
CREATE PROCEDURE [Payment].[GetPaymentRejectReport]  
@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL	
AS
BEGIN
	SELECT    distinct   payment.Reference,payment.Payment.BatchReference,payment.Payment.ErrorDescription, payment.Payment.RejectionDate as 'Rejection Date'
	                    ,payment.Payment.Payee,payment.Payment.Amount,payment.Payment.PolicyReference,pension.PensionCase.PensionCaseNumber AS 'Pension Case No',payment.ClaimReference,
						payment.Product,payment.ClientNotificationDate, payment.Company,payment.Branch

						 
FROM            common.Month INNER JOIN
                         pension.MonthEndRunDate ON common.Month.Id = pension.MonthEndRunDate.MonthId AND common.Month.Id = pension.MonthEndRunDate.MonthId AND common.Month.Id = pension.MonthEndRunDate.MonthId AND 
                         common.Month.Id = pension.MonthEndRunDate.MonthId AND common.Month.Id = pension.MonthEndRunDate.MonthId CROSS JOIN
                         common.PaymentStatus INNER JOIN
                         pension.MonthlyPensionLedger INNER JOIN
                         pension.MonthlyPension ON pension.MonthlyPensionLedger.MonthlyPensionId = pension.MonthlyPension.MonthlyPensionId ON common.PaymentStatus.Id = pension.MonthlyPensionLedger.PaymentStatusId AND 
                         common.PaymentStatus.Id = pension.MonthlyPensionLedger.PaymentStatusId AND common.PaymentStatus.Id = pension.MonthlyPensionLedger.PaymentStatusId AND 
                         common.PaymentStatus.Id = pension.MonthlyPensionLedger.PaymentStatusId INNER JOIN
                         payment.Payment ON common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND 
                         common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND 
                         common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND common.PaymentStatus.Id = payment.Payment.PaymentStatusId AND 
                         common.PaymentStatus.Id = payment.Payment.PaymentStatusId INNER JOIN
                         common.PaymentType ON payment.Payment.PaymentTypeId = common.PaymentType.Id CROSS JOIN
                         pension.PensionCase INNER JOIN
                         pension.PensionRecipient INNER JOIN
                         client.Person ON pension.PensionRecipient.PersonId = client.Person.RolePlayerId AND pension.PensionRecipient.PersonId = client.Person.RolePlayerId AND 
                         pension.PensionRecipient.PersonId = client.Person.RolePlayerId INNER JOIN
                         pension.PensionClaimMap ON pension.PensionRecipient.PensionClaimMapId = pension.PensionClaimMap.PensionClaimMapId AND 
                         pension.PensionRecipient.PensionClaimMapId = pension.PensionClaimMap.PensionClaimMapId AND pension.PensionRecipient.PensionClaimMapId = pension.PensionClaimMap.PensionClaimMapId AND 
                         pension.PensionRecipient.PensionClaimMapId = pension.PensionClaimMap.PensionClaimMapId ON pension.PensionCase.PensionCaseId = pension.PensionClaimMap.PensionCaseId AND 
                         pension.PensionCase.PensionCaseId = pension.PensionClaimMap.PensionCaseId AND pension.PensionCase.PensionCaseId = pension.PensionClaimMap.PensionCaseId AND 
                         pension.PensionCase.PensionCaseId = pension.PensionClaimMap.PensionCaseId AND pension.PensionCase.PensionCaseId = pension.PensionClaimMap.PensionCaseId CROSS JOIN
                         common.PaymentMethod
WHERE pension.MonthlyPensionLedger.PaymentStatusId = 4 AND pension.MonthlyPensionLedger.PaymentTypeId=7 and 
 CAST(payment.Payment.RejectionDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
END