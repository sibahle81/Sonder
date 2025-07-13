-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/08/14
-- =================================================================
CREATE PROCEDURE [billing].[PaymentAuditStandard]
	@PaymentId AS INT
AS 
BEGIN  
/*

exec [billing].[PaymentAuditStandard] @PaymentId = 5

*/

SELECT 
	[A].[ItemId] [PaymentId],
	[A].[Action]  [Action],
	[S].[Name]  [Status],
	JSON_VALUE(NewItem,'$.Payee') [Payee],
	JSON_VALUE(NewItem,'$.Bank') [Bank],
	JSON_VALUE(NewItem,'$.BankBranch') [BankBranch],
	JSON_VALUE(NewItem,'$.AccountNo') [AccountNo],
	JSON_VALUE(NewItem,'$.Amount') [Amount],
	JSON_VALUE(NewItem,'$.ErrorCode') [ErrorCode],
	JSON_VALUE(NewItem,'$.ErrorDescription') [ErrorDescription],
	JSON_VALUE(NewItem,'$.IdNumber') [IdNumber],
	JSON_VALUE(NewItem,'$.SubmissionDate') [SubmissionDate],
	JSON_VALUE(NewItem,'$.PaymentConfirmationDate') [PaymentConfirmationDate],
	JSON_VALUE(NewItem,'$.Reference') [Reference,
	JSON_VALUE(NewItem,'$.RejectionDate') AS [RejectionDate],
	JSON_VALUE(NewItem,'$.ReconciliationDate') [ReconciliationDate],
	[A].[Username] [ModifiedBy],
	[A].[DATE] [ModifiedDate]
	 from [audit].[AuditLog](NOLOCK) [A]
	 left JOIN [common].[PaymentStatus](NOLOCK) [S] ON [S].Id = JSON_VALUE(NewItem,'$.PaymentStatus')
	 where [A].[ItemType]='payment_Payment' AND [A].ItemId = @PaymentId
	 AND [A].[Action] <>'Update'
	ORDER BY [A].[Id] ASC
END  