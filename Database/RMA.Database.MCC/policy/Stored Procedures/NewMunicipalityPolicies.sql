CREATE PROCEDURE [policy].[NewMunicipalityPolicies]
AS BEGIN

declare @createdDate date = getdate()

select p.PolicyNumber,
	p.PolicyInceptionDate [InceptionDate],
	pd.Employer,
	pd.PersalNumber [EmployeeNumber],
	upper(concat(per.FirstName, ' ', per.Surname)) [MemberName],
	per.IdNumber,
	per.DateOfBirth
from policy.Policy p (nolock)
	inner join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
	inner join client.RolePlayerPersalDetail pd (nolock) on pd.RolePlayerId = per.RolePlayerId
where p.ProductOptionId in (132, 133)
  and p.PaymentMethodId = 19
  and abs(datediff(day, p.CreatedDate, @createdDate)) = 0
  and pd.IsDeleted = 0
order by pd.Employer,
	[MemberName]

END