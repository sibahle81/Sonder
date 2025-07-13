---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/01/25
---- EXEC [policy].[PolicyIndividualLapseperBrokerReport] '2019-12-01', '2021-2-23'
---- =============================================
CREATE   PROCEDURE [policy].[PolicyIndividualLapseperBrokerReport]
	@StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL

AS
BEGIN

		  SELECT 
					DISTINCT
					p.[PolicyNumber],
					parp.DisplayName AS [Schemename],
					br.[Name] [BrokerName],
					cpn.[FirstName] [Name],
					cpn.[SurName],
					cpn.[IdNumber],
					pm.[Name] [PaymentMethod],
					cpfr.[Name] [PremiumFrequency],
					cps.[Name] [Status],
					p.[InstallmentPremium] [CurrentPremium],
					p.[CancellationDate] [DateCancelled],
					cpcr.[Name] [CancelReason],
					cpn.[DateOfDeath] [DeathDate],
					bi.[CollectionDate] DebitDate,
					bc.ErrorDescription [DebitOrderRejectionReason]

				from [policy].[Policy] p
				inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
				left join [billing].[Invoice] bi on p.[PolicyId] =bi.[PolicyId]
				inner join [broker].[Brokerage] br on br.[Id] = p.[BrokerageId]
				inner join [broker].[Representative] brt on p.[RepresentativeId] = brt.[Id]
				inner join [common].[PaymentMethod] pm on pm.[Id] = p.[PaymentMethodId]
				inner join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
				inner join [Client].[Person] cpn ON  r.[RolePlayerId] = cpn.[RolePlayerId]
				inner join [common].[PaymentFrequency] cpfr ON p.[PaymentFrequencyId] = cpfr.[Id]
				left join [billing].Collections bc ON bi.[InvoiceId] = bc.[InvoiceId]
				left join [common].[PolicyCancelReason] cpcr ON p.[PolicyCancelReasonId] = cpcr.[Id] 
				left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
				left join [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
				left join [common].[CollectionStatus] ccs ON bc.[CollectionStatusID] = ccs.[Id]
				where  bi.[CollectionDate]between @StartDate and @EndDate
				and ccs.[Name] ='Rejected'


		 
END
GO