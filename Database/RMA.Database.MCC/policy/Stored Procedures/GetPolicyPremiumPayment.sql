CREATE PROCEDURE [policy].[GetPolicyPremiumPayment] @wizardId int
AS
select distinct
pp.InstallmentPremium as 'POLICY PREMIUM',
pf.[Name] as 'PAYMENT FREQUENCY',
cpm.[Name] as 'PAYMENT METHOD',
pp.RegularInstallmentDayOfMonth 'PAYMENT DATE',
pil.CoverAmount as 'MEMBER COVER AMOUNT'
from policy.Policy pp 
inner join common.PaymentMethod cpm
on cpm.Id = pp.PaymentMethodId
inner join common.PaymentFrequency pf
on pf.Id = pp.PaymentFrequencyId
inner join  policy.PolicyInsuredLives pil
inner join client.RolePlayerType cr on pil.RolePlayerTypeId = cr.RolePlayerTypeId
on pp.PolicyId = pil.PolicyId
where pp.PolicyId = @wizardId and cr.RolePlayerTypeId = 10