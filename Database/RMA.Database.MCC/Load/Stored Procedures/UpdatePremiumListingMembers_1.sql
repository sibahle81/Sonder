
CREATE   PROCEDURE [Load].[UpdatePremiumListingMembers] (@fileIdentifier uniqueidentifier, @createNewPolicies bit)
as begin
	
	--declare @fileIdentifier uniqueidentifier = '18E1EC09-00B9-41A7-8FB1-341EF2798608'
	--declare @createNewPolicies bit = 1

	set nocount on

	update [Load].[PremiumListingMessage] set [Message] = 'Updating member calculated fields...' where [FileIdentifier] = @fileIdentifier

	-- Remove whitespace from ID numbers
	update [Load].[PremiumListingMember] set [IdNumber] = replace([IdNumber], ' ', '')
	where [FileIdentifier] = @fileIdentifier

	-- Update the ID numbers of people with DOB as id number
	update m set
		m.[IdNumber] = concat(m.[MainMemberIdNumber], '-', replace(replace(replace(m.[IdNumber], '-', ''), '/', ''), '\', ''))
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and isdate(m.[IdNumber]) = 1
	  and m.[CoverMemberTypeId] > 1
	  and m.[IdTypeId] = 2

	update m set m.[MainMemberIdNumber] = m.[IdNumber] from [Load].[PremiumListingMember] m where m.[FileIdentifier] = @fileIdentifier and m.[CoverMemberTypeId] = 1

	-- Update Id numbers of members where an ID number without a leading zero has been entered as a passport number
	update [Load].[PremiumListingMember] set
		[IdTypeId] = 1,
		[IdNumber] = iif(isdate([TestDateOfBirth]) = 1, iif(year(convert(date, [TestDateOfBirth])) between 2000 and 2009, concat('0', [IdNumber]), [IdNumber]), [IdNumber])
	where [FileIdentifier] = @fileIdentifier
	  and [IdTypeId] = 2
	  and len([IdNumber]) = 12
	  and isnumeric([IdNumber]) = 1
	  and isdate([TestDateOfBirth]) = 1

	-- Update the DOB's of members with SA ID numbers
	declare @today date = getdate()
	declare @century int = year(@today) / 100

	update m set
		m.[TestDateOfBirth] = concat(
			iif(isdate(m.[TestDateOfBirth]) = 1, year(m.[TestDateOfBirth]) / 100, @century),
			substring(m.[IdNumber], 1, 2),'-',
			substring(m.[IdNumber], 3, 2), '-',
			substring(m.[IdNumber], 5, 2)
		)
	from [Load].[PremiumListingMember] m
	where m.[Fileidentifier] = @fileIdentifier
	    and m.[IdTypeId] = 1
		and len(m.[IdNumber]) >= 6
		and isnumeric(m.[IdNumber]) = 1
	update m set
		m.[DateOfBirth] = iif(isdate(m.[TestDateOfBirth]) = 1, convert(date, m.[TestDateOfBirth]), null),
		m.[JoinDate] = iif(isdate(m.[TestJoinDate]) = 1, convert(date, m.[TestJoinDate]), null)
	from [Load].[PremiumListingMember] m
	where m.[Fileidentifier] = @fileIdentifier

	-- Update all birth dates in the future
	update m set
		m.[DateOfBirth] = DATEADD(year, -100, m.[DateOfBirth])
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and isnull(m.[DateOfBirth], @today) > @today

	-- Update birth dates for VERY OLD main members and spouses (assume main members and spouses will be older than 16)
	declare @cutoff date = dateadd(year, -16, @today)
	update m set
		m.[DateOfBirth] = DATEADD(year, -100, m.[DateOfBirth])
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] in (1, 2)
	  and isnull(m.[DateOfBirth], @cutoff) > @cutoff

	-- Calculate the age of all members
	update m set
		[Age] = datediff(yy, isnull(m.[DateofBirth], @today), @today) - case when dateadd(yy, datediff(yy, isnull(m.[DateofBirth], @today), @today), isnull(m.[DateofBirth], @today)) > @today then 1 else 0 end
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[DateOfBirth] is not null
	update m set
		[Age] = 0
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[Age] = -1

	-- Extra age admustment for children
	update m set
		m.[DateOfBirth] = DATEADD(year, -100, m.[DateOfBirth]),
		m.[Age] = m.[Age] - 100
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 3
	  and m.[Age] > 100

	-- Calculate policy join age of all members
	update m set
		[JoinAge] = datediff(yy, isnull(m.[DateofBirth], m.[JoinDate]), m.[JoinDate]) - case when dateadd(yy, datediff(yy, isnull(m.[DateofBirth], m.[JoinDate]), m.[JoinDate]), isnull(m.[DateofBirth], m.[JoinDate])) > m.[JoinDate] then 1 else 0 end
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[DateOfBirth] is not null
	  and m.[JoinDate] is not null
	update m set
		m.[JoinAge] = 0
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[JoinAge] = -1

	-- Update the names of members (sometimes the same id number has different names in the spreadsheet)
	update m set
		m.[FirstName] = d.[FirstName],
		m.[Surname] = d.[Surname],
		m.[MemberName] = d.[MemberName]
	from [Load].[PremiumListingMember] m
		inner join (
			select t.[IdTypeId],
				   t.[IdNumber],
				   t.[FirstName],
				   t.[Surname],
				   concat(t.[FirstName], ' ', t.[Surname]) [MemberName]
			from (
				select distinct [IdTypeId],
					   [IdNumber],
					   [FirstName],
					   [Surname],
					   rank() over (partition by m.[IdTypeId], m.[IdNumber] order by m.[FirstName], m.[Surname]) [Rank]
				from [Load].[PremiumListingMember] m
				where m.[FileIdentifier] = @fileIdentifier
			) t where t.[Rank] = 1
		) d on d.[IdTypeId] = m.[IdTypeId] and d.[IdNumber] = m.[IdNumber]
	where m.[FileIdentifier] = @fileIdentifier

	-- Update RolePlayerIds of existing members
	update m set
		m.[RolePlayerId] = p.[RolePlayerId],
		m.[RolePlayerExists] = 1
	from [Load].[PremiumListingMember] m
		inner join [client].[Person] p on p.[IdNumber] = m.[IdNumber]
	where m.[FileIdentifier] = @fileIdentifier
 
	-- Get the policy inception date and the cutoff date for group scheme premium rounding
	declare @policyInceptionDate date
	select @policyInceptionDate = [PolicyInceptionDate] from [Load].[PremiumListingCompany] where [FileIdentifier] = @fileIdentifier
	
	declare @cutoffDate date
	select @cutoffDate = isnull([Value], dateadd(year, 100, getdate())) from [common].[Settings] where [Key] = 'GroupRoundingCutoffDate'

	-- Update benefits and premiums of members
	if (@policyInceptionDate > @cutoffDate) begin
		update m set
			m.[BenefitId] = b.[BenefitId],
			m.[PolicyPremium] = [policy].[CalculateGroupSchemePolicyPremium] (b.[BenefitRate], c.[AdminPercentage], c.[CommissionPercentage], c.[BinderFeePercentage], c.[PremiumAdjustmentPercentage]) + b.[EuropAssistFee]
		from [Load].[PremiumListingCompany] c
			inner join [Load].[PremiumListingBenefit] b on b.[FileIdentifier] = c.[FileIdentifier]
			inner join [Load].[PremiumListingMember] m on 
				m.[FileIdentifier] = b.[FileIdentifier] and 
				replace(m.[BenefitName], ' ', '') = replace(b.[BenefitName], ' ', '')
		where c.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = b.[CoverMemberTypeId]
		  and m.[RolePlayerTypeId] != 41
	end else begin
		update m set
			m.[BenefitId] = b.[BenefitId],
			m.[PolicyPremium] = round([policy].[CalculateGroupPolicyPremium] (b.[BenefitRate], c.[AdminPercentage], c.[CommissionPercentage], c.[BinderFeePercentage], c.[PremiumAdjustmentPercentage]) + b.[EuropAssistFee], 0)
		from [Load].[PremiumListingCompany] c
			inner join [Load].[PremiumListingBenefit] b on b.[FileIdentifier] = c.[FileIdentifier]
			inner join [Load].[PremiumListingMember] m on 
				m.[FileIdentifier] = b.[FileIdentifier] and 
				replace(m.[BenefitName], ' ', '') = replace(b.[BenefitName], ' ', '')
		where c.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = b.[CoverMemberTypeId]
		  and m.[RolePlayerTypeId] != 41
	end

	-- Add additional benefits to main member records only
	update m set
		m.[PolicyPremium] = m.[PolicyPremium] + t.[Premium]
	from [Load].[PremiumListingMember] m
		inner join (
			select m.[Id],
				sum(b.[BenefitRate]) [Premium]
			from [Load].[PremiumListingMember] m
				inner join [Load].[PremiumListingBenefit] b on b.[FileIdentifier] = m.[FileIdentifier] and b.[CoverMemberTypeId] = m.[CoverMemberTypeId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and b.[BenefitTypeId] = 2
			group by m.[Id]
		) t on t.[Id] = m.[Id]

	-- Update main member roleplayer id's
	update m set
		m.[MainMemberRolePlayerId] = t.[RolePlayerId]
	from [Load].[PremiumListingMember] m
		inner join (
			select [RolePlayerId],
				   [IdNumber] [MainMemberIdNumber],
				   [ClientReference]
			from [Load].[PremiumListingMember] 
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
			  and [RolePlayerExists] = 1
		) t on t.[ClientReference] = m.[ClientReference]
			and t.[MainMemberIdNumber] = t.[MainMemberIdNumber]
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 1

	if @createNewPolicies = 0 begin
		-- Update policy id's of existing policy holders
		update m set
			m.[PolicyId] = p.[PolicyId],
			m.[PolicyExists] = 1
		from [Load].[PremiumListingMember] m
			inner join [policy].[Policy] p on
				p.[ParentPolicyId] = m.[ParentPolicyId] and
				p.[PolicyOwnerId] = m.[RolePlayerId] and
				isnull(p.[ClientReference], '') = iif(left(m.[ClientReference], 3) = 'XXX', '', m.[ClientReference])
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[RolePlayerExists] = 1
		  and m.[CoverMemberTypeId] = 1
		  and p.[PolicyStatusId] <> 2

		-- Update policy numbers of existing dependent members
		update m set
			m.[PolicyId] = t.[PolicyId],
			m.[PolicyExists] = 1
		from [Load].[PremiumListingMember] m
			inner join (
				select m.[PolicyId],
					   m.[ClientReference],
					   m.[IdNumber]
				from [Load].[PremiumListingMember] m
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[PolicyId] > 0
			) t on t.[ClientReference] = m.[ClientReference] and t.[IdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] != 1
	end else begin
		update p set 
			p.[ClientReference] = null
		from [policy].[Policy] p
			inner join [Load].[PremiumListingMember] m on m.[RolePlayerId] = p.[PolicyOwnerId] and m.[ClientReference] = p.[ClientReference]
		where m.[FileIdentifier] = @fileIdentifier
		  and p.[ClientReference] like concat('%', m.IdNumber, '%')
	end

	-- Assign default policy join date
	update m 
		set m.[JoinDate] = c.[PolicyInceptionDate]
	from [Load].[PremiumListingCompany] c
		inner join [Load].[PremiumListingMember] m on 
			m.[FileIdentifier] = c.[FileIdentifier]
	where c.[FileIdentifier] = @fileIdentifier
	  and m.[JoinDate] is null

	-- Update existing cover amounts
	declare @parentPolicyId int
	select @parentPolicyId = [PolicyId] from [Load].[PremiumListingCompany] where [FileIdentifier] = @fileIdentifier
	update m set
		m.[ExistingCover] = d.[BenefitAmount]
	from [Load].[PremiumListingMember] m
		inner join (
			select m.[RolePlayerId],
				   sum(t.[BenefitAmount]) [BenefitAmount]
			from [Load].[PremiumListingMember] m
				inner join [policy].[PolicyInsuredLives] pil on m.[RolePlayerId] = pil.[RolePlayerId]
				inner join [policy].[Policy] p on p.[PolicyId] = pil.[PolicyId] and isnull(p.[ParentPolicyId], -1) != m.[ParentPolicyId]
				inner join (
					select br.[BenefitId], br.[BenefitAmount], rank() over (partition by br.[BenefitId] order by br.[EffectiveDate] desc) [Rank]
					from [Load].[PremiumListingBenefit] plb inner join [product].[BenefitRate] br on br.[BenefitId] = plb.[BenefitId]
					where plb.[FileIdentifier] = @fileIdentifier and br.[EffectiveDate] <= getdate()
				) t on t.[BenefitId] = isnull(pil.[StatedBenefitId], -1) and t.[Rank] = 1
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[ParentPolicyId] != @parentPolicyId
			  and m.[RolePlayerExists] = 1
			  and m.[RolePlayerTypeId] != 41
			group by m.[RolePlayerId]
		) d on d.[RolePlayerId] = m.[RolePlayerId]
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[RolePlayerTypeId] != 41

	set nocount off

end