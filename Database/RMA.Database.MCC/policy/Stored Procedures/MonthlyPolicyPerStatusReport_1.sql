




---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/01/25
---- EXEC [policy].[MonthlyPolicyPerStatusReport] '2019-01-01', '2021-01-28','Active'
---- =============================================
CREATE   PROCEDURE [policy].[MonthlyPolicyPerStatusReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL,
	@Status AS INT

AS
BEGIN

--DECLARE @StartDate AS DATE = '2019-10-01'
--DECLARE	@EndDate AS DATE = '2020-10-31'

IF @Status = 0

		  SELECT 
					DISTINCT
					p.[PolicyNumber],
					parp.DisplayName AS [Schemename],
					br.[Name] [BrokerName],
					cpn.[FirstName] [Name],
					cpn.[SurName],
					cpn.[IdNumber],
					'' [Gender],
					pm.[Name] [PaymentMethod],
					cpfr.[Name] [PremiumFrequency],
					cps.[Name] [Status],
					p.[InstallmentPremium] [CurrentPremium],
					 '' AS   [CancelDate],
					p.[CancellationDate] [DateCancelled],
					cpcr.[Name] [CancelReason],
					cpn.[DateOfDeath] [DeathDate]

				from [policy].[Policy] p
				inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
				inner join [broker].[Brokerage] br on br.[Id] = p.[BrokerageId]
				inner join [broker].[Representative] brt on p.[RepresentativeId] = brt.[Id]
				inner join [common].[PaymentMethod] pm on pm.[Id] = p.[PaymentMethodId]
				inner join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
				inner join [Client].[Person] cpn ON  r.[RolePlayerId] = cpn.[RolePlayerId]
				inner join [common].[PaymentFrequency] cpfr ON p.[PaymentFrequencyId] = cpfr.[Id]
				left join [common].[PolicyCancelReason] cpcr ON p.[PolicyCancelReasonId] = cpcr.[Id] 
				--left join [bpm].[Wizard] w ON w.LinkedItemId = p.PolicyId
				left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
				left join [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
				where (p.[CancellationDate] between @StartDate and @EndDate
					 or p.[PolicyInceptionDate] between @StartDate and @EndDate
					 or p.[LastReinstateDate] between @StartDate and @EndDate
					 or p.[LastLapsedDate] between @StartDate and @EndDate
					 or p.[PolicyPauseDate] between @StartDate and @EndDate )
	 ELSE

	 SELECT 
					DISTINCT
					p.[PolicyNumber],
					parp.DisplayName AS [Schemename],
					br.[Name] [BrokerName],
					cpn.[FirstName] [Name],
					cpn.[SurName],
					cpn.[IdNumber],
					'' [Gender],
					pm.[Name] [PaymentMethod],
					cpfr.[Name] [PremiumFrequency],
					cps.[Name] [Status],
					p.[InstallmentPremium] [CurrentPremium],
					 '' AS   [CancelDate],
					p.[CancellationDate] [DateCancelled],
					cpcr.[Name] [CancelReason],
					cpn.[DateOfDeath] [DeathDate]

				from [policy].[Policy] p
				inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
				inner join [broker].[Brokerage] br on br.[Id] = p.[BrokerageId]
				inner join [broker].[Representative] brt on p.[RepresentativeId] = brt.[Id]
				inner join [common].[PaymentMethod] pm on pm.[Id] = p.[PaymentMethodId]
				inner join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
				inner join [Client].[Person] cpn ON  r.[RolePlayerId] = cpn.[RolePlayerId]
				inner join [common].[PaymentFrequency] cpfr ON p.[PaymentFrequencyId] = cpfr.[Id]
				left join [common].[PolicyCancelReason] cpcr ON p.[PolicyCancelReasonId] = cpcr.[Id] 
				--left join [bpm].[Wizard] w ON w.LinkedItemId = p.PolicyId
				left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
				left join [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
				where cps.[Id] = @Status
				and (p.[CancellationDate] between @StartDate and @EndDate
					 or p.[PolicyInceptionDate] between @StartDate and @EndDate
					 or p.[LastReinstateDate] between @StartDate and @EndDate
					 or p.[LastLapsedDate] between @StartDate and @EndDate
					 or p.[PolicyPauseDate] between @StartDate and @EndDate )

 
END