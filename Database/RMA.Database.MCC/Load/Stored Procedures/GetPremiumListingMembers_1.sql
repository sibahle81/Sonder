create   PROCEDURE [Load].[GetPremiumListingMembers] @fileIdentifier uniqueidentifier, @pageSize int, @page int
AS BEGIN

	declare @minId int
	declare @maxId int
	declare @records int

	select @minId = min(id), @maxid = max(id), @records = count(*) from [Load].[PremiumListingMember] where [FileIdentifier] = @fileidentifier
	
	declare @startId int = @minId + (@pageSize * (@page - 1))
	declare @endId int = @startId + (@pageSize - 1)

	if (@endId > @maxId) begin
		set @endId = @maxId
	end

	select m.[Id],
		m.[MemberName],
		m.[IdNumber],
		m.[DateOfBirth],
		m.[Age],
		m.[JoinDate],
		rt.[Name] [MemberType],
		case m.[CoverMemberTypeId] when 99 then null else m.[BenefitName] end [BenefitName],
		case m.[CoverMemberTypeId] when 99 then null else t.[BenefitAmount] end [BenefitAmount],
		case m.[CoverMemberTypeId] when 99 then null else m.[PolicyPremium] end [PolicyPremium],
		@records [Records]
	from [Load].[PremiumListingMember] m (nolock)
		inner join [client].[RolePlayerType] rt (nolock) on rt.RolePlayerTypeId = m.RolePlayerTypeId
		left join (
			select br.[BenefitId],
				br.[BaseRate],
				br.[BenefitAmount],
				rank() over (partition by br.[BenefitId] order by br.[EffectiveDate] desc) [Rank],
				count(*) [Records]
			from [Load].[PremiumListingMember] m (nolock)
				inner join [product].[BenefitRate] br (nolock) on br.[BenefitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
			  and br.[EffectiveDate] <= getdate()
			group by br.[BenefitId],
				br.[BaseRate],
				br.[BenefitAmount],
				br.[EffectiveDate]
		) t on t.[BenefitId] = m.[BenefitId]
	where m.Id between @startId and @endId
	order by m.[Id]

END