
CREATE   PROCEDURE [Load].[ValidatePremiumListing] (@fileIdentifier uniqueidentifier)
AS BEGIN
	
	-- declare @fileIdentifier uniqueidentifier = '89F5F22F-FFB2-492A-A54B-C45F27CD292E'

	set nocount on

	delete from [Load].[PremiumListingError] where [FileIdentifier] = @fileIdentifier

	update [Load].[PremiumListingMessage] set [Message] = 'Validating member data...' where [FileIdentifier] = @fileIdentifier

	declare @errors table (
		[FileIdentifier] uniqueidentifier,
		[ErrorCategory] varchar(64),
		[ErrorMessage] varchar(1024)
	)

	if not exists (select top 1 [PolicyId] from [Load].[PremiumListingCompany] where [FileIdentifier] = @fileIdentifier) begin
		insert into @errors select @fileIdentifier, 'Parent Policy Error', 'Company or policy does not exist in the system'
	end

	if not exists (select top 1 [BenefitId] from [Load].[PremiumListingBenefit] where [FileIdentifier] = @fileIdentifier) begin
		insert into @errors select @fileIdentifier, 'Parent Policy Error', 'No policy benefits could be found for the policy'
	end

	if not exists (select top 1 [Id] from [Load].[PremiumListingMember] where [FileIdentifier] = @fileIdentifier) begin
		insert into @errors select @fileIdentifier, 'Parent Policy Error', 'No policy members could be found for the policy'
	end

	insert into @errors 
	select @fileIdentifier, 'Parent Policy Error', concat('Parent policy ', p.[PolicyNumber], ' is in invalid status ', ps.[Name])
		from [Load].[PremiumListingCompany] c with (nolock)
		inner join [policy].[Policy] p with (nolock) on p.[PolicyId] = c.[PolicyId]
		inner join [common].[PolicyStatus] ps with (nolock) on ps.[Id] = p.[PolicyStatusId]
		where c.[FileIdentifier] = @fileIdentifier
		  and p.[PolicyStatusId] in (2, 5, 13)

	-- Member names
	insert into @errors 
		select @fileIdentifier, 'Member Name Error',
			concat('Member ',[MemberName],' with ID number ',[IdNumber],' has a missing first or last name.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and (isnull([FirstName], '') = '' or isnull([Surname], '') = '')

	-- Missing date of birth
	insert into @errors 
		select @fileIdentifier, 'Date Error',
			concat('Member ',[MemberName],' with ID number ',[IdNumber],' does not have a valid date of birth.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and [DateOfBirth] is null

	-- Missing join dates
	insert into @errors 
		select @fileIdentifier, 'Date Error',
			concat('Member ',[MemberName],' with ID number ',[IdNumber],' does not have a policy join date.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and isnull([TestJoinDate], '') = ''

	-- Join dates not on the first of the month
	insert into @errors 
		select @fileIdentifier, 'Date Error',
			concat('Member ',[MemberName],' with ID number ',[IdNumber],' does not have a valid policy join date (',[TestJoinDate],').')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and isdate([TestJoinDate]) = 1
		  and day(cast([TestJoinDate] as date)) != 1

	-- Invalid dependant join dates.
	insert into @errors
		select @fileIdentifier, 'Date Error',
			concat('Join date ',m.[JoinDate],' of dependant member ',m.[MemberName],' with ID number ',m.[IdNumber],' cannot be before main member join date ',t.[JoinDate],'.')
		from [Load].[PremiumListingMember] m with (nolock)
		inner join (
			select [ClientReference],
				[IdNumber],
				[JoinDate]
			from [Load].[PremiumListingMember] m with (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			) t on t.[ClientReference] = m.[ClientReference]
			   and t.[IdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] != 1
		  and m.[JoinDate] < t.[JoinDate]

	-- Multiple dates of birth for the same member
	insert into @errors
		select @fileIdentifier, 'Date Error',
			concat('Member ', [MemberName], ' with ID number ', [IdNumber], ' has multiple dates of birth, ', [MaxDate], ' and ', [MinDate], ', specified in the file')
		from (		
			select MemberName,
				IdNumber,
				min(DateOfBirth) [MinDate],
				max(DateOfBirth) [MaxDate]
			from [Load].[PremiumListingMember] with (nolock)
			where [FileIdentifier] = @fileIdentifier
			group by MemberName,
				IdNumber
			) t
		where [MinDate] <> [MaxDate]

	-- Invalid user names
	insert into @errors 
		select @fileIdentifier, 'Contact Details',
			concat('The first name of member ',[MemberName],' born on ',[TestDateOfBirth],' exceeds the maximum length of 50.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and len([FirstName]) > 50

	insert into @errors 
		select @fileIdentifier, 'Contact Details',
			concat('The surname of member ',[MemberName],' born on ',[TestDateOfBirth],' exceeds the maximum length of 50.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and len([Surname]) > 50

	insert into @errors 
		select @fileIdentifier, 'Contact Details',
			concat('The surname of member ',[MemberName],' born on ',[TestDateOfBirth],' appears to be an invalid company name.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and (right([Surname], 4) = ' ltd' or [Surname] like '% pty %' or [Surname] like '(pty)')

	-- Missing ID numbers
	insert into @errors 
		select @fileIdentifier, 'Missing ID Numbers',
			concat('Member ',[MemberName],' born on ',[TestDateOfBirth],' does not have a valid ID or passport number.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and isnull([IdNumber], '') = ''
		  
	-- All dependents linked to a main member
	insert into @errors
		select @fileIdentifier, 'Missing ID Numbers',
			concat('Member ',m.[MemberName],' with ID number ',iif(charindex('-',m.[IdNumber]) > 1, substring(m.[IdNumber], charindex('-',m.[IdNumber]) + 1, 100), m.[IdNumber]),' is not correctly linked to a main policy member with ID number ',m.[MainMemberIdNumber],'.')
		from [Load].[PremiumListingMember] m with (nolock)
			left join (
				select [ClientReference], [IdNumber]
				from [Load].[PremiumListingMember] with (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] = 1
			) t on t.[IdNumber] = m.[MainMemberIdNumber] and t.[ClientReference] = m.[ClientReference]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] != 1
		  and t.[IdNumber] is null


	-- Duplicate ID numbers for different members on the same policy
	insert into @errors
		select @fileIdentifier, 'Missing ID Numbers',
		concat('ID number ',m.[IdNumber],' appears on the policy for main member with ID number ',m.[MainMemberIdNumber],' ',count(*),' times')
		from [Load].[PremiumListingMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] < 10
		group by m.[ClientReference],
		  m.[IdNumber],
		  m.[MainMemberIdNumber]
		having count(*) > 1

	-- Duplicate members on the same policy
	insert into @errors
		select distinct @fileIdentifier, 'Duplicate Policies',
			concat('Member ',m.[MemberName],' with ID number ',m.[IdNumber],' appears on the same policy ',t.[ClientReference],' for member ',t.[MainMemberName],' with ID number ',t.[MainMemberIdNumber],' ',count(*),' times.')
		from [Load].[PremiumListingMember] m with (nolock)
			inner join (
				select [ClientReference], [MemberName] [MainMemberName], [IdNumber] [MainMemberIdNumber]
				from [Load].[PremiumListingMember] m with (nolock)
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] = 1
			) t on t.[ClientReference] = m.[ClientReference]
			   and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] not in (1, 99)
		group by m.[MemberName],
			   m.[IdNumber],
			   t.[MainMemberName],
			   t.[MainMemberIdNumber],
			   t.[ClientReference]
		having count(*) > 2

	-- Duplicate client references in the file
	insert into @errors
		select @fileIdentifier, 'Duplicate Policies',
			concat('Policy with client reference ',m.[ClientReference],' appears in the import file ',count(*),' times.')
		from [Load].[PremiumListingMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = 1
		  and m.[ClientReference] != ''
		group by m.[ClientReference]
		having count(*) > 1

	-- Duplicate members with different details
	insert into @errors
		select distinct @fileIdentifier, 'Duplicate Members',
			concat('Same member with ID number ', t.[IdNumber],' appears in the file with different member details ',t.[Records],' times')
		from (
			select m.[FileIdentifier],
				m.[MemberName],
				m.[IdTypeId],
				m.[IdNumber],
				m.[DateOfBirth],
				t.[Records],
				count(*) [Members]
			from [Load].[PremiumListingMember] m
				inner join (
					select [FileIdentifier],	
						[IdNumber], 
						count(*) [Records]
					from [Load].[PremiumListingMember] m
					where m.[FileIdentifier] = @fileIdentifier
					group by [FileIdentifier],
						[IdNumber]
					having count(*) > 1
				) t on t.[FileIdentifier] = m.[FileIdentifier] and t.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			group by m.[FileIdentifier],	
				m.[MemberName],
				m.[IdTypeId],
				m.[IdNumber],
				m.[DateOfBirth],
				t.[Records]
			having count(*) = 1
		) t

	-- Client reference already exists in the system for another user.
	insert into @errors
		select @fileIdentifier, 'Duplicate Policies',
			concat('Policy with reference ',t.[ClientReference],' for member ',t.[MemberName],' with ID number ',t.[IdNumber],' already belongs to existing policy ',p.[PolicyNumber],' for ',pn.[FirstName],' ',pn.[Surname],' with ID number ',pn.[IdNumber])
		from [policy].[Policy] p with (nolock)
			inner join [client].[Person] pn  with (nolock) on pn.[RolePlayerId] = p.[PolicyOwnerId]
			inner join (
				select m.[ClientReference],
					   m.[IdTypeId],
					   m.[IdNumber],
					   m.[MemberName]
				from [Load].[PremiumListingMember] m with (nolock)
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] = 1
				  and left(m.[ClientReference], 3) != 'xXx'
			) t on t.[ClientReference] = p.[ClientReference]
			   and (t.[IdTypeId] != pn.[IdTypeId] or t.[IdNumber] != pn.[IdNumber])
	
	-- Client reference already exists for the same user on another policy
	insert into @errors
		select @fileIdentifier, 'Duplicate Policies',
			concat('Member ',t.[MemberName],' with ID number ',t.[IdNumber],' already has another policy with reference ',t.[ClientReference])
		from [policy].[Policy] p with (nolock)
			inner join [client].[Person] pn with (nolock) on pn.[RolePlayerId] = p.[PolicyOwnerId]
			inner join (
				select m.[ParentPolicyId],
					   m.[ClientReference],
					   m.[IdTypeId],
					   m.[IdNumber],
					   m.[MemberName]
				from [Load].[PremiumListingMember] m with (nolock)
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] = 1
				  and left(m.[ClientReference], 3) != 'xXx'
			) t on t.[ClientReference] = p.[ClientReference]
				and t.[IdTypeId] = pn.[IdTypeId]
				and t.[IdNumber] = pn.[IdNumber]
				and t.[ParentPolicyId] != isnull(p.[ParentPolicyId], 0)

	-- Missing residential address
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('Residential address for main member ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'),' is missing')
		from [Load].[PremiumListingMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = 1
		  and isnull(m.[Address1], '') = ''

	-- Missing postal address
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('Postal address for main member ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'),' is missing')
		from [Load].[PremiumListingMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = 1
		  and isnull(m.[PostalAddress1], '') = ''

	-- Invalid email addresses
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('Email address ', isnull([Email],''), ' for member ',[MemberName], ' with ID ',[IdNumber],' is invalid')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
			and isnull([Email], '') != ''
			and not ([Email] LIKE '%_@__%.__%' AND PATINDEX('%[^a-z,0-9,@,.,_,\-]%', [Email]) = 0)
	-- Missing preferred communication methods
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('No preferred contact email address has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
			and [CoverMemberTypeId] in (1, 99)
			and [PreferredCommunication] = 1
			and isnull([Email], '') = ''
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('No preferred contact telephone number has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
			and [CoverMemberTypeId] in (1, 99)
			and [PreferredCommunication] = 2
			and isnull([CelNo], '') = ''
			and isnull([TelNo], '') = ''
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('No preferred contact mobile number has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
			and [CoverMemberTypeId] in (1, 99)
			and [PreferredCommunication] = 3
			and isnull([CelNo], '') = ''
	insert into @errors
		select @fileIdentifier, 'Contact Details',
			concat('No preferred contact postal address has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
			and [CoverMemberTypeId] in (1, 99)
			and [PreferredCommunication] = 4
			and isnull([PostalAddress1], '') = ''

	-- Missing previous insurer details
	insert into @errors
		select @fileIdentifier, 'Previous Insurer', 
			concat('Missing previous insurer policy number or start date for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and [PreviousInsurer] <> ''
		  and (isnull([PreviousInsurerPolicyNumber], '') = ''
		       or isnull([PreviousInsurerStartDate], '') = ''
		  )

	-- Missing benefits
	insert into @errors
		select @fileIdentifier, 'Missing Benefit',
			concat('Benefit ',[BenefitName],' for ',case [CoverMemberTypeId] when 1 then 'main' when 2 then 'spouse' when 3 then 'child' else 'extended family' end,' member ',[MemberName],' with ID ',[IdNumber],' could not be found in the system.')
		from [Load].[PremiumListingMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
			and [CoverMemberTypeId] != 99
			and [BenefitId] = 0

	declare @relaxDate date
	select @relaxDate = isnull(convert(date, [Value]), '1970-01-01') from [common].[Settings] where [Key] = 'OnboardingRulesRelax'

	-- Age range for adults
	insert into @errors
		select @fileIdentifier, 'Missing Benefit',
			concat('Member ',m.[MemberName],' with ID number ',m.[IdNumber],' falls outside the age range of ',b.[MinEntryAge],' to ',b.[MaxEntryAge],' for ',m.[BenefitName],' at ',m.[JoinAge],'.')
		from [Load].[PremiumListingMember] m with (nolock)
			inner join [Load].[PremiumListingBenefit] b with (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[BenefitId] = m.[BenefitId]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[CoverMemberTypeId] in (1, 2, 4)
			and m.[BenefitId] > 0
			and m.[JoinDate] > @relaxDate
			and m.[JoinAge] not between (b.[MinEntryAge] - 1) and b.[MaxEntryAge]

	-- Age range for children
	insert into @errors
		select @fileIdentifier, 'Missing Benefit',
			concat('Member ',m.[MemberName],' with ID number ',m.[IdNumber],' falls outside the age range of ',b.[MinEntryAge],' to ',b.[MaxEntryAge],' for ',m.[BenefitName],' at ',m.[JoinAge],'.')
		from [Load].[PremiumListingMember] m with (nolock)
			inner join [Load].[PremiumListingBenefit] b with (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[BenefitId] = m.[BenefitId]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[CoverMemberTypeId] = 3
			and m.[BenefitId] > 0
			and m.[DateOfBirth] >= @relaxDate
			and m.[Age] not between b.[MinEntryAge] and b.[MaxEntryAge]

	-- Cover amounts
	insert into @errors
		select @fileIdentifier, 'Cap Cover',
			concat('Adding ',b.[BenefitAmount],' to existing cover of ',m.[ExistingCover],' will exceed cap of ',b.[CapCover],' for member ',m.[MemberName],' with ID number ',m.[IdNumber],'.')
		from [Load].[PremiumListingMember] m with (nolock)
			inner join [Load].[PremiumListingBenefit] b with (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[BenefitId] = m.[BenefitId]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[CoverMemberTypeId] != 99
			and m.[BenefitId] > 0
			and m.[ExistingCover] + b.[BenefitAmount] > b.[CapCover]

	-- Max members per benefit
	insert into @errors
		select @fileIdentifier, 'Max Members',
			concat(t.[Members],' exceeds the maximum number of ',t.[MaxPersonsPerBenefit],' members for benefit ',b.[BenefitName],' for main member ',m.[MemberName],' with ID number ',m.[IdNumber],'.')
		from [Load].[PremiumListingMember] m  with (nolock)
			inner join (
				select m.[ClientReference],
					   m.[MainMemberIdNumber],
					   m.[CoverMemberTypeId],
					   m.[BenefitId],
					   b.[MaxPersonsPerBenefit],
					   count(*) [Members]
				from [Load].[PremiumListingMember] m with (nolock)
					inner join [Load].[PremiumListingBenefit] b with (nolock) on
						b.[FileIdentifier] = m.[FileIdentifier] and 
						b.[BenefitId] = m.[BenefitId]
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] != 99
				group by m.[ClientReference],
					   m.[MainMemberIdNumber],
					   m.[CoverMemberTypeId],
					   m.[BenefitId],
					   b.[MaxPersonsPerBenefit]
			) t on t.[ClientReference] = m.[ClientReference] and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
			inner join [Load].[PremiumListingBenefit] b with (nolock) on 
				b.[FileIdentifier] = m.[FileIdentifier] and 
				b.[BenefitId] = t.[BenefitId]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = 1
		  and t.[Members] > t.[MaxPersonsPerBenefit]

	-- Max members per benefit
	insert into @errors
		select @fileIdentifier, 'Max Members',
			concat(t.[Members],' exceeds the maximum number of ',t.[MaxPersonsPerProductOption],' for ',t.[RolePlayerType],' members on the product option for main member ',m.[MemberName],' with ID number ',m.[IdNumber],'.')
		from [Load].[PremiumListingMember] m with (nolock)
			inner join (
				select m.[ClientReference],
					   m.[MainMemberIdNumber],
					   rt.[Name] [RolePlayerType],
					   b.[MaxPersonsPerProductOption],
					   count(*) [Members]
				from [Load].[PremiumListingMember] m with (nolock)
					inner join [Load].[PremiumListingBenefit] b with (nolock) on
						b.[FileIdentifier] = m.[FileIdentifier] and 
						b.[BenefitId] = m.[BenefitId]
					inner join [client].[RolePlayerType] rt with (nolock) on rt.[RolePlayerTypeId] = m.[RolePlayerTypeId]
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] != 99
				group by m.[ClientReference],
					   m.[MainMemberIdNumber],
					   rt.[Name],
					   b.[MaxPersonsPerProductOption]
			) t on t.[ClientReference] = m.[ClientReference] and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] = 1
		  and t.[Members] > t.[MaxPersonsPerProductOption]

	if exists (select top 1 * from @errors) begin
		insert into [Load].[PremiumListingError] ([FileIdentifier], [ErrorCategory], [ErrorMessage])
			select distinct @fileIdentifier, [ErrorCategory], [ErrorMessage] from @errors
			order by [ErrorCategory], [ErrorMessage]
	end

	-- select count(distinct ErrorMessage) [ErrorCount] from @errors
	exec [Load].[PremiumListingSummary] @fileIdentifier

	set nocount off

END
