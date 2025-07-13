






-- =======================================================================
-- Author:		Farai Nyamajiwa
-- Create date: 26 October 2020
-- EXEC:  [billing].[DOCRReport] 
-- ========================================================================


CREATE  PROCEDURE [billing].[DOCRReport]


AS
BEGIN
  


		DECLARE @CurrentYear INT 
		SELECT @CurrentYear = YEAR(GETDATE())
		
		
		IF OBJECT_ID(N'tempdb..#TempCollections', N'U') IS NOT NULL
		                DROP TABLE #TempCollections;
		
		
		SELECT         'COLLECTION ON TOTAL BOOK BALANCE '+ CONVERT(VARCHAR(4), @CurrentYear) AS [Collection Year],
		               SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE()) AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) AS  [Invoices],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Credit Notes],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Debit Notes],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE()) AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)                       -- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Actual Revenue],  -- debit notes
		               SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Collected],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE()) AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)						-- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)				        -- debit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE()) AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Balance (Age)]    -- collected

		INTO #TempCollections
		FROM 
		Billing.Transactions bt
		LEFT JOIN Billing.InvoiceAllocation  bia ON bt.TransactionId = bia.TransactionId 
		LEFT JOIN Billing.Invoice bi ON bi.InvoiceId = bia.InvoiceId 
		WHERE (bt.[TransactionTypeId] not in (14, 15, 16))
		AND  NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
		
		
		UNION ALL

		SELECT         'COLLECTION ON TOTAL BOOK BALANCE '+ CONVERT(VARCHAR(4), @CurrentYear-1 ) AS [Collection Year],
		               SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-1 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) AS  [Invoices],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Credit Notes],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Debit Notes],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-1  AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)                       -- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Actual Revenue],  -- debit notes
		               SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Collected],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-1  AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)						-- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)				        -- debit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-1  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Balance (Age)]    -- collected
					   			
		FROM 
		Billing.Transactions bt
		LEFT JOIN Billing.InvoiceAllocation  bia ON bt.TransactionId = bia.TransactionId 
		LEFT JOIN Billing.Invoice bi ON bi.InvoiceId = bia.InvoiceId 
		WHERE (bt.[TransactionTypeId] not in (14, 15, 16))
		AND  NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
		
		UNION ALL
		
		SELECT         'COLLECTION ON TOTAL BOOK BALANCE '+ CONVERT(VARCHAR(4), @CurrentYear-2 ) AS [Collection Year],
		               SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-2 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) AS  [Invoices],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Credit Notes],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Debit Notes],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-2  AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)                       -- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Actual Revenue],  -- debit notes
		               SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Collected],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-2  AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)						-- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)				        -- debit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-2  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Balance (Age)]    -- collected			
		FROM 
		Billing.Transactions bt
		LEFT JOIN Billing.InvoiceAllocation  bia ON bt.TransactionId = bia.TransactionId 
		LEFT JOIN Billing.Invoice bi ON bi.InvoiceId = bia.InvoiceId 
		WHERE (bt.[TransactionTypeId] not in (14, 15, 16))
		AND  NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
		
		UNION ALL
		
		SELECT         'COLLECTION ON TOTAL BOOK BALANCE '+ CONVERT(VARCHAR(4), @CurrentYear-3 ) AS [Collection Year],
		               SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-3 AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) AS  [Invoices],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Credit Notes],
					   SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Debit Notes],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-3  AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)                       -- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 1 END) AS [Actual Revenue],  -- debit notes
		               SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Collected],
					   SUM(CASE WHEN YEAR(bt.CreatedDate) = YEAR(GETDATE())-3  AND Bt.TransactionTypeId = 6 THEN bt.Amount  ELSE 0 END) 
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId = 4)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)						-- credit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 1) AND (bt.TransactionTypeId = 2)  THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END)				        -- debit notes
					   + SUM(CASE WHEN YEAR(bia.CreatedDate)= YEAR(GETDATE())-3  AND (bt.TransactionId = bia.TransactionId) AND  (bt.TransactionTypeLinkId = 2) AND (bt.TransactionTypeId <> 4) THEN bia.Amount* (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END) AS [Balance (Age)]    -- collected			
		FROM 
		Billing.Transactions bt
		LEFT JOIN Billing.InvoiceAllocation  bia ON bt.TransactionId = bia.TransactionId 
		LEFT JOIN Billing.Invoice bi ON bi.InvoiceId = bia.InvoiceId 
		WHERE (bt.[TransactionTypeId] not in (14, 15, 16))
		AND  NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
		
		
		
		SELECT  
						[Collection Year],
						[Invoices],
						[Credit Notes],
						[Debit Notes],
						[Actual Revenue],
						[Collected],
						[Balance (Age)],
						CASE WHEN [Actual Revenue] = 0 THEN 0
						     ELSE ([Balance (Age)]/[Actual Revenue]) END AS [Percentage Outstanding],							
						CASE WHEN [Actual Revenue] = 0 THEN 0
						     WHEN [Balance (Age)] < 1 THEN 1 
							 ELSE ABS(([Collected]/[Actual Revenue])) END AS [Percentage Collected]							

		FROM #TempCollections
		



END
GO

