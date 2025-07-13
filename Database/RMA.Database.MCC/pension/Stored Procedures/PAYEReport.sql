
CREATE PROCEDURE [pension].[PAYEReport]
				@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL
	
AS
BEGIN
	
	SET NOCOUNT ON;

    
	SELECT     distinct   client.Person.FirstName, client.Person.Surname, pension.MonthlyPensionLedger.Amount AS 'Pension Amount', pension.MonthlyPensionLedger.PAYE AS 'Tax Amount', pension.MonthlyPensionLedger.AdditionalTax, 
                         common.PensionType.Name, pension.MonthlyPensionLedger.Reference, pension.CorrectiveEntry.VATAmount + pension.CorrectiveEntrySplit.PAYEAmount AS 'Additional Amount', 
                         pension.MonthlyPensionLedger.PAYE + pension.MonthlyPensionLedger.AdditionalTax AS 'Total', CONVERT(DATE,pension.MonthlyPensionLedger.CreatedDate) AS 'Transaction Date'
FROM            client.Person INNER JOIN
                         pension.PensionRecipient ON client.Person.RolePlayerId = pension.PensionRecipient.PersonId INNER JOIN
                         pension.PensionClaimMap ON pension.PensionRecipient.PensionClaimMapId = pension.PensionClaimMap.PensionClaimMapId INNER JOIN
                         pension.PensionCase ON pension.PensionClaimMap.PensionCaseId = pension.PensionCase.PensionCaseId AND pension.PensionClaimMap.PensionCaseId = pension.PensionCase.PensionCaseId AND 
                         pension.PensionClaimMap.PensionCaseId = pension.PensionCase.PensionCaseId INNER JOIN
                         pension.Ledger ON pension.PensionClaimMap.PensionClaimMapId = pension.Ledger.PensionClaimMapId AND pension.PensionClaimMap.PensionClaimMapId = pension.Ledger.PensionClaimMapId INNER JOIN
                         pension.MonthlyPensionLedger ON pension.Ledger.PensionLedgerId = pension.MonthlyPensionLedger.LedgerId AND pension.Ledger.PensionLedgerId = pension.MonthlyPensionLedger.LedgerId AND 
                         pension.Ledger.PensionLedgerId = pension.MonthlyPensionLedger.LedgerId INNER JOIN
                         pension.CorrectiveEntry ON pension.PensionRecipient.PensionRecipientId = pension.CorrectiveEntry.RecipientId AND pension.Ledger.PensionLedgerId = pension.CorrectiveEntry.LedgerId INNER JOIN
                         pension.CorrectiveEntrySplit ON pension.CorrectiveEntry.CorrectiveEntryId = pension.CorrectiveEntrySplit.CorrectiveEntryId CROSS JOIN
                         pension.PensionBenefit INNER JOIN
                         common.PensionType ON pension.PensionBenefit.PensionTypeId = common.PensionType.Id AND pension.PensionBenefit.PensionTypeId = common.PensionType.Id INNER JOIN
                         pension.PensionBenefitOption ON common.PensionType.Id = pension.PensionBenefitOption.PensionTypeId AND common.PensionType.Id = pension.PensionBenefitOption.PensionTypeId

						 WHERE CAST(pension.MonthlyPensionLedger.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
END