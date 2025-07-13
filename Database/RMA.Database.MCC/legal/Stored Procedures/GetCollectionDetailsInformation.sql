

CREATE   Procedure [legal].[getCollectionDetailsInformation]
(
@FinPayeeId int
)
As
Begin 	
	
select
distinct  [client].[Roleplayer].RolePlayerId ReferralId, 
 [client].[Roleplayer].RolePlayerId Id,
 [Client].[FinPayee].FinPayeNumber [CustomerNumber],
[client].[Roleplayer].DisplayName [Name], 
	'' Initial, 
isnull([client].Person.Surname,'') Surname,
isnull([client].Person.IdNumber,'') IdNumber , 
 isnull([common].[Language].Name,'') [Language], 
 isnull([client].[Roleplayer].CellNumber,'') [Phone1] , 
 isnull([client].[Roleplayer].TellNumber,'') [Phone2] , 
  '' [Mobile] , 
 isnull([client].[Roleplayer].EmailAddress,'') [PrimaryEmailId] , 
 '' Fax,
 '' WorkTelephone,
 ''DirectWorkTelephone,
 '' Employer,
 '' EmployeeNumber , 
 case when isnull([client].Person.GenderId,'')='' then 'MALE' when [client].Person.GenderId=1 then 'MALE' else 'FEMALE' END Gender, 
 CASE WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType, 
'' HouseNumber, 
'' ComplexBuildingNumber, 
isnull([client].[RolePlayerAddress].AddressLine1,'') AddressLine1,
isnull([client].[RolePlayerAddress].AddressLine2,'') AddressLine2,
isnull([client].[RolePlayerAddress].PostalCode,'') PostalCode, 
isnull([client].[RolePlayerAddress].City,'') City,
isnull([common].Country.Name,'') [Country], 
isnull([client].[RolePlayerAddress].Province,'') Province, 
isnull([common].[IndustryClass].Name,'') [Book],
'' MetterNumber , 
'' MetterType,
'' Status, 
CONVERT(bit, 1) AS IsActive,
[client].FinPayee.IsDeleted,
[client].FinPayee.CreatedBy,
[client].FinPayee.CreatedDate,
[client].FinPayee.ModifiedBy,
[client].FinPayee.ModifiedDate
from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId = [client].FinPayee.RolePlayerId 
LEFT join [client].[RolePlayerAddress] on [client].[RolePlayerAddress].RolePlayerId  = [client].FinPayee .RolePlayerId 
LEFT join [client].Person on [client].Person.RolePlayerId = [client].FinPayee.RolePlayerId 
Left JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
Left join [common].[IndustryClass] on [common].[IndustryClass].Id = [Company].IndustryClassId 
LEFT join [common].[Language] on [common].[Language].Id = [client].Person.LanguageId 
Left join [common].Country on [common].Country.Id = [client].RolePlayerAddress.CountryId  
where [client].FinPayee.IsDeleted =0 
	and [client].FinPayee.RolePlayerId = @FinPayeeId

order by [client].[Roleplayer].DisplayName  
END

--exec [legal].[GetCollectionDetailsInformation] 1009565   -- Parameter @FinPayeeId  = 1009565