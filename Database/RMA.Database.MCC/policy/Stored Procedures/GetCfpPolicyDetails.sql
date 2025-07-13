
CREATE PROCEDURE [policy].[GetCfpPolicyDetails] @wizardId int
as
select distinct

pp.PolicyId,
pp.PolicyNumber as 'Policy Number',
pil.StartDate as 'Benefit start Date',

dateadd(year, 1, pp.PolicyInceptionDate) as 'Anniversary Date',
 FORMAT  (pp.CreatedDate, 'yyyy-MM-dd') as 'Issue Date',
 FORMAT  (GETDATE(), 'yyyy-MM-dd') as 'Schedule Date',
 case when pp.ExpiryDate is null then 'Whole Life' else 'Term Life' end as 'Term',
 ps.[Name] as 'Policy Status',
 bb.[Name] as 'Brokerage',
 rla.AddressLine1 as 'Main Member Address Line 1',
 rlpa.AddressLine2 + ', ' + rla.PostalCode as 'Main Member Address Line 2',
 rlpa.AddressLine1 as 'Payer Member Address Line 1',
 crpm.CellNumber as 'Main Member Cellphone',
 crpm.EmailAddress as 'Main Member Email',
 crpp.CellNumber as 'Payer Member Cellphone',
 crpp.EmailAddress as 'Payer Member Email',
 rla.AddressLine2 + ', ' + rla.PostalCode as 'Payer Member Address Line 2',
 br.FirstName + ' ' + br.SurnameOrCompanyName as 'Main Member Representative',
 ccp.FirstName + ' ' + ccp.Surname as 'Main Member Name',
 ccp.DateOfBirth as 'Main Member Date Of Birth',
 ccp.IdNumber as 'Main Member ID Number',
 ppy.FirstName + ' ' + ccp.Surname as 'Premium Payer Name',
 ppy.DateOfBirth as 'Premium Payer Date Of Birth',
 ppy.IdNumber as 'Premium Payer ID Number',
 pp.FirstInstallmentDate as 'Payment Commencement Date',  
 cat.[Name] as 'Annual Increase Type',
 br.FirstName + ' ' + br.SurnameOrCompanyName as 'Represebtative',
 bb.[Name] as 'Brokerage'
from policy.Policy pp
inner join policy.PolicyLifeExtension ple on ple.PolicyId = pp.PolicyId 
inner join policy.PolicyInsuredLives pil on pil.PolicyId = pp.PolicyId
inner join [client].[Person] cp on cp.RolePlayerId = pil.RolePlayerId
inner join [client].[RolePlayerType] crt on crt.RolePlayerTypeId = pil.RolePlayerTypeId
inner join broker.Representative br on pp.RepresentativeId = br.Id
inner join Client.Person ccp on ccp.RolePlayerId =  pp.PolicyOwnerId
inner join product.ProductOption po on pp.ProductOptionId = po.Id
inner join broker.Brokerage bb on bb.Id = pp.BrokerageId
inner join [common].[PolicyStatus] ps on ps.Id = pp.PolicyStatusId
inner join [client].[Person] ppy on ppy.RolePlayerId = pp.PolicyPayeeId
inner join [common].[PaymentFrequency] pf on pf.Id = pp.PaymentFrequencyId
inner join [common].[PaymentMethod]  pm on pm.Id = pp.PaymentMethodId
inner join [common].[AnnualIncreaseType] cat on cat.Id = ple.AnnualIncreaseTypeId
inner join [client].[RolePlayerAddress] rla on rla.RolePlayerId = pp.PolicyOwnerId
inner join [client].[RolePlayerAddress] rlpa on rlpa.RolePlayerId = pp.PolicyPayeeId
inner join [client].[RolePlayer] crpm on crpm.RolePlayerId =  pp.PolicyOwnerId
inner join [client].[RolePlayer] crpp on crpp.RolePlayerId =  pp.PolicyPayeeId
inner join common.InsuredLifeRolePlayerType cil on cil.Id = pil.RolePlayerTypeId
where pp.PolicyId = @wizardId and cil.[Name] = 'Main Member (self)'