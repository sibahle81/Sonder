 

CREATE proc [policy].[CFPNewBusinessSalesReport]
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
case right(w.[Name], 14) when 'CFP Tablet App' then 'Tablet' else 'Manual' end 'SOURCE'

from policy.Policy (NOLOCK) pp
inner join policy.PolicyLifeExtension (NOLOCK) ple on ple.PolicyId = pp.PolicyId 
inner join policy.PolicyInsuredLives (NOLOCK) pil on pil.PolicyId = pp.PolicyId
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pil.RolePlayerId
inner join [client].[RolePlayerType] (NOLOCK) crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
inner join [Load].[ConsolidatedFuneralMember] (NOLOCK) lcf on lcf.PolicyId = pp.PolicyId
inner join [bpm].[Wizard] (NOLOCK) w on lcf.FileIdentifier = json_value(w.[Data], '$[0].fileIdentifier')
inner join broker.Brokerage (NOLOCK) bb on bb.Id = pp.BrokerageId where w.WizardConfigurationId = 113 order by 9 desc

END