CREATE PROCEDURE [policy].[GetFreeCoverPolicyDetails] 
AS
SELECT distinct
pp.PolicyNumber,
pp.PolicyId,
pp.PolicyInceptionDate 'FreeCoverStartDate',
DATEADD(day, 60, pp.PolicyInceptionDate) 'FreeCoverEndDate',
DATEDIFF(day, pp.PolicyInceptionDate, GETDATE()) 'PolicyAge',
cps.[Name] 'PolicyStaus',
'Individual' 'ClientType', 
--prb.[Name] 'Benefits',
ppo.[Name] as 'Product Option',
policy.CalculatTotalPolicyCover(pp.PolicyId) 'TotalCoverAmount',
policy.CalculateLivesOnPolicy(pp.PolicyId) 'InsuredLives',
Case when ple.AffordabilityCheckPassed = 1 then 'Affordable' else 'Not Affordable' end 'AffordabilityStatus'

from policy.Policy  pp WITH (NOLOCK)
inner join policy.PolicyLifeExtension ple WITH (NOLOCK) on pp.PolicyId = ple.PolicyId
inner join common.PolicyStatus cps WITH (NOLOCK) on pp.PolicyStatusId = cps.Id
inner join product.ProductOption ppo WITH (NOLOCK) on ppo.Id = pp.ProductOptionId
inner join [policy].[PolicyBenefit] pb  WITH (NOLOCK) on pb.PolicyId = pp.PolicyId
inner join product.benefit prb WITH (NOLOCK) on prb.Id = pb.BenifitId
inner join [policy].PolicyInsuredLives pil WITH (NOLOCK) on pp.PolicyId = pil.PolicyId
inner join Client.Person ccp WITH (NOLOCK) on ccp.RolePlayerId =  pil.RolePlayerId
where pp.PolicyStatusId = 20