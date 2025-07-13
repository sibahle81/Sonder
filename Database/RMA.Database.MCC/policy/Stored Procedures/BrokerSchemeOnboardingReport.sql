
CREATE PROCEDURE [policy].[BrokerSchemeOnboardingReport]
       @StartDate As Date,
       @EndDate AS Date

AS
BEGIN

------Insured Lives----

IF OBJECT_ID(N'tempdb..#TempPolicyInsuredLives', N'U') IS NOT NULL
           DROP TABLE #TempPolicyInsuredLives;

           select count(policyid) Nooflives,
            policyid 
                into #TempPolicyInsuredLives
                from [policy].[PolicyInsuredLives]
                group by policyid

select r.DisplayName as SchemeName,
       p.PolicyNumber,
	   p.PolicyInceptionDate as SchemeOnboardingDate,
	   r.CreatedDate as SchemeCreatedDate,
	   bb.[Name] as BrokerName,
       bb.CreatedDate as BrokerOnboardingDate,
	   [agent].FirstName + ' ' + [agent].SurnameOrCompanyName AS [RepresentativeName],
	   count(distinct pil.RolePlayerId) AS [Lives]
from client.RolePlayer r
inner join [policy].[Policy] p on p.PolicyOwnerId = r.RolePlayerId
--inner join @ParentPolicies pp on pp.ParentPolicyId = p.PolicyId
--inner join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
left join [policy].[Policy] papol (nolock) on p.PolicyId = papol.ParentPolicyId
inner join client.Company cc (nolock)  on r.RolePlayerId = cc.RolePlayerId
left join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = papol.PolicyId
left join [broker].brokerage bb (nolock) on p.BrokerageId =bb.Id
left join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
left join #TempPolicyInsuredLives tpil on tpil.[PolicyId] = p.[PolicyId]
where (p.PolicyInceptionDate between @StartDate and @EndDate)
or (bb.CreatedDate between @StartDate and @EndDate)

Group by r.DisplayName,
		   p.PolicyNumber,
		   p.PolicyInceptionDate,
		   r.CreatedDate,
		   bb.[Name],
		   bb.CreatedDate,
		   [agent].FirstName + ' ' + [agent].SurnameOrCompanyName


END