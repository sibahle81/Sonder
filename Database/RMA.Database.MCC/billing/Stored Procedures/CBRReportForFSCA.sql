--USE [AZD-MCC]

---- ============================================================================
---- Author:    Farai Nyamajiwa
---- Create date: 2021-01-06
---- Description:      [Billing].[CBRReportForFSCA] '2018-01-01','2020-11-30'
---- ============================================================================

CREATE PROCEDURE [billing].[CBRReportForFSCA]
       @StartDate As Date,
       @EndDate AS Date
       
AS
BEGIN

--DECLARE       
--				@StartDate As Date,
--               @EndDate AS Date;
--SET         @StartDate = '2020-01-01'
--SET            @EndDate = '2021-02-02'

SELECT distinct
               pp.[PolicyNumber] AS [Policy number]
			  ,pp.[ClientReference] as AdsolPolicyNumber
              ,bb.[Name] AS [Broker]
              ,parp.DisplayName AS [Schemename]
              ,cp.[FirstName]
              ,cp.[Surname] 
              ,cp.[IdNumber] 
              ,pp.[CreatedDate] AS [Date policy was captured]
              ,pp.[PolicyInceptionDate] AS [Policy commencement date] 
              ,pp.[CancellationDate]
              ,pp.[LastLapsedDate]
              ,cps.[Name] AS [PolicyStatus]
              ,pp.[InstallmentPremium] AS [Policy premium]
			  ,pcr.Name AS [CancellationReason]
--select count(*)
FROM policy.policy pp
inner join [client].[RolePlayer] r on r.[RolePlayerId] = pp.[PolicyOwnerId]
--LEFT JOIN policy.PolicyInsuredLives pil ON pp.PolicyId = pil.PolicyId 
LEFT JOIN policy.PolicyBroker pb ON pp.PolicyId = pb.PolicyId 
LEFT JOIN broker.Brokerage bb ON pb.BrokerageId = bb.id 
LEFT JOIN product.ProductOption ppo ON pp.ProductOptionId = ppo.Id
LEFT JOIN client.Person cp ON r.RolePlayerId = cp.RolePlayerId
LEFT JOIN Common.PolicyStatus cps ON pp.PolicyStatusId = cps.Id
LEFT JOIN Common.PolicyCancelReason pcr ON pp.PolicyCancelReasonId = pcr.Id
left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = pp.ParentPolicyId
left join [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
WHERE pp.[PolicyInceptionDate] BETWEEN @StartDate AND @EndDate
order by pp.[PolicyNumber]


END
GO


