

CREATE     PROCEDURE [pension].[GetBankingDetailsData] @pensionId int
AS
BEGIN
select 
bnk.[RolePlayerBankingId][BankId],
bnk.[BankBranchId],
bnk.BankAccountTypeId[AccountType],
bnk.AccountHolderName[AccountHolder],
per.[FirstName][AccountHolderName],
per.Surname[AccountHolderSurname],
bnk.AccountNumber,
bnk.EffectiveDate,
bnk.RolePlayerId,
bnk.BranchCode,
cbk.[Name][BankName]
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
where cm.PensionCaseId=@pensionId
and cm.IsDeleted=0
END