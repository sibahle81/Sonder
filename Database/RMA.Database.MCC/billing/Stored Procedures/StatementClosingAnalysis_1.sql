

 CREATE  PROCEDURE [billing].[StatementClosingAnalysis]
 @invoiceId int 
AS
BEGIN
--Declare @invoiceId int =406641;
DECLARE @analysis TABLE 
  (  
     [current]       DECIMAL (18,2), 
     [30days]        DECIMAL (18,2), 
     [60days]        DECIMAL (18,2), 
     [90days]        DECIMAL (18,2), 
     [120days]       DECIMAL (18,2),
    [netbalance] DECIMAL(18, 2)
  ) 

  insert into @analysis
  values (0, 0, 0, 0, 0, 0)

  update @analysis
  set [current] = (select isnull((select SUM(results.Balance) 
								  from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END 
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
				  and Datediff(day, t.CreatedDate, Getdate()) < 30
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))


  update @analysis
  set [30days] = (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) >= 30 
AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) < 60 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))

   update @analysis
  set [60days] = (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) >= 60
                  AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) < 90 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))

  update @analysis
  set [90days] = (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) >= 90 
                  AND ( Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) < 120 )
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))

  update @analysis
  set [120days] = (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
				  AND Datediff(day, Case when i.InvoiceDate > getdate() then i.InvoiceDate else t.CreatedDate end, Getdate()) >= 120
				  AND (DATEDIFF(day, [TransactionDate], getdate()) < 150)
				  group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))

 update @analysis
  set [netbalance] = (select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
                  and t.TransactionTypeId != 6
				  and p.PolicyId = @invoiceId
and t.[TransactionTypeId] not in (14, 15, 16)
and t.IsDeleted =0
				 group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0)) + 
(select isnull((select SUM(results.Balance) from (select t.TransactionId, CASE WHEN t.TransactionTypeLinkId = 1 THEN t.Amount ELSE - t.Amount END
				  as Balance FROM [billing].[Transactions] t,
                   [billing].[invoice] i, [policy].[policy] p
				  where t.RolePlayerId = p.PolicyOwnerId
                  and t.TransactionTypeId = 6
				  and p.PolicyId = @invoiceId
				  and t.IsDeleted =0
--and NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= t.TransactionDate and p.[Status] = 'Future') 
				 group by t.TransactionId,t.TransactionTypeLinkId ,t.Amount
				  ) results),0))

SELECT  
       [Current], 
       [30days], 
       [60days], 
       [90days], 
       [120days],
       [netbalance]
FROM   @analysis 
END