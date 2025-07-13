
---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/01/25
---- EXEC [policy].[BusinessYeartoDateReport] '2018-12-01', '2021-10-31'
---- =============================================
CREATE  PROCEDURE [policy].[BusinessYeartoDateReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL

AS
BEGIN

	declare @today date = getdate()

	IF OBJECT_ID(N'tempdb..#TempPolicyInsuredLives', N'U') IS NOT NULL
		DROP TABLE #TempPolicyInsuredLives;

		select count(policyid) Nooflives,
				policyid 
		into #TempPolicyInsuredLives
		from [policy].[PolicyInsuredLives] pil
		where (pil.EndDate >  EOMONTH(getdate()) or pil.EndDate is null) 
		group by policyid 

		IF OBJECT_ID(N'tempdb..##TempFinal', N'U') IS NOT NULL
			DROP TABLE #TempFinal;

		select 
 
			paPol.[PolicyNumber],
			[InceptionDate] = paPol.[PolicyInceptionDate],
			[InceptionMonth] = Month(paPol.[PolicyInceptionDate]),
			[InceptionYear] = Year(paPol.[PolicyInceptionDate]),
			[Week] = DATEDIFF(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, paPol.[CreatedDate]), 0), paPol.[CreatedDate]) +1,
			[CreationDate] = CAST(paPol.[CreatedDate] AS DATE),
			count(p.ParentPolicyId) AS [Lives],
			[Premium] = SUM(p.[InstallmentPremium]),
			[AnnualPremium] = SUM(p.[InstallmentPremium]) * 12 ,
			[Status] = cps.[Name],
			parp.DisplayName AS [Schemename],
			su.[DisplayName] AS [BrokerConsultant],
			CAST(paPol.[CreatedDate] AS DATE) AS [DateReceived],
			CAST (paPol.[ModifiedDate] AS DATE) AS [DateSent] ,
			br.[Name] AS [Broker Name],
		    br.[Code] AS [Broker Code]
		INTO #TempFinal
		from [policy].[Policy] p
					inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
					inner join [broker].[Brokerage] br on br.[Id] = p.[BrokerageId]
					inner join [broker].[Representative] brt on p.[RepresentativeId] = brt.[Id]
					inner join [common].[PaymentMethod] pm on pm.[Id] = p.[PaymentMethodId]
					inner join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
					inner join [common].[PaymentFrequency] cpfr ON p.[PaymentFrequencyId] = cpfr.[Id]
					--inner join Client.FinPayee cfp ON p.[PolicyOwnerId] = cfp.RolePlayerID
					left join [common].[PolicyCancelReason] cpcr ON p.[PolicyCancelReasonId] = cpcr.[Id] 
					left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
					left join [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
					left join #TempPolicyInsuredLives pil on pil.[PolicyId] = papol.[PolicyId]
					inner join [policy].[policyBroker] (NOLOCK) pb ON pb.PolicyId = p.PolicyId
					inner join [broker].[Representative] (NOLOCK) rep ON rep.Id = pb.RepId
					left join [broker].[BrokerageBrokerConsultant] (NOLOCK) bbc ON br.[Id] = bbc.[BrokerageId]
					inner join [security].[User] su ON bbc.UserId = su.Id
		WHERE p.policyid IN (SELECT PolicyId FROM [policy].[policy]
								WHERE PolicyStatusId = 1) 
		and paPol.[PolicyInceptionDate] >= @StartDate 
		and Year(paPol.[PolicyInceptionDate]) = YEAR(@today)
		and paRp.[RolePlayerIdentificationTypeId] = 2

		group by 
		paPol.[PolicyNumber],
	    paPol.[PolicyInceptionDate],
		--paPol.[PolicyInceptionDate],
		DATEDIFF(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, paPol.[CreatedDate]), 0), paPol.[CreatedDate]) +1,
		CAST(paPol.[CreatedDate] AS DATE),
		p.[InstallmentPremium],
		cps.[Name],
		parp.DisplayName,
		su.[DisplayName],
		CAST (paPol.[CreatedDate] AS DATE),
		CAST (paPol.[ModifiedDate] AS DATE),
		br.[Name],
		br.[Code]

	order by parp.DisplayName 

	select 
 
			[PolicyNumber],
			[InceptionDate],
			[InceptionMonth],
			[InceptionYear],
			--[Week],
			[CreationDate],
			Sum([Lives]) [Lives],
			Sum([Premium]) AS [Premium],
			Sum([AnnualPremium]) AS [AnnualPremium],
			[Status],
			[Schemename],
			[BrokerConsultant],
			[DateReceived],
			[DateSent],
			[Broker Name],
		    [Broker Code] 
	 FROM #TempFinal
	 group by 
			[PolicyNumber],
			[InceptionDate],
			[InceptionMonth],
			[InceptionYear],
			--[Week],
			[CreationDate],
			[Status],
			[Schemename],
			[BrokerConsultant],
			[DateReceived],
			[DateSent],
			[Broker Name],
		    [Broker Code]

END