--exec  [finance].[RejectionReport] @DateFrom='2020-03-30',@DateTo='2020-06-26'
CREATE PROCEDURE [finance].[RejectionReport]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN
	 	
	SELECT P.[Reference] AS [TranId],
		   P.[Product] AS [TranType],
		   P.[ClaimReference] AS [Claim No],
		   P.[Payee] AS [Name],
		   P.[Product] AS [Policy Type],
		   PRC.[BriefDescription] AS [Rejection Reason],
		   P.[Amount] AS [Rejected Amount],
		   P.[RejectionDate] AS [Rejection Date],
		   P.[Modifiedby] AS [Rejected By],
		   P.[Modifiedby] AS [Authorised By]
	FROM [payment].[Payment] P (NOLOCK)
	LEFT JOIN [payment].[PaymentRejectionCode] PRC (NOLOCK) ON P.[ErrorCode] = PRC.[Code] AND  PRC.IsDeleted = 0 AND PRC.IsActive = 1
	WHERE P.[RejectionDate] IS NOT NULL AND CAST(RejectionDate AS DATE) >= @StartDate and CAST(RejectionDate AS DATE) <= @EndDate

END
