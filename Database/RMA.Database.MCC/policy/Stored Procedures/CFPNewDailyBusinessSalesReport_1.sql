
create PROCEDURE [policy].[CFPNewDailyBusinessSalesReport]
as
/*
exec [policy].CFPNewBusinessSalesReport
*/
begin 

select  distinct 
pp.PolicyNumber as 'POLICY NUMBER',
bb.Code as 'BROKER CODE',
crt.[Name] as 'MEMBER TYPE',
cp.FirstName + ' ' + cp.Surname as 'NAME & SURNAME',
cp.IdNumber as 'ID NUMBER',
pp.PolicyInceptionDate as 'INCEPTION',
pil.Premium as 'PREMIUM',
pil.CoverAmount as 'COVER',
pp.CreatedDate as 'CAPTURE DATE',
case when ple.AffordabilityCheckPassed = 1 then 'Affordable'  else 'Not Affordable' end as 'AFFORDABILITY STATUS',
case right(w.[Name], 14) when 'CFP Tablet App' then 'Tablet' else 'Manual' end as 'SOURCE'

from policy.Policy (NOLOCK) pp
inner join policy.PolicyLifeExtension (NOLOCK) ple on ple.PolicyId = pp.PolicyId 
inner join policy.PolicyInsuredLives (NOLOCK) pil on pil.PolicyId = pp.PolicyId
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pil.RolePlayerId
inner join [client].[RolePlayerType] crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
inner join broker.Brokerage (NOLOCK) bb on bb.Id = pp.BrokerageId 
inner join bpm.Wizard w on w.LinkedItemId = pp.PolicyId
where (cast(pil.StartDate as date) !=  cast(pp.PolicyInceptionDate as date) 
 and cast(pil.CreatedDate as date) != cast(pil.ModifiedDate as date) 
 and cast(pil.CreatedDate as date) = cast(GETDATE() as date)) order by 9 desc
 end