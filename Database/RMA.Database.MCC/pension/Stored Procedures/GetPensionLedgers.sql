

CREATE     PROCEDURE [pension].[GetPensionLedgers] @pensionId int
AS

BEGIN
select ldg.PensionLedgerId [LedgerId],ldg.PensionLedgerStatusId ,cm.PensionCaseId,pc.PensionCaseNumber,cm.ClaimReferenceNumber,per.FirstName [BeneficiaryFirstName]
	,per.Surname [BeneficiarySurname],per.idnumber [BeneficiaryIdNumber],per.DateOfBirth,ldg.ModifiedDate,ldg.StartAmount,ldg.StartDate,ldg.ProductClassName
	,ldg.ProductCode,ldg.BenefitCode,ldg.PensionLedgerId [LedgerId],ldg.NormalMonthlyPension,ldg.CurrentMonthlyPension,ldg.CapitalValue,ldg.DateOfAccident,ldg.PensionLedgerStatusId,ldg.ProductOptionName
	,cast(ldg.DateOfStabilisation as date) as 'DateOfStabilisation',pls.Name [StatusName],ldg.PensionLedgerStatusId [Status],ldg.CreatedDate,ben.BeneficiaryId as 'BeneficiaryId',ben.BeneficiaryTypeId as 'BeneficiaryType'
	,lr_per.FirstName [RecipientFirstName]
	,lr_per.Surname [RecipientSurname]
FROM pension.PensionCase pc 
	INNER JOIN pension.PensionClaimMap AS cm ON pc.PensionCaseId = cm.PensionCaseId 
	INNER JOIN pension.Ledger ldg ON cm.PensionClaimMapId = ldg.PensionClaimMapId 
	INNER JOIN pension.Beneficiary ben ON ldg.BeneficiaryId = ben.BeneficiaryId 
	INNER JOIN client.Person AS per ON ben.PersonId = per.RolePlayerId 
	INNER JOIN common.PensionLedgerStatus pls ON ldg.PensionLedgerStatusId = pls.Id
	INNER JOIN pension.LedgerRecipient lr ON ldg.PensionLedgerId = LR.PensionLedgerId
	INNER JOIN client.Person AS lr_per ON lr.RolePlayerId = lr_per.RolePlayerId 
where pc.PensionCaseId=@pensionId and cm.IsDeleted=0

END