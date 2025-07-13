CREATE PROCEDURE [debt].[GetFinpayeeIdForPaidInvoice]
(
@InvoiceNumber varchar(20)
)
AS
BEGIN 
	select distinct 
 		[client].[Roleplayer].RolePlayerId FinpayeeId,  
 		[Client].[FinPayee].FinPayeNumber [CustomerNumber],
 		[client].[Roleplayer].DisplayName [CustomerName], 
 		[client].[Roleplayer].EmailAddress, 
 		[billing].[Invoice].InvoiceNumber
	from [client].FinPayee 
		inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
		inner join [policy].Policy on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
		inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
 	where --[billing].[Invoice].InvoiceStatusId =1 
		[billing].[Invoice].InvoiceNumber =@InvoiceNumber --'IV:348352'
 END 
 -- exec [debt].[GetFinpayeeIdForPaidInvoice] 'IV:348352' -- Parameter is @InvoiceNumber = 'IV:348352' 