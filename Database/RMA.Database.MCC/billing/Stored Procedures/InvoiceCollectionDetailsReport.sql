



-- =======================================================================
-- Author:	Farai Nyamajiwa
-- Create date: 06 November 2020
-- EXEC:  [billing].[InvoiceCollectionDetailsReport] '2016-01-01', '2020-11-30'
-- ========================================================================


CREATE  PROCEDURE [billing].[InvoiceCollectionDetailsReport]
	@StartDate Datetime,
	@EndDate Datetime

AS
BEGIN
    
	--DECLARE @StartDate Datetime,
	--        @EndDate Datetime
 --   SET @StartDate = '2016-01-01'
	--SET @EndDate = '2020-11-30'


	IF OBJECT_ID(N'tempdb..#TempBillingTransactions', N'U') IS NOT NULL
                DROP TABLE #TempBillingTransactions;	
	SELECT 
			* 
	INTO #TempBillingTransactions  
	FROM Billing.Transactions

	---- Create temp table for duplicates

	IF OBJECT_ID(N'tempdb..#TempDuplicates', N'U') IS NOT NULL
                DROP TABLE #TempDuplicates;	

	select Distinct TransactionId
	into #TempDuplicates
	from [billing].[Transactions] a
	where LinkedTransactionId in (select distinct TransactionId from billing.transactions
	                                                       where transactionTypeid in (3,6,11,15))
	and a.transactionTypeid in (1,5,13,16)
	and (a.Balance = 0)
	
	union 
	
	select Distinct TransactionId
	from [billing].[Transactions] t 
	where t.TransactionId in (select distinct LinkedTransactionId from billing.transactions
	                                                where transactionTypeid in (1,5,13,16))
	and t.transactionTypeid in (3,6,11,15)
	and (t.Balance = 0)


	-- Delete duplicates

	DELETE #TempBillingTransactions 
	WHERE TransactionId IN
	(
	SELECT TransactionId FROM #TempDuplicates
	)
	


-- Create Temp Table


IF OBJECT_ID(N'tempdb..#TempInvoices', N'U') IS NOT NULL
                DROP TABLE #TempInvoices;

SELECT DISTINCT 
                bt.TransactionId AS TransactionsTransactionId,
				bt.InvoiceId AS TransactionsInvoiceId,   		 
				bia.InvoiceId AS AllocationInvoiceId,        
                CASE WHEN ICD.Id = 4 THEN
                                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
                                  WHEN ICD.Id = 1  THEN 
                                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
								  WHEN ICD.Id = 2  THEN 
                                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
								  WHEN ICD.Id = 3  THEN 
                                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
                END AS ControlNumber,
				CASE WHEN ICD.Id = 4 THEN
                                  (SELECT TOP 1 ChartISName FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
                                  WHEN ICD.Id = 1  THEN 
                                  (SELECT TOP 1 ChartISName FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
								  WHEN ICD.Id = 2  THEN 
                                  (SELECT TOP 1 ChartISName FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
								  WHEN ICD.Id = 3  THEN 
                                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
                END AS ControlName,
                Year(Bt.TransactionDate) AS [Year],
				Month(Bt.TransactionDate) AS [Month],				
				cfp.FinPayeNumber AS [Customer],
				CASE WHEN crp.RolePlayerIdentificationTypeId = 2 THEN ccmp.Name
								  WHEN crp.RolePlayerIdentificationTypeId = 1 THEN cpn.FirstName + ' ' + cpn.Surname 
                END AS [name],
                CASE WHEN (bt.TransactionTypeId = 6) THEN bi2.InvoiceNumber END AS Invoice,
				bi2.InvoiceDate AS InvoiceDate,
				Year(Bt.CreatedDate) AS [UnderwritingYear],				 
				CASE WHEN  Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END  AS  [InvoiceAmount],
				[dbo].[GetTransactionBalance] (bt.TransactionId) AS [DocBalance], 	           			    
	            ctp.[Name] AS [Transaction],
				bt.Amount AS [TransactionAmount],
				bt.TransactionDate,		       
				Case When (bt.TransactionId = bia.TransactionId) Then 'Allocated' Else 'Unallocated' End As [Flag]  

INTO #TempInvoices        
FROM 
#TempBillingTransactions bt
LEFT JOIN Billing.InvoiceAllocation  bia ON bt.TransactionId = bia.TransactionId 
LEFT JOIN Billing.Invoice bi ON bi.InvoiceId = bia.InvoiceId 
LEFT JOIN Client.RolePlayer crp ON bt.RolePlayerId = crp.RolePlayerId  -- displayname AS name
LEFT JOIN Client.FinPayee cfp ON bt.RolePlayerId = cfp.RolePlayerID       -- finPayeeNumber AS dr number  
LEFT JOIN Common.TransactionType ctp ON bt.TransactionTypeId = ctp.Id   -- Type     
LEFT JOIN Client.Person cpn ON  crp.RolePlayerId = cpn.RolePlayerId
LEFT JOIN Client.Company ccmp ON crp.RolePlayerId = ccmp.RolePlayerId
LEFT JOIN [client].[RolePlayer] R ON bt.RolePlayerId = R.RolePlayerId
LEFT JOIN [client].[FinPayee] F ON R.RolePlayerId=F.RolePlayerId
LEFT JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
LEFT JOIN Billing.Invoice bi2 ON bt.InvoiceId = bi2.InvoiceId

WHERE (bt.[TransactionTypeId] not in (7, 14, 15, 16))
AND (bt.TransactionDate BETWEEN @StartDate AND @EndDate)
AND  NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 



	IF OBJECT_ID(N'tempdb..#TempInvoices1', N'U') IS NOT NULL
                DROP TABLE #TempInvoices1;

	SELECT DISTINCT 
                a.[TransactionsTransactionId],
				a.[TransactionsInvoiceId],   		 
                a.[ControlNumber],
                a.[ControlName],
                a.[Year],
				a.[Month],
				a.[Customer],
				a.[name],
                a.Invoice,
                a.InvoiceDate,
				a.[UnderwritingYear],
				a.[InvoiceAmount],
				a.[DocBalance], 
                b.[Transaction],
				b.[TransactionAmount],
				b.[TransactionDate],
				DATEDIFF(DAY,a.InvoiceDate,b.TransactionDate) AS [CollectionDays],
				DATEDIFF(DAY,a.InvoiceDate,b.TransactionDate) AS [LastTransactionDays],
				DATEDIFF(DAY,a.InvoiceDate,GETDATE()) AS [DaysSinceInvoice]
					    
	INTO #TempInvoices1
	FROM #TempInvoices a
	LEFT JOIN 
			(SELECT * FROM #TempInvoices WHERE [Transaction] NOT LIKE '%Invoice%' ) b
	ON a.TransactionsInvoiceId = b.AllocationInvoiceId


	DELETE #TempInvoices1 WHERE Invoice IS NULL OR Invoice = '';
	

	SELECT * FROM #TempInvoices1 ORDER BY Customer




END
GO




