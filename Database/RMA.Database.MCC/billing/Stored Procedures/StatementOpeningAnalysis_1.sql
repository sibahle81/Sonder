
 CREATE  PROCEDURE [billing].[StatementOpeningAnalysis]
 @invoiceId int 
AS
BEGIN

DECLARE @AnalysisTable TABLE 
  ( 
     currentbalance   DECIMAL(18, 2), 
     thirtybalance    DECIMAL(18, 2), 
     sixtybalance     DECIMAL(18, 2), 
     ninetybalance    DECIMAL(18, 2), 
     onetwentybalance DECIMAL(18, 2) 
  ); 

INSERT INTO @AnalysisTable 
SELECT TOP 1 (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
and ((NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= t.TransactionDate and p.[Status] = 'Future') and t.TransactionTypeId != 6) OR
 (EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= t.TransactionDate and p.[Status] != 'Future') and t.TransactionTypeId  = 6))
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) >= 30 
                  AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) < 60 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))
				 AS CurrentBalance, 
				 (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
and ((NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= t.TransactionDate and p.[Status] = 'Future') and t.TransactionTypeId != 6) OR
 (EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= t.TransactionDate and p.[Status] != 'Future') and t.TransactionTypeId  = 6))
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end end, Getdate()) >= 60
                  AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) < 90 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0)) AS ThirtyBalance, 
				  (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
and ((NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= t.TransactionDate and p.[Status] = 'Future') and t.TransactionTypeId != 6) OR
 (EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= t.TransactionDate and p.[Status] != 'Future') and t.TransactionTypeId  = 6))
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) >= 90 
                  AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) < 120 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))
             AS SixtyBalance, 
            (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and ((NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= t.TransactionDate and p.[Status] = 'Future') and t.TransactionTypeId != 6) OR
 (EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= t.TransactionDate and p.[Status] != 'Future') and t.TransactionTypeId  = 6))
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) >= 120
				  AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) < 150 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0)) AS NinetyBalance, 
            (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
and ((NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= t.TransactionDate and p.[Status] = 'Future') and t.TransactionTypeId != 6) OR
 (EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= t.TransactionDate and p.[Status] != 'Future') and t.TransactionTypeId  = 6))
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else  t.CreatedDate end, Getdate()) >= 150
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0)) AS OneTwentyBalance 
FROM   [billing].[invoice] Invoice 
       INNER JOIN [billing].[transactions] Transactions 
               ON invoice.invoiceid = transactions.invoiceid 
       INNER JOIN [policy].[policy] Policy 
               ON invoice.policyid = policy.policyid 
WHERE  policy.policyid = @invoiceId
ORDER  BY transactions.createddate DESC 

SELECT CurrentBalance, 
       ThirtyBalance, 
       SixtyBalance, 
       NinetyBalance, 
       OneTwentyBalance 
FROM   @AnalysisTable

END