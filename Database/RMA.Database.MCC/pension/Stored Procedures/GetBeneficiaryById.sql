


CREATE     PROCEDURE [pension].[GetBeneficiaryById] @beneficiaryId int
AS
BEGIN
select per.FirstName,
	per.Surname,
	per.IdNumber,
	per.IdTypeId as 'IdType',
	isnull(per.MaritalStatusId,1) as 'MaritalStatus',
	isnull(per.TitleId, 1) as 'Title',
	per.DateOfBirth,
	per.DateOfDeath,
	2 as 'CommunicationType',
	ben.BeneficiaryTypeId as 'BeneficiaryType',
	ben.FamilyUnit,
	per.LanguageId as 'Language',
	ben.PensionBeneficiaryId [BeneficiaryId]
from [pension].[PensionClaimMap] cm
inner join [pension].PensionBeneficiary ben
on cm.PensionClaimMapId = ben.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = ben.PersonId
where ben.PensionBeneficiaryId=@beneficiaryId
and cm.IsDeleted=0
END