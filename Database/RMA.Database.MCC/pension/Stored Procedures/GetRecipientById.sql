


CREATE     PROCEDURE [pension].[GetRecipientById] @recipientId int
AS
BEGIN

select per.FirstName,
	per.Surname,
	per.IdNumber,
	per.IdTypeId as 'IdType',
	per.MaritalStatusId as 'MaritalStatus',
	per.TitleId as 'Title',
	per.DateOfBirth,
	per.DateOfDeath,
	rec.BeneficiaryTypeId as 'BeneficiaryType',
	rec.FamilyUnit,
	per.LanguageId as 'Language',
	rec.PensionRecipientId [RecipientId]
from [pension].[PensionClaimMap] cm
inner join [pension].[PensionRecipient] rec
on cm.PensionClaimMapId = rec.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = rec.PersonId
where rec.PensionRecipientId=@recipientId
and cm.IsDeleted=0
END