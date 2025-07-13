CREATE   PROCEDURE [billing].[SearchForInvoiceByBankStatementReference]
/* =============================================
Name:			SearchForInvoiceByBankStatementReference
Description:	Search For Invoice By Bank Statement Reference
Author:			Sibahle Senda
Create Date:	2020-04-12
Change Date:	2022-09-01
Change Date:	2024-11-29
Culprits:	Bongani Makelane, Sibahle Senda	
============================================= */
@statementReference varchar(100) 
AS
BEGIN
--altered stored proc to select top 2 
--because c# code that uses this stored proc looks for count ==1 to execute
--so bringing all records is redundant
		SELECT P.PolicyNumber, F.FinPayeNumber, P.PolicyId, I.InvoiceId, P.PolicyOwnerId
		FROM [client].[RolePlayer] R INNER JOIN [policy].[Policy] P
		ON P.[PolicyOwnerId] = R.RolePlayerId INNER JOIN [billing].[Invoice] I
		ON I.PolicyId = P.PolicyId INNER JOIN [client].[FinPayee] F
		ON F.RolePlayerId = P.[PolicyOwnerId] INNER JOIN  [billing].[Transactions] T
		ON T.InvoiceId = I.InvoiceId
		WHERE dbo.GetTransactionBalance(T.TransactionId) > 0
		AND (LOWER(LTRIM(RTRIM(P.PolicyNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%'
		OR LOWER(LTRIM(RTRIM(F.FinPayeNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%'
		OR LOWER(LTRIM(RTRIM(P.ClientReference))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%' 
		OR LOWER(LTRIM(RTRIM(I.InvoiceNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%')
		UNION
		SELECT P.PolicyNumber, F.FinPayeNumber, P.PolicyId, I.InvoiceId, P.PolicyOwnerId
		FROM [client].[RolePlayer] R INNER JOIN [policy].[Policy] P
		ON P.[PolicyOwnerId] = R.RolePlayerId INNER JOIN [policy].[Policy] Child
		ON Child.ParentPolicyId = P.PolicyId  INNER JOIN [billing].[Invoice] I
		ON I.PolicyId = P.PolicyId INNER JOIN [client].[FinPayee] F
		ON F.RolePlayerId = P.[PolicyOwnerId]
		WHERE I.InvoiceStatusId in (2,3,4) -- pending, partial,unpaid
		AND (LOWER(LTRIM(RTRIM(child.PolicyNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%'
		OR LOWER(LTRIM(RTRIM(child.ClientReference))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%')
END
