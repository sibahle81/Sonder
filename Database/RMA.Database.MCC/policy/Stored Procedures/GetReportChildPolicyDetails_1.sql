CREATE   PROCEDURE [policy].[GetReportChildPolicyDetails]
AS BEGIN

select p.[PolicyNumber] [ParentPolicyNumber],
	ic.[Name] [IndustryClass],
	co.[Name] [SchemeName],
	c.[PolicyNumber] [ChildPolicyNumber],
	c.[InstallmentPremium],
	ps.[Name] [PolicyStatus],
	c.[PolicyInceptionDate],
	c.[CancellationDate],
	c.[LastLapsedDate],
	c.[CreatedDate] [PolicyCreatedDate],	
	b.[Name] [BrokerageName],
	b.[FSPNumber],
	r.[FirstName] [RepresentativeName],
	r.[SurnameOrCompanyName] [RepresentativeSurname],
	r.[IdNumber] [RepresentativeIdNumber],
	pt.[Name] [Product],
	po.[Name] [ProductOptionName]
from [client].[Company] co (nolock)
	inner join [policy].[Policy] p (nolock) on p.[PolicyOwnerId] = co.[RolePlayerId]
	inner join [policy].[Policy] c (nolock) on c.[ParentPolicyId] = p.[PolicyId]
	inner join [common].[PolicyStatus] ps (nolock) on ps.[Id] = c.[PolicyStatusId]
	inner join [broker].[Brokerage] b (nolock) on b.[Id] = c.[BrokerageId]
	inner join [broker].[Representative] r (nolock) on r.[Id] = c.[RepresentativeId]
	inner join [product].[ProductOption] po (nolock) on po.[Id] = c.[ProductOptionId]
	inner join [product].[Product] pt (nolock) on pt.[Id] = po.[ProductId]
	left join [client].[FinPayee] fp (nolock) on fp.RolePlayerId = co.[RolePlayerId]
	left join [common].[Industry] ci (nolock) on ci.Id = fp.[IndustryId]
	left join [common].[IndustryClass] ic (nolock) on ic.[Id] = ci.[IndustryClassId]
where left(p.[PolicyNumber], 3) = '01-'
  and p.[PolicyStatusId] not in (2, 4, 13)
order by [IndustryClass],
	[SchemeName],
	[ChildPolicyNumber]

END