 CREATE PROCEDURE [policy].[GetPolicyAnnualIncreases] @wizardId int
AS BEGIN
select 

	pp.PolicyId,
	crt.[Name] as 'Role Player Type',

	case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1.05)
	else  pil.Premium*(1.1) end as 'Year 1 Premium Increase',

	case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,2))
	else  pil.Premium*(1 + power(0.1,2)) end as 'Year 2 Premium Increase',

	  case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,3))
	else  pil.Premium*(1 + power(0.1,3)) end as 'Year 3 Premium Increase',

	case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,4))
	else  pil.Premium*(1 + power(0.1,4)) end as 'Year 4 Premium Increase',

	case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,5))
	else  pil.Premium*(1 + power(0.1,5)) end as 'Year 5 Premium Increase',

	  case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,10))
	else  pil.Premium*(1 + power(0.1,10)) end as 'Year 10 Premium Increase',

	case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,15))
	else  pil.Premium*(1 + power(0.1,15)) end as 'Year 15 Premium Increase',

	case when cat.Id = 1 then pil.Premium 
	 when cat.Id = 2 then pil.Premium*(1 + power(0.05,20))
	else  pil.Premium*(1 + power(0.1,20)) end as 'Year 20 Premium Increase',
	pil.CoverAmount  as 'Year 0 Cover',

	  case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(1.04) > 104000 then 104000 else pil.CoverAmount*(1.04) end)
	else  (case when pil.CoverAmount*(1.08) > 104000 then 104000 else pil.CoverAmount*(1.08) end) end as 'Year 1 Cover Increase',

	case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(power(1.04,2)) > 104000 then 104000 else pil.CoverAmount*(power(1.04,2)) end)
	else  (case when pil.CoverAmount*(power(1.08,2)) > 104000 then 104000 else pil.CoverAmount*(power(1.08,2)) end) end as 'Year 2 Cover Increase',

	  case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(power(1.04,3)) > 104000 then 104000 else pil.CoverAmount*(power(1.04,3)) end)
	else  (case when pil.CoverAmount*(power(1.08,3)) > 104000 then 104000 else pil.CoverAmount*(power(1.08,3)) end) end as 'Year 3 Cover Increase',

	case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(power(1.04,4)) > 104000 then 104000 else pil.CoverAmount*(power(1.04,4)) end)
	else  (case when pil.CoverAmount*(power(1.08,4)) > 104000 then 104000 else pil.CoverAmount*(power(1.08,4)) end) end as 'Year 4 Cover Increase',

	case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(power(1.04,5)) > 104000 then 104000 else  pil.CoverAmount*(power(1.04,5)) end)
	else  (case when pil.CoverAmount*(power(1.08,5))  > 104000 then 104000 else pil.CoverAmount*(power(1.08,5)) end) end as 'Year 5 Cover Increase',

	  case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(power(1.04,10)) > 104000 then 104000 else pil.CoverAmount*(power(1.04,10)) end)
	else  (case when pil.CoverAmount*(power(1.08,10)) > 104000 then 104000 else pil.CoverAmount*(power(1.08,10)) end) end as 'Year 10 Cover Increase',

	case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when pil.CoverAmount*(power(1.04,15)) > 104000 then 104000 else pil.CoverAmount*(power(1.04,15)) end) 
	else   (case when pil.CoverAmount*(power(1.08,15)) > 104000 then 104000 else  pil.CoverAmount*(power(1.08,15)) end) end as 'Year 15 Cover Increase',

	case when cat.Id = 1 then pil.CoverAmount 
	 when cat.Id = 2 then (case when  pil.CoverAmount*(power(1.04,20)) > 104000 then 104000 else pil.CoverAmount*(power(1.04,20)) end)
	else  (case when pil.CoverAmount*(power(1.08,20))  > 104000 then 104000 else pil.CoverAmount*(power(1.08,20)) end) end as 'Year 20 Cover Increase'


	from policy.Policy (nolock) pp
	inner join policy.PolicyLifeExtension (nolock) ple on ple.PolicyId = pp.PolicyId 
	inner join policy.PolicyInsuredLives (nolock) pil on pil.PolicyId = pp.PolicyId

	inner join product.ProductOption (nolock) po on pp.ProductOptionId = po.Id
	inner join broker.Brokerage (nolock) bb on bb.Id = pp.BrokerageId
	inner join [common].[PolicyStatus] (nolock) ps on ps.Id = pp.PolicyStatusId
	inner join [common].[AnnualIncreaseType] (nolock) cat on cat.Id = ple.AnnualIncreaseTypeId
	inner join client.RolePlayerType (nolock) crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId

	where pp.PolicyId = @wizardId
	  and pil.InsuredLifeStatusId = 1

END