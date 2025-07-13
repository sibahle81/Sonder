CREATE PROCEDURE [policy].[FuneralNewGroupBusinessReport]
		@StartDate As Date
AS
BEGIN

	IF OBJECT_ID(N'tempdb..#TempNewGroups', N'U') IS NOT NULL
			DROP TABLE #TempNewGroups;

	Select
			DISTINCT
			[PolicyHolderName] = parp.[DisplayName],
			ICD.[Name] AS [IndustryClass],
			[brokerage].[Name] AS [BrokerName],
			[parp].DisplayName AS [Schemename],
										 [brokerage].[Name] + [parp].DisplayName AS BrokerScheme,
			FIRST_VALUE((YEAR(p.[CreatedDate]) * 100) + (MONTH(p.[CreatedDate]))) OVER (PARTITION BY [parp].DisplayName ORDER BY (YEAR(p.[CreatedDate]) * 100) + (MONTH(p.[CreatedDate])) ASC) AS [CreatedDateYearMonth],
			Case when cps.[Name] in ('Cancelled','Lapsed','Not Taken Up','Pending Cancelled',
							'Paused','Pending Continuation') 
			then 'Cancelled' 
		when  cps.[Name] in ('Pending First Premium') then 'Active' else cps.[Name] end AS OverallStatus

	INTO #TempNewGroups
	FROM [policy].[Policy] p 
		inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
		LEFT JOIN policy.PolicyInsuredLives pil ON p.PolicyId = pil.PolicyId
		left join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
		left join [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
		left join Client.FinPayee cfp ON papol.[PolicyOwnerId] = cfp.RolePlayerID 
		left join [common].[Industry] IC ON IC.Id =cfp.IndustryId
		left join [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId	
		left join [broker].Brokerage [brokerage] ON [BROKERAGE].Id = p.BrokerageId
		left join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
		left join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
		left join [Client].Company ccmp ON r.RolePlayerId = ccmp.RolePlayerId
		left join [Common].CancellationReason ccr ON p.[PolicyCancelReasonId] =ccr.[Id]
		inner join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
		left join [common].[RepType] crt ON agent.RepTypeId = crt.[Id]
		LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = p.ProductOptionId
		LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id


		Where pil.[RolePlayerTypeId] = 10
	
		GROUP BY 
			parp.[DisplayName],	
			(YEAR(p.[PolicyInceptionDate]) * 100) + (MONTH(p.[PolicyInceptionDate])) ,
			ICD.[Name],
			[brokerage].[Name],
			(YEAR(p.[CreatedDate]) * 100) + (MONTH(p.[CreatedDate])) ,
			cps.[Name]
	 ORDER BY [parp].DisplayName

		SELECT * FROM #TempNewGroups 
		WHERE [CreatedDateYearMonth] =(YEAR(@StartDate) * 100) + (MONTH(@StartDate)) 
		AND OverallStatus ='Active'

END
GO