-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- Culprits: Sibahle
-- =============================================
CREATE PROCEDURE [billing].[GetAccountHistory]
	@PolicyId INT
AS
BEGIN
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
		Policy.PolicyId, 
		Transactions.CreatedDate, 
        TransactionType.Name, 
		CASE WHEN TransactionType.Id= 4 THEN Transactions.BankReference 
		WHEN TransactionType.Id= 3 THEN Transactions.RmaReference
		WHEN TransactionType.Id= 1 THEN Transactions.RmaReference
		WHEN TransactionType.Id= 9 THEN Transactions.RmaReference
		ELSE Invoice.InvoiceNumber END AS InvoiceNumber, 
		CASE WHEN TransactionType.[Name] = 'Payment' THEN Transactions.RmaReference WHEN TransactionType.[Name] = 'Credit Note' THEN Transactions.BankReference ELSE Transactions.BankReference END AS BankReference, 
        CASE WHEN TransactionType.[Name] = 'Invoice' THEN Concat('Premium - ',MONTH(Transactions.CreatedDate))
		WHEN TransactionType.[Name] = 'Credit Note' THEN Concat('Credit Note - ',MONTH(Transactions.CreatedDate))
		WHEN TransactionType.[Name] = 'Payment' THEN Concat('Payment - ',MONTH(Transactions.CreatedDate))
		ELSE Concat(TransactionType.[Name] + ' - ',MONTH(Transactions.CreatedDate)) END AS [Description], 
        CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE 0 END AS DebitAmount, 
        CASE WHEN TransactionTypeLink.IsDebit = 0 THEN Transactions.Amount ELSE 0 END AS CreditAmount, 
        CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
		Transactions.Amount
FROM [policy].[Policy] Policy INNER JOIN [client].[RolePlayer] RolePlayer ON 
RolePlayer.RolePlayerId = Policy.PolicyOwnerId INNER JOIN [billing].[Transactions] Transactions ON
Transactions.RolePlayerId = RolePlayer.RolePlayerId INNER JOIN [common].[TransactionType] TransactionType ON 
Transactions.TransactionTypeId = TransactionType.Id INNER JOIN [billing].[TransactionTypeLink] TransactionTypeLink ON 
Transactions.TransactionTypeLinkId = TransactionTypeLink.Id LEFT OUTER JOIN [billing].[Invoice] Invoice ON 
Invoice.InvoiceId = ISNULL(Transactions.InvoiceId, 0)
WHERE Policy.PolicyId = @PolicyId
--and Transactions.CreatedDate >= isnull(@StartDate, (select cast('1753-1-1' as datetime)))
--and Transactions.CreatedDate <= isnull(@EndDate, (select cast('9999-12-31' as datetime))

--INSERT INTO @SearchTable
--SELECT DISTINCT 
--       0 InvoiceId, 
--	   Policy.PolicyId, 
--	   Transactions.CreatedDate, 
--       TransactionType.Name, 
--	   Policy.PolicyNumber InvoiceNumber, 
--	   Transactions.BankReference, 
--       CASE WHEN TransactionType.Id = 6 THEN 'Monthly Premium' WHEN TransactionType.Id = 4 THEN 'Premium Reversal' ELSE TransactionType.Name END AS Description, 
--       CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE 0 END AS DebitAmount, 
--       CASE WHEN TransactionTypeLink.IsDebit = 0 THEN Transactions.Amount ELSE 0 END AS CreditAmount, 
--       CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance
--FROM [billing].[Transactions] Transactions INNER JOIN [policy].[Policy] Policy ON 
--Transactions.RolePlayerId = Policy.PolicyOwnerId INNER JOIN [client].[RolePlayer] RolePlayer ON 
--Policy.PolicyOwnerId = RolePlayer.RolePlayerId INNER JOIN [common].[TransactionType] TransactionType ON 
--Transactions.TransactionTypeId = TransactionType.Id INNER JOIN [billing].[TransactionTypeLink] TransactionTypeLink ON 
--Transactions.TransactionTypeLinkId = TransactionTypeLink.Id LEFT JOIN [client].[RolePlayerAddress] RolePlayerAddress ON 
--RolePlayerAddress.RolePlayerId = RolePlayer.RolePlayerId LEFT JOIN [billing].[Transactions] CreditNotes ON RolePlayer.RolePlayerId = CreditNotes.RolePlayerId
--WHERE Policy.PolicyId = @PolicyId
--and Transactions.CreatedDate >= isnull(@StartDate, (select cast('1753-1-1' as datetime)))
--and Transactions.CreatedDate <= isnull(@EndDate, (select cast('9999-12-31' as datetime)))

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


SELECT InvoiceId, 
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
