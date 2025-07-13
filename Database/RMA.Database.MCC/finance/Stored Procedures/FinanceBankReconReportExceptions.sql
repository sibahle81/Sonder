
--exec  [finance].[FinanceBankReconReportExceptions] @StartDate='2022-01-11',@EndDate='2022-08-22'
CREATE PROCEDURE [finance].[FinanceBankReconReportExceptions]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN
		    SELECT PolicyReference as Policy_NR,
			ClaimReference as Claim_No,
			Payee as Name_Surname,
			'Rejected' as Status,
			Amount,
			Product,
			ErrorDescription as Comments
	FROM [payment].[Payment]  p
	WHERE p.PaymentStatusId = 4 AND
	CAST(p.RejectionDate as date) >= @StartDate AND
	CAST(p.RejectionDate as date) <= @EndDate
	ORDER by p.RejectionDate DESC

END