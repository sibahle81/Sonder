CREATE PROCEDURE [policy].[CFPNewBusinessSalesReport]
AS BEGIN

select  distinct 
pp.PolicyNumber as 'POLICY NUMBER',
cp.RolePlayerId ,
bb.Code as 'BROKER CODE',
crt.[Name] as 'MEMBER TYPE',
cp.FirstName + ' ' + cp.Surname as 'NAME & SURNAME',
cp.IdNumber as 'ID NUMBER',
pp.PolicyInceptionDate as 'INCEPTION',
pil.Premium as 'PREMIUM',
pil.CoverAmount as 'COVER',
pp.CreatedDate as 'CAPTURE DATE',
case when ple.AffordabilityCheckPassed = 1 then 'Affordable'  else 'Not Affordable' end as 'AFFORDABILITY STATUS',
case right(w.[Name], 14) when 'CFP Tablet App' then 'Tablet' else 'Manual' end 'SOURCE',
case when pp.PaymentMethodId = 19 then 'CASEY And Associates'
	when pp.PaymentMethodId = 12 then 'Q-Link'
else pm.[Name] end as 'AFFORDABILITY SP',
pd.Employer as 'EMPLOYER'
 
from policy.Policy (NOLOCK) pp
inner join policy.PolicyLifeExtension (NOLOCK) ple on ple.PolicyId = pp.PolicyId 
inner join policy.PolicyInsuredLives (NOLOCK) pil on pil.PolicyId = pp.PolicyId
inner join broker.Brokerage (NOLOCK) bb on bb.Id = pp.BrokerageId 
inner join common.PaymentMethod pm on pm.[Id] = pp.PaymentMethodId
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pil.RolePlayerId
inner join [client].[RolePlayerType] (NOLOCK) crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
inner join [Load].[ConsolidatedFuneralMember] (NOLOCK) lcf on lcf.PolicyId = pp.PolicyId and lcf.RolePlayerId = pp.PolicyOwnerId
inner join [bpm].[Wizard] (NOLOCK) w on w.WizardConfigurationId = 113 and lcf.FileIdentifier = json_value(w.[Data], '$[0].fileIdentifier')
left join client.RolePlayerPersalDetail pd (nolock) on pd.RolePlayerId = cp.RolePlayerId and pd.IsDeleted = 0
where pp.ProductOptionId in (132, 133)
order by 9 desc
END
