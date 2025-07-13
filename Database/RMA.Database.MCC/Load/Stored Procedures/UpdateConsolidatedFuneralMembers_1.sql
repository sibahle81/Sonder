
CREATE   PROCEDURE [Load].[UpdateConsolidatedFuneralMembers] (@fileIdentifier uniqueidentifier, @createNewPolicies bit = 0)
AS BEGIN
	
	-- declare @fileIdentifier uniqueidentifier = '79CB9CBD-1E77-441B-BEBB-C229206802A8'

	set nocount on

	-- Remove whitespace from ID numbers
	update [Load].[ConsolidatedFuneralMember] set [IdNumber] = replace([IdNumber], ' ', '')
	where [FileIdentifier] = @fileIdentifier

	-- Update the ID numbers of people with DOB as id number
	update m set
		m.[IdNumber] = concat(m.[MainMemberIdNumber], '|', m.[Id], '-', replace(replace(replace(m.[IdNumber], '-', ''), '/', ''), '\', ''))
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and (isdate(m.[IdNumber]) = 1 or isnumeric(m.[IdNumber]) = 1)
	  and m.[CoverMemberTypeId] > 1
	  and m.[IdTypeId] = 2

	-- Update main member id number on main member records
	update m set 
		m.[MainMemberIdNumber] = m.[IdNumber] 
	from [Load].[ConsolidatedFuneralMember] m 
	where m.[FileIdentifier] = @fileIdentifier 
	  and m.[CoverMemberTypeId] = 1

	-- Update Id numbers of members where an ID number without a leading zero has been entered as a passport number
	update [Load].[ConsolidatedFuneralMember] set
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
	from [Load].[ConsolidatedFuneralMember] m
	where m.[Fileidentifier] = @fileIdentifier
	    and m.[IdTypeId] = 1
		and len(m.[IdNumber]) >= 6
		and isnumeric(m.[IdNumber]) = 1
	update m set
		m.[DateOfBirth] = iif(isdate(m.[TestDateOfBirth]) = 1, convert(date, m.[TestDateOfBirth]), null),
		m.[JoinDate] = iif(isdate(m.[TestJoinDate]) = 1, convert(date, m.[TestJoinDate]), null)
	from [Load].[ConsolidatedFuneralMember] m
	where m.[Fileidentifier] = @fileIdentifier

	-- Update all birth dates in the future
	update m set
		m.[DateOfBirth] = DATEADD(year, -100, m.[DateOfBirth])
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and isnull(m.[DateOfBirth], @today) > @today

	-- Calculate the age of all members
	update m set
		[Age] = datediff(yy, isnull(m.[DateofBirth], @today), @today) - case when dateadd(yy, datediff(yy, isnull(m.[DateofBirth], @today), @today), isnull(m.[DateofBirth], @today)) > @today then 1 else 0 end
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[DateOfBirth] is not null
	update m set
		[Age] = 0
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[Age] = -1

	-- Extra age admustment for children
	update m set
		m.[DateOfBirth] = DATEADD(year, -100, m.[DateOfBirth]),
		m.[Age] = m.[Age] - 100
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 3
	  and m.[Age] > 100

	-- Calculate policy join age of all members
	update m set
		[JoinAge] = datediff(yy, isnull(m.[DateofBirth], m.[JoinDate]), m.[JoinDate]) - case when dateadd(yy, datediff(yy, isnull(m.[DateofBirth], m.[JoinDate]), m.[JoinDate]), isnull(m.[DateofBirth], m.[JoinDate])) > m.[JoinDate] then 1 else 0 end
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[DateOfBirth] is not null
	  and m.[JoinDate] is not null
	update m set
		m.[JoinAge] = 0
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[JoinAge] = -1

	-- Update the names of members (sometimes the same id number has different names in the spreadsheet)
	update m set
		m.[FirstName] = d.[FirstName],
		m.[Surname] = d.[Surname],
		m.[MemberName] = d.[MemberName]
	from [Load].[ConsolidatedFuneralMember] m
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
				from [Load].[ConsolidatedFuneralMember] m
				where m.[FileIdentifier] = @fileIdentifier
			) t where t.[Rank] = 1
		) d on d.[IdTypeId] = m.[IdTypeId] and d.[IdNumber] = m.[IdNumber]
	where m.[FileIdentifier] = @fileIdentifier

	-- Update RolePlayerIds of existing members with SA ID numbers, this
	-- should include all of the main members on the policies
	update m set
		m.[RolePlayerId] = p.[RolePlayerId],
		m.[RolePlayerExists] = 1
	from [Load].[ConsolidatedFuneralMember] m
		inner join [client].[Person] p on
			p.[IdNumber] = m.[IdNumber]
	where m.[FileIdentifier] = @fileIdentifier
	  and len(m.[IdNumber]) = 13
	  and isnumeric(m.[IdNumber]) = 1

	-- Update main member roleplayer id's on member records
	update m set
		m.[MainMemberRolePlayerId] = t.[RolePlayerId]
	from [Load].[ConsolidatedFuneralMember] m
		inner join (
			select [RolePlayerId],
				   [IdNumber] [MainMemberIdNumber],
				   [ClientReference]
			from [Load].[ConsolidatedFuneralMember] 
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
			  and [RolePlayerExists] = 1
		) t on t.[ClientReference] = m.[ClientReference]
			and t.[MainMemberIdNumber] = t.[MainMemberIdNumber]
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] != 1

	-- Update benefits	
	update m set
		m.[ProductOptionId] = b.[ProductOptionId],
		m.[BenefitId] = b.[BenefitId]
	from [Load].[ConsolidatedFuneralMember] m 
		inner join [Load].[ConsolidatedFuneralBenefit] b on 
			b.[FileIdentifier] = m.[FileIdentifier] and 
			b.[ProductOptionName] = m.[ProductOption] and 
			replace(b.[BenefitName], ' ', '') = replace(m.[BenefitName], ' ', '')
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = b.[CoverMemberTypeId]
	  and m.[RolePlayerTypeId] != 41 -- Beneficiary

	-- Update policy id's of existing policies where the policy number was received in the file
	update m set
		m.[PolicyId] = p.[PolicyId],
		m.[PolicyExists] = 1
	from [Load].[ConsolidatedFuneralMember] m   
		inner join [policy].[Policy] p on p.[PolicyNumber] = m.[PolicyNumber]
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 1
	  and m.[PolicyExists] = 0

	-- Update policy id's of existing policies where the policy number was NOT received in the file
	if @createNewPolicies = 0 begin
		-- Update policy id's of existing policy holders
		update m set
			m.[PolicyId] = p.[PolicyId],
			m.[PolicyExists] = 1
		from [Load].[ConsolidatedFuneralMember] m   
			inner join [product].[ProductOption] mpo   on mpo.[Id] = m.[ProductOptionId]
			inner join [policy].[Policy] p on
				p.[PolicyOwnerId] = m.[RolePlayerId] and
				isnull(p.[ClientReference], '') = iif(left(m.[ClientReference], 3) = 'XXX', '', m.[ClientReference])
			inner join [product].[ProductOption] ppo   on ppo.[Id] = p.[ProductOptionId]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[RolePlayerExists] = 1
			and m.[CoverMemberTypeId] = 1
			and m.[PolicyExists] = 0
			and mpo.[ProductId] = ppo.[ProductId]
	end

	-- Update policy id's of dependent members
	update m set
		m.[PolicyId] = t.[PolicyId],
		m.[PolicyExists] = 1
	from [Load].[ConsolidatedFuneralMember] m
		inner join (
			select distinct [PolicyId],
				[ClientReference],
				[IdNumber]
			from [Load].[ConsolidatedFuneralMember] m   
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[PolicyId] > 0
			  and m.[PolicyExists] = 1
		) t on t.[ClientReference] = m.[ClientReference] and t.[IdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[CoverMemberTypeId] > 1

	-- Update RolePlayerIds of members already in the system
	update m set
		m.[RolePlayerId] = [Load].[FindRolePlayerId] (m.[PolicyId], m.[FirstName], m.[Surname], m.[IdNumber], m.[DateOfBirth])
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier

	update m set 
		m.[RolePlayerExists] = 1
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[RolePlayerId] > 0

	-- Update representative ID's
	update m set
		m.[RepresentativeId] = t.[RepresentativeId]
	from [Load].[ConsolidatedFuneralMember] m
		inner join (
			select r.[Id] [RepresentativeId],
				m.[RepIdNumber],
				rank() over (partition by r.[IdNumber] order by r.[CreatedDate] desc) [Rank]
			from [Load].[ConsolidatedFuneralMember] m   
				inner join [broker].[Representative] r   on r.[IdNumber] = m.[RepIdNumber] and r.[IsDeleted] = 0
			where m.[FileIdentifier] = @fileIdentifier
			  and isnull([RepIdNumber], '') <> ''
	  ) t on t.[RepIdNumber] = m.[RepIdNumber] and t.[Rank] = 1
	where m.[FileIdentifier] = @fileIdentifier
	  and t.[Rank] = 1

	-- Update brokerage ID's
	update m set
		m.[BrokerageId] = t.[BrokerageId]
	from [Load].[ConsolidatedFuneralMember] m
		inner join (
			select b.[Id] [BrokerageId],
				br.[RepresentativeId],
				rank() over (partition by br.[RepresentativeId] order by br.[CreatedDate] desc) [Rank]
			from [Load].[ConsolidatedFuneralMember] m   
				inner join [broker].[BrokerageRepresentative] br   on br.[RepresentativeId] = m.[RepresentativeId]
				inner join [broker].[Brokerage] b   on b.[Id] = br.[BrokerageId]
			where m.[FileIdentifier] = @fileIdentifier
			  and br.[IsDeleted] = 0
		) t on t.[RepresentativeId] = m.[RepresentativeId]
	where m.[FileIdentifier] = @fileIdentifier
	  and t.[Rank] = 1

	-- Update gender of duplicate records where the gender of one might have been omitted
	update m set
		m.[Gender] = t.[Gender]
	from [Load].[ConsolidatedFuneralMember] m 
		inner join (
			select [FileIdentifier],
				[IdTypeId],
				[IdNumber],
				[Gender]
			from [Load].[ConsolidatedFuneralMember]   
			where [FileIdentifier] = @fileIdentifier
			  and isnull([Gender], '') <> ''
		) t on t.[FileIdentifier] = m.[FileIdentifier] and t.[IdTypeId] = m.[IdTypeId] and t.[IdNumber] = m.[IdNumber]
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[Gender] <> t.[Gender]

	-- Update existing cover of members
	update m set
		m.[ExistingCover] = t.[ExistingCover]
	from [Load].[ConsolidatedFuneralMember] m   
		inner join (
			select @fileIdentifier [FileIdentifier],
				m.[RolePlayerId],
				m.[PolicyCover],
				sum(iif(isnull(pil.[CoverAmount], 0) > 0, pil.[CoverAmount], br.[BenefitAmount])) [ExistingCover]
			from [Load].[ConsolidatedFuneralMember] m   
				inner join [policy].[PolicyInsuredLives] pil   on pil.[RolePlayerId] = m.[RolePlayerId]
				inner join [policy].[Policy] p   on p.[PolicyId] = pil.[PolicyId]
				inner join [product].[CurrentBenefitRate] br   on br.[ProductOptionId] = p.[ProductOptionId] and br.[BenefitId] = pil.[StatedBenefitId]
				inner join [Load].[ConsolidatedFuneralBenefit] b on b.[FileIdentifier] = m.[FileIdentifier] and b.[ProductOptionName] = m.[ProductOption] and b.[BenefitName] = m.[BenefitName]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] < 10
			  and p.[PolicyStatusId] not in (2, 4, 5, 13)
			  and p.[PolicyId] <> m.[PolicyId]
			group by m.[RolePlayerId],
				m.[PolicyCover]
		) t on t.[FileIdentifier] = m.[FileIdentifier] and t.[RolePlayerId] = m.[RolePlayerId]

	-- Update increase month where there is no increase type
	update m set
		[AnnualIncreaseMonth] = 1
	from [Load].[ConsolidatedFuneralMember] m   
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[AnnualIncreaseType] = 1
	  and isnull(m.[AnnualIncreaseMonth], 0) = 0

	-- Only one child per policy pays a premium, set the premium of others to zero
	declare @children table (
		Id int identity not null primary key,
		FileIdentifier uniqueidentifier,
		ClientReference varchar(32),
		PolicyPremium money,
		RowId int
	)
	insert into @children ([FileIdentifier], [ClientReference], [PolicyPremium], [RowId])
		select @fileIdentifier [FileIdentifier],
			m.[ClientReference],
			max(m.[PolicyPremium]) [PolicyPremium],  -- Get the highest child premium
			min(m.[Id]) [RowId]                      -- Get the first child record
		from [Load].[ConsolidatedFuneralMember] m   
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = 3
		group by m.[ClientReference]

	update m set
		m.[PolicyPremium] = 0
	from [Load].[ConsolidatedFuneralMember] m   
	where [FileIdentifier] = @fileIdentifier
	  and [CoverMemberTypeId] = 3

	update m set
		m.[PolicyPremium] = c.[PolicyPremium]
	from [Load].[ConsolidatedFuneralMember] m   
		inner join @children c on c.[FileIdentifier] = m.[FileIdentifier] and c.[RowId] = m.[Id]
	where m.[FileIdentifier] = @fileIdentifier 
	  and m.[Id] = c.[RowId]

	set nocount off

END