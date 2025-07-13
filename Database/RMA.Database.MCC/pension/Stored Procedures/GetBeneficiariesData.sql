

CREATE     PROCEDURE [pension].[GetBeneficiariesData] @pensionId int
AS
BEGIN
select distinct per.FirstName,
	per.Surname,
	per.IdNumber,
	per.IdTypeId as 'IdType',
	per.MaritalStatusId as 'MaritalStatus',
	per.TitleId as 'Title',
	per.DateOfBirth,
	per.DateOfDeath,
	ben.BeneficiaryTypeId as 'BeneficiaryType',
	ben.FamilyUnit,
	per.LanguageId as 'Language'
from [pension].[PensionClaimMap] cm
inner join [pension].PensionBeneficiary ben
on cm.PensionClaimMapId = ben.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = ben.PersonId
where ben.PensionBeneficiaryId in (select pl.beneficiaryId from pension.Ledger pl) and cm.PensionCaseId=@pensionId  
and cm.IsDeleted=0
END