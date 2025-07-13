-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [pension].[GetPaymentRejectReport]
@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL	
AS
BEGIN
	SELECT    distinct    pension.PensionCase.PensionCaseNumber AS 'Pension Case No', client.Person.FirstName, client.Person.Surname, common.PaymentMethod.Name AS 'Payment Method', pension.MonthlyPensionLedger.Amount, 
                         pension.MonthlyPensionLedger.PAYE, pension.MonthlyPensionLedger.VAT, common.PaymentStatus.Name AS 'Payment Status', common.PaymentType.Name AS 'Payment Type', pension.MonthEndRunDate.PaymentDate as 'Transaction Date'
						 , payment.Payment.ModifiedDate as 'Rejection Date'
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
WHERE pension.MonthlyPensionLedger.PaymentStatusId = 4 AND  
 CAST(payment.Payment.ModifiedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
END