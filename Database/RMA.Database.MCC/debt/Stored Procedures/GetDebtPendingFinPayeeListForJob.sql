CREATE   PROCEDURE [debt].GetDebtPendingFinPayeeListForJob
(
	@row_num as int = 0
)
AS
Begin
select
	distinct [client].[Roleplayer].RolePlayerId FinpayeeId 
	from [client].FinPayee 
	inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
	inner join [policy].Policy  on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
	inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
	LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
	left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
	left join [debt].ManagmentTransactions on [debt].ManagmentTransactions.FinPayeeId  =  [client].FinPayee.RolePlayerId and [debt].ManagmentTransactions.IsDeleted = 0 
	where [billing].[Invoice].InvoiceStatusId =2  and isnull([debt].ManagmentTransactions.Id,0)=0
End

-- exec [debt].GetDebtPendingFinPayeeListForJob 