CREATE   PROCEDURE [policy].[GetReportPolicyDetails]
AS BEGIN

select p.PolicyNumber,
	co.[Name] [SchemeName],
	ps.[Name] [PolicyStatus],
	p.[PolicyInceptionDate],
	p.[CancellationDate],
	p.[LastLapsedDate],
	p.[FirstInstallmentDate],
	p.[InstallmentPremium],
	p.[AdminPercentage],
	p.[BinderFeePercentage],
	p.[CommissionPercentage],
	p.[CreatedBy] [PolicyCreatedBy],
	p.[CreatedDate] [PolicyCreatedDate],
	pf.[Name] [PaymentFrequency],
	b.[Name] [BrokerageName],
	b.[FSPNumber],
	r.[FirstName] [RepresentativeName],
	r.[SurnameOrCompanyName] [RepresentativeSurname],
	r.[IdNumber] [RepresentativeIdNumber],
	pt.[Name] [Product],
	po.[Name] [ProductOptionName]
from [client].[Company] co (nolock)
	inner join [policy].[Policy] p (nolock) on p.[PolicyOwnerId] = co.[RolePlayerId]
	inner join [common].[PolicyStatus] ps (nolock) on ps.[Id] = p.[PolicyStatusId]
	inner join [common].[PaymentFrequency] pf (nolock) on pf.[Id] = p.[PaymentFrequencyId]
	inner join [broker].[Brokerage] b (nolock) on b.[Id] = p.[BrokerageId]
	inner join [broker].[Representative] r (nolock) on r.[Id] = p.[RepresentativeId]
	inner join [product].[ProductOption] po (nolock) on po.[Id] = p.[ProductOptionId]
	inner join [product].[Product] pt (nolock) on pt.[Id] = po.[ProductId]
	inner join (
		select p.[ParentPolicyId],
			count(*) [PolicyCount]
		from [policy].[Policy] p (nolock)
		where p.[ParentPolicyId] is not null
		group by p.[ParentPolicyId]
	) t on t.[ParentPolicyId] = p.[PolicyId]
where left(p.[PolicyNumber], 3) = '01-'
  and p.[PolicyStatusId] not in (2, 4, 13)
order by [SchemeName]

END