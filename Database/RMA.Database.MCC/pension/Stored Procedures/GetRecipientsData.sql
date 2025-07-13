

CREATE     PROCEDURE [pension].[GetRecipientsData] @pensionId int
AS
BEGIN

SELECT DISTINCT per.FirstName
	,per.Surname
	,per.IdNumber
	,per.IdTypeId as 'IdType'
	,per.MaritalStatusId as 'MaritalStatus'
	,per.TitleId as 'Title'
	,per.DateOfBirth
	,per.DateOfDeath
	,pb.BeneficiaryTypeId as 'BeneficiaryType'
	,pb.FamilyUnit
	,per.LanguageId as 'Language'
	,per.RolePlayerId
FROM pension.PensionCase pc 
	INNER JOIN pension.PensionClaimMap cm ON pc.PensionCaseId = cm.PensionCaseId 
	INNER JOIN pension.Ledger pl ON cm.PensionClaimMapId = pl.PensionClaimMapId 
	INNER JOIN pension.LedgerRecipient lr ON pl.PensionLedgerId = lr.PensionLedgerId
	INNER JOIN client.Person per ON LR.RolePlayerId = per.RolePlayerId
	LEFT JOIN pension.Beneficiary pb ON per.RolePlayerId = pb.PersonId
where cm.PensionCaseId = @pensionId 
	AND cm.IsDeleted=0

END