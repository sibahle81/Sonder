-- ============================================================================
-- Author:Mbali Mkhize
-- Create date: 2020-11-23
-- Description:	[Claim].[ConductOfBusinessReturnReportClaim] '2018-01-01','2020-11-30'
-- ============================================================================

CREATE PROCEDURE [claim].[ConductOfBusinessReturnReportClaim]
	@StartDate As Date,
	@EndDate AS Date
	
AS

--DECLARE @StartDate AS DATE ='2018-09-01'
--DECLARE	@EndDate AS DATE ='2020-12-30'
BEGIN
	DECLARE @MonthYear INT

	SET @MonthYear =(YEAR(@EndDate) * 100) + (MONTH(@EndDate))
	
	IF OBJECT_ID(N'tempdb..#TempClaimPolicy', N'U') IS NOT NULL
		DROP TABLE #TempClaimPolicy;

		SELECT 
			CASE WHEN ICD.Id = 4 THEN
			(SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
			WHEN ICD.Id = 1  THEN 
			(SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
			WHEN ICD.Id = 2 THEN 
			(SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
			WHEN ICD.Id = 3 THEN 
			(SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
			END AS ControlNumber
			, CASE WHEN ICD.Id = 4 THEN
			(SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
			WHEN ICD.Id = 1 THEN 
			(SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1) 
			WHEN ICD.Id = 2 THEN 
			(SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2) 
			WHEN ICD.Id = 3 THEN 
			(SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
			END AS ControlName,
		   1 AS [ClaimCount],
		   clm.[ClaimId],
		   clm.[CreatedDate],
		   [Status] AS [ClaimStatus],
		   ISNULL(cia.[AssessedAmount],0) AS [AssessedAmount] 
    INTO #TempClaimPolicy
	FROM [claim].[Claim] clm
	INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.[PolicyId]
	INNER JOIN [claim].[ClaimStatus] (NOLOCK) ccs ON clm.[ClaimStatusId] = ccs.[ClaimStatusId]
	INNER JOIN Client.[RolePlayer] crp ON crp.RolePlayerId = pol.PolicyOwnerId
	LEFT JOIN [claim].[ClaimInvoice] (NOLOCK) cci ON cci.ClaimId = clm.[ClaimId]
	LEFT JOIN [claim].[InvoiceAllocation] (NOLOCK) cia ON cci.[ClaimInvoiceId] = cia.[ClaimInvoiceId]
	LEFT JOIN Client.FinPayee cfp ON crp.RolePlayerId = cfp.RolePlayerID 
	LEFT JOIN [common].[Industry] IC ON IC.Id =cfp.IndustryId
	LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
	WHERE clm.[CreatedDate] BETWEEN @StartDate AND @EndDate 


	---FINAL SELECT

	SELECT [tcp].[ClaimCount],
		   [tcp].[CreatedDate],
		   [tcp].[ClaimStatus],
		   [tcp].[AssessedAmount] ,	
		   [tcp].[ControlName], 
			CASE WHEN [tcp].[ControlName] LIKE '%Group%' THEN 'Group'
				 WHEN [tcp].[ControlName] IS NULL THEN NULL ELSE 'Individual' END AS 'FuneralType'				 
	FROM #TempClaimPolicy tcp


END
GO


