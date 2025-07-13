CREATE PROCEDURE [finance].[PaymentRefundReport]
	@StartDate As Date,
	@EndDate AS Date
AS
	BEGIN
		SELECT DISTINCT 
case when trns.[TransactionDate] IS	null then py.SubmissionDate else trns.[TransactionDate] end AS DATE
,py.Amount						AS AmountReceived
,trns.[BankReference]			AS [BankReference]
,py.AccountNo					AS [Bank Account Number]
,pt.Name						AS [Transaction Type]
,CASE WHEN ps.Name = 'Paid' THEN 'ALLOCATED' ELSE 'UNALLOCATED' END AS  [Status]



FROM 
	[claim].[Claim] (NOLOCK) clm 
	INNER JOIN [payment].[Payment] (NOLOCK) py ON clm.claimid = py.claimid			
	LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.PolicyId
	LEFT JOIN [billing].[Invoice] (NOLOCK) inv ON pol.PolicyId = inv.PolicyId
	LEFT JOIN [billing].[Transactions] (NOLOCK) trns ON trns.InvoiceId = inv.Invoiceid 
    INNER JOIN [common].[PaymentType] pt (NOLOCK) ON py.PaymentTypeId = pt.Id 
	LEFT JOIN [common].[PaymentStatus] ps (NOLOCK) ON ps.Id = py.PaymentStatusId and pt.Id IN (1,7)
	 
	WHERE 
	--trns.TransactionTypeId = 8 AND 
	trns.TransactionDate BETWEEN @StartDate AND @EndDate 
    ORDER BY DATE DESC

	END