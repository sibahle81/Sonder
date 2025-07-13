-- ============================================================================
-- Author:Mbali Mkhize
-- Create date: 2020-11-23
-- Description:	[Policy].[ConductOfBusinessReturnReport] '2012-01-01','2020-12-30'
-- ============================================================================

CREATE   PROCEDURE [policy].[ConductOfBusinessReturnReport]
	@StartDate As Date,
	@EndDate AS Date
	
AS

BEGIN

	--DECLARE @StartDate AS DATE ='2016-01-01'
	--DECLARE	@EndDate AS DATE ='2020-11-30'

	DECLARE @MonthYear INT


	SET @MonthYear =(YEAR(@EndDate) * 100) + (MONTH(@EndDate))
	
	IF OBJECT_ID(N'tempdb..#TempPolicy', N'U') IS NOT NULL
		DROP TABLE #TempPolicy;


			SELECT DISTINCT
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
			  pp.[PolicyId],
			  pp.[PolicyNumber],
			  cps.[Name] AS [PolicyStatus],
			  pp.[PolicyInceptionDate],
			  pp.[CancellationDate],
			  (YEAR(pp.[PolicyInceptionDate]) * 100) + (MONTH(pp.[PolicyInceptionDate])) AS [PolicyInceptionYearMonth],
			  (DATEDIFF(month,pp.[PolicyInceptionDate],pp.[CancellationDate])) AS LagPolicytoCancelationDate,
			  pp.[AnnualPremium],
			  cpcr.[Name] AS [CancellationReason],
			  1 AS [PolicyCount], 
			  COUNT(pb.Id) AS [BenefitCount] -- FN added
		INTO #TempPolicy 
		FROM [Policy].[Policy] pp 
		INNER JOIN Client.[RolePlayer] crp ON crp.RolePlayerId = pp.PolicyOwnerId
		LEFT JOIN Client.FinPayee cfp ON crp.RolePlayerId = cfp.RolePlayerID 
		LEFT JOIN [common].[Industry] IC ON IC.Id =cfp.IndustryId
		LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
		LEFT JOIN [Common].[PolicyStatus] cps ON pp.[PolicyStatusId] =cps.[Id]
		LEFT JOIN [Common].[PolicyCancelReason] cpcr ON pp.[PolicyCancelReasonId] =cpcr.[Id]
		LEFT JOIN Product.ProductOption ppo ON pp.ProductOptionId = ppo.Id
        LEFT JOIN product.ProductOptionBenefit pob ON ppo.Id = pob.ProductOptionId
        LEFT JOIN product.Benefit pb ON pob.BenefitId = pb.Id
		GROUP BY

			  ICD.Id, 
			  pp.[PolicyId],
			  pp.[PolicyNumber],
			  cps.[Name],
			  pp.[PolicyInceptionDate],
			  pp.[CancellationDate],
			  pp.[PolicyInceptionDate],
			  pp.[CancellationDate],
			  pp.[AnnualPremium],
			  cpcr.[Name] 

--Commissions 

	IF OBJECT_ID(N'tempdb..#TempCommissions', N'U') IS NOT NULL
		DROP TABLE #TempCommissions;


		select Distinct
				ch.RecepientId,
				ch.RecepientCode,
				ch.RecepientName,
				ch.FitAndProperCheckDate,
				ch.TotalHeaderAmount,
				cd.PolicyNumber,
				cd.AllocatedAmount,
				cd.CommissionAmount,
				cd.AdminServiceFeeAmount,
				cd.CreatedDate,
				crt.Name AS RepType,
				rr.Name AS RepRole,
				bb.LegalCapacity,
				bb.Name As Brokerage,
				CASE WHEN bb.Name NOT LIKE  '%Rand Mutual%' THEN 'BROKER'
				     WHEN bb.Name LIKE  '%Rand Mutual%' THEN 'RMA INTERNAL STAFF'
				END AS Broker,
				CASE WHEN rr.Name LIKE 'Key Individual' THEN 'Face-to-face by insurer’s own individual representatives (“tied agents”);'
					 WHEN rr.Name LIKE 'Representative' THEN 'Face-to-face by insurer"s juristic representatives; '
					 WHEN rr.Name LIKE 'Sole Proprietor' THEN 'Face-to-face by independent intermediaries (FSP’s that are not representatives of the insurer);'
					 ELSE 'Other' END AS Communication,
		        
				CASE WHEN crt.Name LIKE 'Juristic' THEN 'Juristic'
					 WHEN crt.Name NOT LIKE 'Juristic' AND LegalCapacity = 'Natural Person' THEN 'Individually risk rated'
					 WHEN crt.Name NOT LIKE 'Juristic' AND LegalCapacity = 'Company' THEN 'Individually underwritten on a group basis'
					 ELSE 'Other' END AS Underwritter
		INTO #TempCommissions 
		FROM [commission].[Header] ch
		LEFT JOIN [commission].[Detail] cd ON ch.HeaderId = cd.HeaderId
		LEFT JOIN [broker].[Representative] br ON cd.RepCode = br.Code
		LEFT JOIN [broker].[BrokerageRepresentative] bbr ON br.Id = bbr.RepresentativeId
		LEFT JOIN [broker].[Brokerage] bb ON bbr.BrokerageId = bb.[Id]
		LEFT JOIN [common].[RepType] crt ON br.RepTypeId = crt.[Id]
		LEFT JOIN [common].[RepRole] rr ON bbr.RepRoleId = rr.[Id]
		where br.[IsDeleted] = 0
		AND bbr.[IsDeleted] = 0
		AND cd.CreatedDate BETWEEN @StartDate AND @EndDate 

	--Final Select


	 SELECT  distinct
			  tp.[ControlName],
			  CASE WHEN tp.[ControlName] LIKE '%Group%' THEN 'Group'
				   WHEN tp.[ControlName] IS NULL THEN NULL ELSE 'Individual' END AS 'FuneralType',
			  tp.[PolicyId],
			  tp.[PolicyStatus],
			  tp.[PolicyInceptionYearMonth],
			  tp.LagPolicytoCancelationDate,
			  tp.[AnnualPremium],
			  tp.[PolicyCount],
			  tp.[BenefitCount],
			  tp.[PolicyInceptionDate],
			  tp.[CancellationDate],
			  tc.[Communication],
			  tc.[Underwritter],
			  tc.[Broker],
			  tp.[CancellationReason]
	FROM #TempPolicy tp 
	LEFT JOIN #TempCommissions tc ON (tp.[PolicyNumber] = tc.[PolicyNumber])
	
END
GO


