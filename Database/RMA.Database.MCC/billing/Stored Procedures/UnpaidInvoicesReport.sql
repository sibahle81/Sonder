
-- =============================================
-- Author:		Ryan Maree
-- Create date: 2020-08-26
-- EXEC [billing].[UnpaidInvoicesReport] ''
-- =============================================
CREATE PROCEDURE [billing].[UnpaidInvoicesReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL
AS

DECLARE @SearchTable TABLE (
	    [Debtor Account Number] VARCHAR(250),
		[Debtor Name] VARCHAR(250),
		[Policy Number] VARCHAR(250),
		[Invoice Number] VARCHAR(250),
		[Invoice Date] Date,
		[Collection Date] Date,
		[Invoice Amount] Decimal(18,2),
		[Invoice Balance] Decimal(18,2),
		[Period] VARCHAR(250),
		[Days Since Issued] INT,
		[Status] VARCHAR(250)
	);
INSERT INTO @SearchTable
SELECT DISTINCT
	[ACCOUNT].FinPayeNumber AS [Debtor Account Number],
	[ROLEPLAYER].DisplayName AS [Debtor Name],
	[POLICY].PolicyNumber AS [Policy Number],
	[INVOICE].InvoiceNumber AS [Invoice Number],
	[INVOICE].InvoiceDate AS [Invoice Date],
	[INVOICE].CollectionDate AS [Collection Date],
	[INVOICE].TotalInvoiceAmount AS [Invoice Amount],

	CASE 
		WHEN ([INVOICE].TotalInvoiceAmount - SUM([ALLOCATION].AMOUNT) IS NOT NULL) THEN [INVOICE].TotalInvoiceAmount - SUM([ALLOCATION].AMOUNT)
		ELSE [INVOICE].TotalInvoiceAmount
	END AS [Invoice Balance],

	FORMAT([INVOICE].InvoiceDate, 'yyyy MMM') AS [Period],

	DATEDIFF(Day, [INVOICE].CreatedDate, GETDATE()) AS [Days Since Issued],
	CASE WHEN ([INVOICE].TotalInvoiceAmount - SUM([ALLOCATION].AMOUNT) = 0) THEN 'Paid'
	     WHEN ([INVOICE].TotalInvoiceAmount > SUM([ALLOCATION].AMOUNT)) THEN 'Partially'
	     ELSE [STATUS].Name 
	END AS [Status]
FROM billing.Invoice [INVOICE]
	INNER JOIN policy.[Policy] [POLICY] ON [INVOICE].PolicyId = [POLICY].PolicyId
	INNER JOIN [client].[FinPayee] [ACCOUNT] ON [POLICY].PolicyOwnerId = [ACCOUNT].RolePlayerId
	INNER JOIN [client].[RolePlayer] [ROLEPLAYER] ON [ACCOUNT].RolePlayerId = [ROLEPLAYER].RolePlayerId
	FULL OUTER JOIN [billing].InvoiceAllocation [ALLOCATION] ON [INVOICE].InvoiceId = [ALLOCATION].InvoiceId
	INNER JOIN common.InvoiceStatus [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
WHERE [INVOICE].InvoiceStatusId IN (2,4)
GROUP BY
	[ACCOUNT].FinPayeNumber,
	[ROLEPLAYER].DisplayName,
	[POLICY].PolicyNumber,
	[INVOICE].InvoiceNumber,
	[INVOICE].InvoiceDate,
	[INVOICE].CollectionDate,
	[INVOICE].TotalInvoiceAmount,
	[INVOICE].CreatedDate,
	[STATUS].Name
ORDER BY 
	[INVOICE].InvoiceDate,
	[ROLEPLAYER].DisplayName

SELECT [Debtor Account Number],
		[Debtor Name],
		[Policy Number],
		[Invoice Number],
		[Invoice Date],
		[Collection Date],
		[Invoice Amount],
		[Invoice Balance],
		[Period],
		[Days Since Issued],
		[Status]
 FROM @SearchTable WHERE [Status] != 'Paid' AND ((@StartDate IS NULL AND @EndDate IS NULL) OR [Invoice Date] BETWEEN @StartDate AND @EndDate)
