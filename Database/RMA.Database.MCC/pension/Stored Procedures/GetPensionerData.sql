

CREATE     PROCEDURE [pension].[GetPensionerData] @pensionId int
AS
BEGIN
select per.FirstName,
per.Surname,
per.IdNumber,
per.IdTypeId as 'IdType',
per.MaritalStatusId as 'MaritalStatus',
pen.BeneficiaryTypeId as 'BeneficiaryType',
per.TitleId as 'Title',
per.LanguageId as 'Language',
per.DateOfBirth,per.DateOfDeath/*pen.TaxReferenceNumber,pen.LanguageId,pen.IndividualIndicator,pen.StateProvinceId[ProvinceId],
pen.CountryOriginId,pen.MarriageType,pen.OtherIdNumber,pen.Occupation*/
from [pension].[PensionClaimMap] cm
inner join [pension].[Pensioner] pen
on cm.PensionClaimMapId = pen.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = pen.PersonId
where cm.PensionCaseId=@pensionId
and cm.IsDeleted=0
END