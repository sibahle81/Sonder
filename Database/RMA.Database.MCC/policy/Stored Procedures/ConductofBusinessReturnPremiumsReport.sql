



---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/02/15
---- EXEC [policy].[ConductofBusinessReturnPremiumsReport]
---- =============================================
CREATE PROCEDURE [policy].[ConductofBusinessReturnPremiumsReport]

AS
BEGIN

DECLARE @CurrentYearMonth INT,
		@CurrentQ1 INT,
		@CurrentQ2 INT,
		@CurrentQ3 INT,
		@CurrentQ4 INT,
		@PrevQ1 INT,
		@PrevQ2 INT,
		@PrevQ3 INT,
		@PrevQ4 INT,
		@PremiumPrevQ1 BIGINT,
		@PremiumPrevQ2 BIGINT,
		@PremiumPrevQ3 BIGINT,
		@PremiumPrevQ4 BIGINT,
		@PremiumCurrQ1 BIGINT,
		@PremiumCurrQ1A BIGINT,
		@PremiumCurrQ1B BIGINT,
		@PremiumCurrQ1C BIGINT,
		@PremiumCurrQ2 BIGINT,
		@PremiumCurrQ3 BIGINT,
		@PremiumCurrQ4 BIGINT

	SET @CurrentYearMonth =(YEAR(GETDATE()) * 100) + (MONTH(GETDATE()))
	SET @CurrentQ1 = (YEAR(GETDATE()) * 100) + 03
	SET @CurrentQ2 =(YEAR(GETDATE()) * 100) + 06
	SET @CurrentQ3 = (YEAR(GETDATE()) * 100) + 09
	SET @CurrentQ4 = (YEAR(GETDATE()) * 100) + 12
	SET @PrevQ1 =((YEAR(GETDATE()) -1) * 100) + 03
	SET @PrevQ2 =((YEAR(GETDATE()) -1) * 100) + 06
	SET @PrevQ3 =((YEAR(GETDATE()) -1) * 100) + 09
	SET @PrevQ4 =((YEAR(GETDATE()) -1) * 100) + 12


	IF OBJECT_ID(N'tempdb..#TempCBR', N'U') IS NOT NULL
		DROP TABLE #TempCBR;

	SELECT           
	CASE WHEN ICD.Id = 4 THEN
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
        WHEN ICD.Id = 1  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
		WHEN ICD.Id = 2  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
		WHEN ICD.Id = 3  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
    END AS [ControlName], 
		[PolicyHolderName] = parp.[DisplayName],
		cpn.FirstName  AS [Name],
		cpn.Surname AS [Surname],
		cpn.[IdNumber],
		'' AS [PassportNumber],
		p.[PolicyNumber],
		p.[ClientReference] AS AdsolPolicyNumber,
		p.[PolicyInceptionDate] AS [CommenceDate] ,
		(YEAR(p.[PolicyInceptionDate]) * 100) + (MONTH(p.[PolicyInceptionDate])) AS [PolicyInceptionYearMonth],
		YEAR(p.[PolicyInceptionDate]) AS [PolicyInceptionYear],
		MONTH(p.[PolicyInceptionDate]) AS [PolicyInceptionMonth],
		[CreationDate] = CAST(papol.[CreatedDate] AS DATE),
		p.[InstallmentPremium] AS [CurrentPremium],
		ICD.[Name] AS [IndustryClass],
		[brokerage].[Name] AS [BrokerName],
		[parp].DisplayName AS [Schemename],
		[agent].FirstName + ' ' + [agent].SurnameOrCompanyName AS [AgentName],
		cps.[Name] AS [Status],
		papol.[CancellationDate],
		ccr.[Name] AS [CancelReason],
		cpn.[DateOfDeath] AS [DeathDate],
		CAST(p.[CreatedDate] AS DATE) AS [ApplicatioDate],
		[brokerage].[Name] + [parp].DisplayName AS BrokerScheme,
	   CASE WHEN crt.Name LIKE 'Natural' AND [brokerage].[Name] LIKE '%RAND MUTUAL%' THEN 'RMA Written business'
			WHEN crt.Name LIKE 'Juristic' THEN 'Juristic rep written business'
			WHEN crt.Name LIKE 'Natural' AND [brokerage].[Name] NOT LIKE '%RAND MUTUAL%'  THEN 'Independent brokers written business'
			END AS Underwritter


	
	INTO #TempCBR
	--select count(*)--64446
	FROM [policy].[Policy] p 
	inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
	inner join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
	inner join [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
	inner join Client.FinPayee cfp ON papol.[PolicyOwnerId] = cfp.RolePlayerID 
	inner join [common].[Industry] IC ON IC.Id =cfp.IndustryId
	inner join [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId	
	inner join [broker].Brokerage [brokerage] ON [BROKERAGE].Id = p.BrokerageId
	inner join [common].[PolicyStatus] cps ON papol.[PolicyStatusId] = cps.[Id]
	left join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
	left join [Client].Company ccmp ON r.RolePlayerId = ccmp.RolePlayerId
	left join [Common].CancellationReason ccr ON papol.[PolicyCancelReasonId] =ccr.[Id]
	inner join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
	left join [common].[RepType] crt ON agent.RepTypeId = crt.[Id]



	SET @PremiumPrevQ1 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] <= @PrevQ1)
	SET @PremiumPrevQ2 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] <= @PrevQ2)
	SET @PremiumPrevQ3 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] <= @PrevQ3)
	SET @PremiumPrevQ4 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] <= @PrevQ4)
	SET @PremiumCurrQ1 =(SELECT ISNULL(SUM([CurrentPremium]),0) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @PrevQ4 AND [PolicyInceptionYearMonth] <= @CurrentQ1 
						 AND Underwritter ='Juristic rep written business')
	SET @PremiumCurrQ1A =(SELECT ISNULL(SUM([CurrentPremium]),0) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @PrevQ4 AND [PolicyInceptionYearMonth] <= @CurrentQ1
						AND Underwritter ='Independent')
	SET @PremiumCurrQ1B =(SELECT ISNULL(SUM([CurrentPremium]),0) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @PrevQ4 AND [PolicyInceptionYearMonth] <= @CurrentQ1
						AND Underwritter ='RMA Written business')
	SET @PremiumCurrQ1C =(SELECT ISNULL(SUM([CurrentPremium]),0) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @PrevQ4 AND [PolicyInceptionYearMonth] <= @CurrentQ1
						AND Underwritter ='Other')
	SET @PremiumCurrQ2 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @CurrentQ1 AND [PolicyInceptionYearMonth] <= @CurrentQ2)
	SET @PremiumCurrQ3 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @CurrentQ2 AND [PolicyInceptionYearMonth] <= @CurrentQ3)
	SET @PremiumCurrQ4 =(SELECT SUM([CurrentPremium]) FROM #TempCBR WHERE [PolicyInceptionYearMonth] > @CurrentQ3 AND [PolicyInceptionYearMonth] <= @CurrentQ4)

	
		SELECT 
		CASE WHEN [ControlName] LIKE '%Group%' THEN 'Group'
		WHEN [ControlName] IS NULL THEN NULL ELSE 'Individual' END AS 'FuneralType',
		@PremiumPrevQ1 AS PremiumPrevQ1,
		@PremiumPrevQ2 AS PremiumPrevQ2,
		@PremiumPrevQ3 AS PremiumPrevQ3,
		@PremiumPrevQ4 AS PremiumPrevQ4,
		@PremiumCurrQ1 AS PremiumCurrQ1,
		@PremiumCurrQ1A AS PremiumCurrQ1A,
		@PremiumCurrQ1B AS PremiumCurrQ1B,
		@PremiumCurrQ1C AS PremiumCurrQ1C,
		@PremiumCurrQ2 AS PremiumCurrQ2,
		@PremiumCurrQ3 AS PremiumCurrQ3,
		@PremiumCurrQ4 AS PremiumCurrQ4,
		[Status],
		Underwritter
		FROM #TempCBR


END