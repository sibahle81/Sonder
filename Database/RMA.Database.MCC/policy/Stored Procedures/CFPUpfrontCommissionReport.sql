CREATE proc [policy].[CFPUpfrontCommissionReport]
as
/*
exec [policy].CFPUpfrontCommissionReport
*/
begin 
(select *,
[YEARS TO EXIT]*[Premium]*12*0.0325 as 'LTCOMM',
[Premium]*12*0.85 as 'FYC 85%',
CASE WHEN [YEARS TO EXIT]*[Premium]*12*0.0325 < [Premium]*12*0.85 THEN [YEARS TO EXIT]*[Premium]*12*0.0325 ELSE   [YEARS TO EXIT]*[Premium]*12*0.0325 END AS 'PRIMARY COMMISSION' 
 from
(
select  distinct
       br.IdNumber as 'BROKER REP', 
       ccp.IdNumber as 'POLICY MAIN LIFE', 
	   pp.CreatedDate as 'CAPTURE DATE',
       crt.[Name] as 'MEMBER TYPE' ,
	   case when ple.AffordabilityCheckPassed = 1 then 'Affordable'  else 'Not Affordable' end as 'AFFORDABILITY STATUS',
       pp.PolicyNumber as 'POLICY NUMBER',
	   cp.DateOfBirth as 'DATE OF BIRTH',
	    pp.PolicyInceptionDate AS 'POLICY INCEPTION DATE',
       DATEDIFF(year,
       cp.DateOfBirth, pp.PolicyInceptionDate) +  1 AS 'AGE NEXT BIRTHDAY',
       Case WHEN 
		(22-(Datediff(year,[policy].[GetPolicyYoungestChild](pp.PolicyId),pp.PolicyInceptionDate)+1)) <0 THEN 0
		ELSE (22-(Datediff(year,[policy].[GetPolicyYoungestChild](pp.PolicyId),pp.PolicyInceptionDate)+1)) END 
		as 'YEARS TO EXIT',
		pil.premium as 'PREMIUM'
from policy.Policy (NOLOCK) pp 
inner join policy.PolicyLifeExtension (NOLOCK) ple on ple.PolicyId = pp.PolicyId 
inner join policy.PolicyInsuredLives (NOLOCK) pil on pil.PolicyId = pp.PolicyId
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pil.RolePlayerId
inner join [client].[RolePlayerType] crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
inner join broker.Representative(NOLOCK)  br on pp.RepresentativeId = br.Id
inner join Client.Person (NOLOCK) ccp on ccp.RolePlayerId =  pp.PolicyOwnerId
inner join product.ProductOption(NOLOCK)  po on pp.ProductOptionId = po.Id
where ple.AffordabilityCheckPassed = 1 and crt.[Name] = 'Child'
union
(select  distinct
       br.IdNumber as 'BROKE RREP', 
       ccp.IdNumber as 'POLICY MAIN LIFE', 
	   pp.CreatedDate as 'CAPTURE DATE',
       crt.[Name] as 'MEMBER TYPE' ,
	   case when ple.AffordabilityCheckPassed = 1 then 'Affordable'  else 'Not Affordable' end as 'AFFORDABILITY STATUS',
       pp.PolicyNumber as 'POLICY NUMBER',
	   cp.DateOfBirth as 'DATE OF BIRTH',
	    pp.PolicyInceptionDate AS 'POLICY INCEPTIONDATE',
       DATEDIFF(year,
       cp.DateOfBirth, pp.PolicyInceptionDate) +  1 AS 'AGENEXT BIRTHDAY',
        CASE WHEN 75-(1+Datediff(year,cp.DateOfBirth,pp.PolicyInceptionDate)) between 0 and 10 THEN 10
		WHEN 75-(1+Datediff(year,cp.DateOfBirth,pp.PolicyInceptionDate)) <0 THEN 0
			 ELSE (75-(Datediff(year,cp.DateOfBirth,pp.PolicyInceptionDate)+1))   
		END 
		'YEARSTOEXIT',
		--pil.premium -
		--		  CASE WHEN (crt.[Name] like '%Main Member%' and po.[Name] like 'Consolidated Funeral Plus') THEN 9.13
		--			  WHEN (crt.[Name] like '%Main Member%' and po.[Name] like 'Consolidated Funeral Basic') THEN 1.53
		--			  ELSE 0 END AS 'PREMIUM'
		pil.premium  'PREMIUM'
from policy.Policy (NOLOCK) pp 
inner join policy.PolicyLifeExtension (NOLOCK) ple on ple.PolicyId = pp.PolicyId 
inner join policy.PolicyInsuredLives (NOLOCK) pil on pil.PolicyId = pp.PolicyId
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pil.RolePlayerId
inner join [client].[RolePlayerType] crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
inner join broker.Representative(NOLOCK)  br on pp.RepresentativeId = br.Id
inner join Client.Person (NOLOCK) ccp on ccp.RolePlayerId =  pp.PolicyOwnerId
inner join product.ProductOption(NOLOCK)  po on pp.ProductOptionId = po.Id
where ple.AffordabilityCheckPassed = 1 and crt.[Name] <> 'Child')) as final)
end