-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- =============================================
CREATE PROCEDURE [billing].[GetAccountHistoryByRolePlayer]
	@RolePlayerId INT
AS
BEGIN

DECLARE @RolePlayerPolicyTable TABLE (
		PolicyId Int, 
		PolicyOwnerId Int,  
		PolicyNumber Varchar(50)); 

INSERT INTO @RolePlayerPolicyTable
SELECT PolicyId,
       PolicyOwnerId,
	   PolicyNumber
FROM policy.Policy WHERE PolicyOwnerId = @RolePlayerId


DECLARE @SearchTable TABLE (
		InvoiceId Int, 
		PolicyId Int, 
		TransactionDate DateTime, 
		TransactionType Varchar(50), 
		DocumentNumber Varchar(50), 
		Reference Varchar(50), 
		Description Varchar(50), 
		DebitAmount Decimal(18, 2), 
        CreditAmount Decimal(18, 2), 
		Balance Decimal(18, 2),
		Amount Decimal(18, 2)); 
		
DECLARE @ResultTable TABLE (
        InvoiceId Int, 
		PolicyId Int, 
		TransactionDate DateTime, 
		TransactionType Varchar(50),
	    DocumentNumber Varchar(50), 
		Reference Varchar(50), 
        [Description] Varchar(50), 
		DebitAmount Decimal(18, 2), 
		CreditAmount Decimal(18, 2), 
		Amount Decimal(18, 2),
		Balance Decimal(18, 2), 
		RunningBalance Decimal(18, 2)); 
		
INSERT INTO @SearchTable
SELECT DISTINCT 
        Invoice.InvoiceId, 
		Invoice.PolicyId, 
		Transactions.CreatedDate, 
        TransactionType.Name, 
		CASE WHEN TransactionType.Id= 4 THEN Transactions.BankReference ELSE Invoice.InvoiceNumber END AS InvoiceNumber, 
		CASE WHEN TransactionType.[Name] = 'Payment' THEN Transactions.RmaReference WHEN TransactionType.[Name] = 'Credit Note' THEN Transactions.BankReference ELSE Transactions.BankReference END AS BankReference, 
        CASE WHEN TransactionType.[Name] = 'Invoice' THEN 'Monthly Premium' WHEN TransactionType.[Name] = 'Credit Note' THEN 'Premium Reversal' ELSE TransactionType.[Name] END AS [Description], 
        CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE 0 END AS DebitAmount, 
        CASE WHEN TransactionTypeLink.IsDebit = 0 THEN Transactions.Amount ELSE 0 END AS CreditAmount, 
        CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
		Transactions.Amount
FROM [billing].[Invoice] Invoice INNER JOIN [billing].[Transactions] Transactions ON 
Invoice.InvoiceId = Transactions.InvoiceId INNER JOIN @RolePlayerPolicyTable Policy ON 
Invoice.PolicyId = Policy.PolicyId INNER JOIN [client].[RolePlayer] RolePlayer ON 
Policy.PolicyOwnerId = RolePlayer.RolePlayerId INNER JOIN [common].[TransactionType] TransactionType ON 
Transactions.TransactionTypeId = TransactionType.Id INNER JOIN [billing].[TransactionTypeLink] TransactionTypeLink ON 
Transactions.TransactionTypeLinkId = TransactionTypeLink.Id 


INSERT        
INTO @ResultTable
SELECT InvoiceId, 
       PolicyId, 
	   TransactionDate, 
	   TransactionType, 
       DocumentNumber, 
	   Reference, 
	   [Description], 
	   DebitAmount, 
       CreditAmount,
	   Amount,
	   Balance, 
	   SUM(Balance) OVER (ORDER BY TransactionDate) AS RunningBalance
FROM @SearchTable


SELECT TOP 5 InvoiceId, 
       PolicyId, 
	   TransactionDate, 
	   TransactionType, 
       DocumentNumber, 
	   Reference, 
	   [Description], 
	   DebitAmount, 
       CreditAmount, 
	   Balance, 
	   RunningBalance,
	   Amount
FROM @ResultTable ORDER BY TransactionDate ASC

END
