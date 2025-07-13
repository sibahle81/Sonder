CREATE   PROCEDURE [policy].[GetReportSchemeDetails]
AS BEGIN

select ic.[Name] [IndustryClass],
	co.[Name] [DisplayName],
	p.[PolicyNumber],
	p.[PolicyInceptionDate] [SchemeInceptionDate],
	co.[CreatedDate] [SchemeCreatedDate],
	b.[Name] [BrokerageName],
	b.[CreatedDate] [BrokerageInceptionDate],
	rp.[TellNumber],
	rp.[CellNumber],
	rp.[EmailAddress],
	p.[CreatedBy],
	co.[ReferenceNumber],
	co.[IdNumber]
from [client].[Company] co (nolock)
	inner join [policy].[Policy] p (nolock) on p.[PolicyOwnerId] = co.[RolePlayerId]
	inner join [broker].[Brokerage] b (nolock) on b.[Id] = p.[BrokerageId]
	inner join [client].[RolePlayer] rp (nolock) on rp.[RolePlayerId] = p.[PolicyOwnerId]
	inner join (
		select p.[ParentPolicyId],
			count(*) [PolicyCount]
		from [policy].[Policy] p (nolock)
		where p.[ParentPolicyId] is not null
		group by p.[ParentPolicyId]
	) t on t.[ParentPolicyId] = p.[PolicyId]
	left join [client].[FinPayee] fp (nolock) on fp.RolePlayerId = co.[RolePlayerId]
	left join [common].[Industry] ci (nolock) on ci.Id = fp.[IndustryId]
	left join [common].[IndustryClass] ic (nolock) on ic.[Id] = ci.[IndustryClassId]
where left(p.[PolicyNumber], 3) = '01-'
  and p.[PolicyStatusId] not in (2, 4, 13)
order by [IndustryClass],
	[DisplayName]

END