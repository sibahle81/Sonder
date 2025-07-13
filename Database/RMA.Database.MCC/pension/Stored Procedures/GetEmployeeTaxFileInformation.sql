



CREATE   PROCEDURE [pension].[GetEmployeeTaxFileInformation] @Year int,@Indicator varchar(6)
AS
BEGIN

/*
	Work in progress
*/

select 
 --@Year [YearOfAssessment],
 2022 [YearOfAssessment], --TODO remove this line
3025 [YearOfAssessmentCode],
per.RolePlayerId,
bnk.AccountHolderName[FirstTwoNames],
3040[FirstTwoNamesCode],
per.Surname[EmployeeSurnameOrTradingName],
3030 [EmployeeSurnameOrTradingNameCode],
per.[IdNumber] [IdentityNumber],
3066 [IdentityNumberCode],
per.DateOfBirth [DateOfBirth],
3080 [DateOfBirthCode],
bnk.AccountNumber [AccountNumber],
3241 AccountNumberCode,
bnk.BranchCode [BranchNumber],
3242 [BranchNumberCode],
cbk.[Name][BankName],
3243 [BankNameCode],
cbr.Name [BranchName],
3244 [BranchNameCode],
bnk.AccountHolderName [AccountHolderName],
3245 [AccountHolderNameCode],
acctyp.Name [BankAccountType],
3240 [BankAccountTypeCode],
addr.AddressLine1 [AddressDetailsResidentialStreetName],
3214 [AddressDetailsResidentialStreetNameCode],
addr.City [AddressDetailsResidentialSuburb],
3215 [AddressDetailsResidentialSuburbCode],
addp.PostalCode [AddressDetailsResidentialPostal],
3217 [AddressDetailsResidentialPostalCode],
addp.AddressLine1 [PostalAddressDetailStreetName],
3258 [PostalAddressDetailStreetNameCode],
addp.City [PostalAddressDetailSuburb],
3259 [PostalAddressDetailSuburbCode],
addp.City [PostalAddressDetailTown],
3260 [PostalAddressDetailTownCode],
addp.PostalCode [PostalAddressDetailPostal],
3261 [PostalAddressDetailPostalCode],
9999[EndOfRecordCode]
from [pension].[PensionClaimMap] cm
inner join [pension].PensionRecipient rec
on cm.PensionClaimMapId = rec.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = rec.PersonId
inner join [client].[RolePlayerBankingDetails] bnk
on bnk.[RolePlayerId] = per.[RolePlayerId]
inner join [common].bankBranch cbr
on cbr.[Id]=bnk.BankBranchId
inner join [common].bank cbk
on cbr.[BankId]=cbk.[id]
inner join [common].[BankAccountType] acctyp
on acctyp.Id = bnk.BankAccountTypeId
left join [client].[RolePlayerAddress] addp
on addp.RolePlayerId = per.RolePlayerId
and addp.AddressTypeId=1
left join [client].[RolePlayerAddress] addr
on addr.RolePlayerId = per.RolePlayerId
and addr.AddressTypeId=2
END