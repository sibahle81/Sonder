CREATE PROCEDURE [Load].[ValidateConsolidatedFuneral] @fileIdentifier uniqueidentifier
AS BEGIN
	
	-- declare @fileIdentifier uniqueidentifier = '15CFC7DA-03B2-4502-BACA-29FE28A207A6'

	set nocount on

	-- clear existing exceptions whether policy has already been created or not
	delete from [Load].[ConsolidatedFuneralError] where [FileIdentifier] = @fileIdentifier

	-- do not continue if the wizard has already been processed
	if Load.ConsolidatedFuneralPolicyCreated(@fileIdentifier) = 0 begin		

		declare @maximumCover table (
			MinimumAge int,
			MaximumAge int,
			MaximumCover money
		)
	
		insert into @maximumCover (MinimumAge, MaximumAge, maximumCover) VALUES
			(0, 5, 20000),
			(6, 14, 50000);
		
		declare @errors table (
			[FileIdentifier] uniqueidentifier,
			[MainMemberIdNumber] varchar(16),
			[ErrorCategory] varchar(64),
			[ErrorMessage] varchar(1024)
		)

		-- Check if this is a Consolidated Funeral import
		declare @productOption varchar(128)
		declare @isCfp bit = 0
	
		select @productOption = [ProductOptionName]
		from [Load].[ConsolidatedFuneralBenefit] (nolock)
		where [FileIdentifier] = @fileIdentifier
		group by [ProductOptionName]

		if (left(@productOption, 20) = 'Consolidated Funeral') begin
			set @isCfp = 1
		end

		if @isCfp = 1 begin
			-- Annual increase type or increase month
			insert into @errors 
				select @fileIdentifier, 
					[MainMemberIdNumber],
					'Annual Increase Type Error',
					concat('Member ',[MemberName],' with ID number ',[IdNumber],' has missing annual increase details.')
				from [Load].[ConsolidatedFuneralMember] (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] = 1
				  and (isnull([AnnualIncreaseType], 0) = 0 or isnull([AnnualIncreaseMonth], 0) = 0)
		end

		-- Policy numbers
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber],
				'Policy Number Error',
				concat('Policy ',m.[ClientReference],' does not exist in the system.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join [policy].[Policy] p (nolock) on p.PolicyNumber = m.ClientReference
			where [FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and left(m.[ClientReference], 3) <> 'XXX'
			  and m.[ClientReference] not like concat(m.[MainMemberIdNumber],'-%')
			  and p.PolicyId is null

		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber],
				'Policy Number Error',
				concat('Policy ',m.[ClientReference],' does not belong to main member ',m.MemberName,' with ID number ',m.IdNumber,'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [policy].[Policy] p (nolock) on p.PolicyNumber = m.ClientReference
				left join [client].[Person] per (nolock) on per.RolePlayerId = p.PolicyOwnerId and per.IdNumber = m.IdNumber
			where [FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and left(m.[ClientReference], 3) <> 'XXX'
			  and per.RolePlayerId is null

		insert into @errors 
			select @fileIdentifier, 
					[MainMemberIdNumber],
					'Policy Number Error',
					concat('Policy ',p.PolicyNumber,' for ',m.MemberName,' is on invalid status ',ps.Name,'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join policy.Policy p (nolock) on p.PolicyId = m.PolicyId
				inner join common.PolicyStatus ps (nolock) on ps.Id = p.PolicyStatusId
			where m.[FileIdentifier] = @fileIdentifier
			  and m.CoverMemberTypeId = 1
			  and m.PolicyId > 0
			  and m.PolicyExists = 1
			  and p.PolicyStatusId in (2, 5, 13)

		-- Member names
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Member Name Error',
				concat('Member ',[MemberName],' with ID number ',[IdNumber],' has a missing first or last name.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and (isnull([FirstName], '') = '' or isnull([Surname], '') = '')

		-- Missing date of birth
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Date Error',
				concat('Member ',[MemberName],' with ID number ',[IdNumber],' does not have a valid date of birth (',[TestDateOfBirth],').')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [DateOfBirth] is null

		-- Missing join dates
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Date Error',
				concat('Member ',[MemberName],' with ID number ',[IdNumber],' does not have a policy join date.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] < 10
			  and isnull([TestJoinDate], '') = ''

		-- Join date not on the first of the month
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Date Error',
				concat('Join date ',[JoinDate],' of member ',[MemberName],' with ID number ',[IdNumber],' is not on the first of the month.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] < 10
			  and day(JoinDate) <> 1

		-- Join date too far in the future
		declare @cutoff date = dateadd(month, 3, getdate())
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Date Error',
				concat('Join date ',[JoinDate],' of member ',[MemberName],' with ID number ',[IdNumber],' is too far in the future.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [JoinDate] > @cutoff

		-- Invalid dependant join dates.
		insert into @errors
			select @fileIdentifier, 
				m.[MainMemberIdNumber], 
				'Date Error',
				concat('Join date ',m.[JoinDate],' of dependant member ',m.[MemberName],' with ID number ',m.[IdNumber],' cannot be before main member join date ',t.[JoinDate],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			inner join (
				select [ClientReference],
					[IdNumber],
					[JoinDate]
				from [Load].[ConsolidatedFuneralMember] m (nolock)
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] = 1
				) t on t.[ClientReference] = m.[ClientReference]
				   and t.[IdNumber] = m.[MainMemberIdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] not in (1, 99)
			  and m.[JoinDate] < t.[JoinDate]

		-- Multiple dates of birth for the same member
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Date Error',
				concat('Member ', [MemberName], ' with ID number ', [IdNumber], ' has multiple dates of birth, ', [MaxDate], ' and ', [MinDate], ', specified in the file')
			from (		
				select MemberName,
					MainMemberIdNumber,
					IdNumber,
					min(DateOfBirth) [MinDate],
					max(DateOfBirth) [MaxDate]
				from [Load].[ConsolidatedFuneralMember] (nolock)
				where [FileIdentifier] = @fileIdentifier
				group by MemberName,
					MainMemberIdNumber,
					IdNumber
				) t
			where [MinDate] <> [MaxDate]

		-- Invalid user names
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details',
				concat('The first name of member ',[MemberName],' born on ',[TestDateOfBirth],' exceeds the maximum length of 50.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and len([FirstName]) > 50

		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details',
				concat('The surname of member ',[MemberName],' born on ',[TestDateOfBirth],' exceeds the maximum length of 50.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and len([Surname]) > 50

		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details',
				concat('The surname of member ',[MemberName],' born on ',[TestDateOfBirth],' appears to be an invalid company name.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and (right([Surname], 4) = ' ltd' or [Surname] like '% pty %' or [Surname] like '(pty)')

		-- Missing ID numbers
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing ID Numbers',
				concat('ID number ',[IdNumber],' of main member ',[MemberName],' is invalid - ID number is ',len([IdNumber]),' digits long')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
			  and len([IdNumber]) <> 13
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing ID Numbers',
				concat('Member ',[MemberName],' born on ',[TestDateOfBirth],' does not have a valid ID or passport number.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and isnull([IdNumber], '') = ''
		  
		insert into @errors 
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing ID Numbers',
				concat('Spouse ',[MemberName],' born on ',[TestDateOfBirth],' requires a valid ID number.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 2
			  and len([IdNumber]) != 13
			  and isnumeric([IdNumber]) = 0

		insert into @errors 
			select distinct @fileIdentifier, 
				m.[MainMemberIdNumber], 
				'Invalid ID Numbers',
				concat('Member ',m.MemberName,' with date of birth ',m.DateOfBirth,' appears on the policy for main member ',m.MainMemberIdNumber,' with different ID numbers')
				--concat('ID number ',m.[IdNumber],' appears on the policy for main member with ID number ',m.[MainMemberIdNumber],' ',count(*),' times')
			from Load.ConsolidatedFuneralMember m (nolock)
				inner join Load.ConsolidatedFuneralMember x (nolock) on
					x.FileIdentifier = m.FileIdentifier and
					x.MainMemberIdNumber = m.MainMemberIdNumber and
					x.MemberName = m.MemberName and
					x.DateOfBirth = m.DateOfBirth
			where m.FileIdentifier = @fileIdentifier
			  and m.IdTypeId <> x.IdTypeId
			  and m.IdNumber <> x.IdNumber

		-- All dependents linked to a main member
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing ID Numbers',
				concat('Member ',m.[MemberName],' with ID number ',iif(charindex('-',m.[IdNumber]) > 1, substring(m.[IdNumber], charindex('-',m.[IdNumber]) + 1, 100), m.[IdNumber]),' is not correctly linked to a main policy member with ID number ',m.[MainMemberIdNumber],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join (
					select [ClientReference], 
						[IdNumber]
					from [Load].[ConsolidatedFuneralMember] (nolock)
					where [FileIdentifier] = @fileIdentifier
					  and [CoverMemberTypeId] = 1
				) t on t.[IdNumber] = m.[MainMemberIdNumber] and t.[ClientReference] = m.[ClientReference]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] != 1
			  and t.[IdNumber] is null

		-- All dependants correctly linked to main member
		insert into @errors
			select @fileIdentifier, 
				t.[MainMemberIdNumber], 
				'Main Member ID Number',
				concat('Main member ID number ',m.[MainMemberIdNumber],' for ',m.[MemberName],' with ID number ',iif(len(m.[IdNumber]) = 13, m.[IdNumber], cast(m.[DateOfBirth] as varchar(16))),' is incorrect')
			from [Load].[ConsolidatedFuneralMember] m
				inner join (
					select t.[ClientReference],
						m.[IdNumber] [MainMemberIdNumber]
					from [Load].[ConsolidatedFuneralMember] m (nolock)
						inner join (
							select [ClientReference],
								count(*) [Members]
							from [Load].[ConsolidatedFuneralMember] (nolock)
							where [FileIdentifier] = @fileIdentifier
							group by [ClientReference]
						) t on t.[ClientReference] = m.[ClientReference]
					where m.[FileIdentifier] = @fileIdentifier
					  and m.[CoverMemberTypeId] = 1
				) t on t.[ClientReference] = m.[ClientReference]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] <> 1
			  and m.[MainMemberIdNumber] <> t.[MainMemberIdNumber]

		-- Beneficiary age
		insert into @errors
			select @fileIdentifier, 
				m.[MainMemberIdNumber],
				'Beneficiary Age',
				concat('Beneficiary ',m.[MemberName],' with ID number ',m.[IdNumber],' is younger than 18 years of age.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			where m.[FileIdentifier] = @fileIdentifier 
			  and m.[CoverMemberTypeId] = 99
			  and m.[Age] < 18

		-- Duplicate ID numbers for different members on the same policy
		insert into @errors
			select @fileIdentifier, 
				m.[MainMemberIdNumber], 
				'Missing ID Numbers',
				concat('ID number ',m.[IdNumber],' appears on the policy for main member with ID number ',m.[MainMemberIdNumber],' ',count(*),' times')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] < 10
			group by m.[ClientReference],
			  m.[IdNumber],
			  m.[MainMemberIdNumber]
			having count(*) > 1

		-- Duplicate members on the same policy
		insert into @errors
			select @fileIdentifier, 
				t.[MainMemberIdNumber], 
				'Duplicate Members',
				concat('Member ',m.[MemberName],' born on ',m.[DateOfBirth],' appears on the same policy ',t.[ClientReference],' for member ',t.[MainMemberName],' with ID number ',t.[MainMemberIdNumber],' ',count(*),' times.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join (
					select [ClientReference], 
						[MemberName] [MainMemberName], 
						[IdNumber] [MainMemberIdNumber]
					from [Load].[ConsolidatedFuneralMember] m (nolock)
					where m.[FileIdentifier] = @fileIdentifier
					  and m.[CoverMemberTypeId] = 1
				) t on t.[ClientReference] = m.[ClientReference]
				   and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] not in (1, 99)
			group by m.[MemberName],
				   m.[DateOfBirth],
				   t.[MainMemberName],
				   t.[MainMemberIdNumber],
				   t.[ClientReference]
			having count(*) > 1

		-- Missing gender validations
		if (@isCfp = 1) begin
			insert into @errors
				select @fileIdentifier, 
					[MainMemberIdNumber], 
					'Member Details',
					concat('Member ',m.[MemberName],' with ID number ',m.[IdNumber],' does not have a gender selected')
				from [Load].[ConsolidatedFuneralMember] m (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and isnull([Gender], '') = ''

			-- Inconsistent genders
			insert into @errors
				select @fileIdentifier, 
					[MainMemberIdNumber], 
					'Gender Error',
					concat('Member ',concat(m.[FirstName], ' ', m.[Surname]),' born on ',m.[DateOfBirth],' has ',count(distinct m.[Gender]),' different gender assignments')
				from [Load].[ConsolidatedFuneralMember] m (nolock)
				where m.[FileIdentifier] = @fileIdentifier
				group by m.[FirstName],
					m.[Surname],
					m.[MainMemberIdNumber],
					m.[DateOfBirth]
				having count(distinct m.[Gender]) > 1
		end

		-- Duplicate client references in the file
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Duplicate Policies',
				concat('Policy with client reference ',m.[ClientReference],' appears in the import file ',count(*),' times.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[ClientReference] != ''
			group by m.[ClientReference],
				m.[MainMemberIdNumber]
			having count(*) > 1

		-- Client reference already exists in the system for another user.
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Duplicate Policies',
				concat('Policy with reference ',t.[ClientReference],' for member ',t.[MemberName],' with ID number ',t.[IdNumber],' already belongs to existing policy ',p.[PolicyNumber],' for ',pn.[FirstName],' ',pn.[Surname],' with ID number ',pn.[IdNumber])
			from [policy].[Policy] p (nolock)
				inner join [client].[Person] pn (nolock) on pn.[RolePlayerId] = p.[PolicyOwnerId]
				inner join (
					select m.[ClientReference],
						   m.[IdTypeId],
						   m.[MainMemberIdNumber],
						   m.[IdNumber],
						   m.[MemberName]
					from [Load].[ConsolidatedFuneralMember] m (nolock)
					where m.[FileIdentifier] = @fileIdentifier
					  and m.[CoverMemberTypeId] = 1
					  and left(m.[ClientReference], 3) != 'xXx'
				) t on t.[ClientReference] = p.[ClientReference]
				   and (t.[IdTypeId] != pn.[IdTypeId] or t.[IdNumber] != pn.[IdNumber])
	
		-- Client reference already exists for the same user on another policy
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Duplicate Policies',
				concat('Member ',t.[MemberName],' with ID number ',t.[IdNumber],' already has another policy with reference ',t.[ClientReference])
			from [policy].[Policy] p (nolock)
				inner join [client].[Person] pn (nolock) on pn.[RolePlayerId] = p.[PolicyOwnerId]
				inner join (
					select m.[ClientReference],
							m.[MainMemberIdNumber],
							m.[IdTypeId],
							m.[IdNumber],
							m.[MemberName],
							m.[PolicyId]
					from [Load].[ConsolidatedFuneralMember] m (nolock)
					where m.[FileIdentifier] = @fileIdentifier
						and m.[CoverMemberTypeId] = 1
						and left(m.[ClientReference], 3) != 'xXx'
				) t on t.[ClientReference] = p.[ClientReference]
					and t.[IdTypeId] = pn.[IdTypeId]
					and t.[IdNumber] = pn.[IdNumber]
			where t.[PolicyId] <> p.[PolicyId]

		-- Missing residential address
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('Residential address for main member ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'),' is missing')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and isnull(m.[Address1], '') = ''

		-- Missing postal address
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('Postal address for main member ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'),' is missing')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and isnull(m.[PostalAddress1], '') = ''

		-- Invalid email addresses
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('Email address ', isnull([Email],''), ' for member ',[MemberName], ' with ID ',[IdNumber],' is invalid')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
				and isnull([Email], '') != ''
				and not ([Email] LIKE '%_@__%.__%' AND PATINDEX('%[^a-z,0-9,@,.,_,\-]%', [Email]) = 0)

		-- Missing preferred communication methods
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('Preferred communication type has not been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
			  and isnull([PreferredCommunication], '') = ''
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('No preferred contact email address has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
				and [CoverMemberTypeId] in (1, 99)
				and [PreferredCommunication] = 1
				and isnull([Email], '') = ''
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('No preferred contact telephone number has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
				and [CoverMemberTypeId] in (1, 99)
				and [PreferredCommunication] = 2
				and isnull([CelNo], '') = ''
				and isnull([TelNo], '') = ''
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details', 
				concat('No preferred contact mobile number has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
				and [CoverMemberTypeId] in (1, 99)
				and [PreferredCommunication] = 3
				and isnull([CelNo], '') = ''
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Contact Details',
				concat('No preferred contact postal address has been set for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
				and [CoverMemberTypeId] in (1, 99)
				and [PreferredCommunication] = 4
				and isnull([PostalAddress1], '') = ''

		-- Missing benefits
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing Benefit',
				concat('Benefit ',[BenefitName],' for ',case [CoverMemberTypeId] when 1 then 'main' when 2 then 'spouse' when 3 then 'child' else 'extended family' end,' member ',[MemberName],' with ID ',[IdNumber],' could not be found in the system.')
			from [Load].[ConsolidatedFuneralMember] (nolock)
			where [FileIdentifier] = @fileIdentifier
				and [CoverMemberTypeId] != 99
				and [BenefitId] = 0

		-- Incorrect premium details
		if (@isCfp = 1) begin
			insert into @errors
				select @fileIdentifier, 
					[MainMemberIdNumber], 
					'Premium Details',
					concat('Missing policy premium for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
				from [Load].[ConsolidatedFuneralMember] (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] in (1, 2, 4)
				  and isnull([PolicyPremium], 0) = 0

			insert into @errors
				select @fileIdentifier, 
					[MainMemberIdNumber], 
					'Premium Details',
					concat('Missing policy cover amount for ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'))
				from [Load].[ConsolidatedFuneralMember] (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] in (1, 2, 3, 4)
				  and isnull([PolicyCover], 0) = 0
		end

		declare @relaxDate date
		select @relaxDate = isnull(convert(date, [Value]), '1970-01-01') from [common].[Settings] where [Key] = 'OnboardingRulesRelax'

		-- Age range for adults
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing Benefit',
				concat('Member ',m.[MemberName],' with ID number ',m.[IdNumber],' falls outside the age range of ',b.[MinEntryAge],' to ',b.[MaxEntryAge],' for ',m.[BenefitName],' at ',m.[JoinAge],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralBenefit] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[ProductOptionId] = m.[ProductOptionId] and b.[BenefitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] in (1, 2, 4)
				and m.[BenefitId] > 0
				and m.[JoinDate] > @relaxDate
				and m.[JoinAge] not between b.[MinEntryAge] and b.[MaxEntryAge]

		-- Age range for children
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Missing Benefit',
				concat('Member ',m.[MemberName],' with ID number ',m.[IdNumber],' falls outside the age range of ',b.[MinEntryAge],' to ',b.[MaxEntryAge],' for ',m.[BenefitName],' at ',m.[JoinAge],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralBenefit] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[ProductOptionId] = m.[ProductOptionId] and b.[BenefitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 3
				and m.[BenefitId] > 0
				and m.[DateOfBirth] >= @relaxDate
				and m.[Age] not between b.[MinEntryAge] and b.[MaxEntryAge]

		-- Child cap cover amount
		insert into @errors
			select @fileIdentifier,
				[MainMemberIdNumber],
				'Child Cap Cover',
				concat('Cover amount of ',cast(m.[PolicyCover] as money),' for ',m.[Age],' year old child member ',upper(m.MemberName),' with dob ',cast(DateOfBirth as varchar(16)),' exceeds maximum cover of ',t.MaximumCover)
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join @maximumCover t on m.Age between t.MinimumAge and t.MaximumAge and m.[PolicyCover] > t.MaximumCover
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 3

		-- Cover amounts
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Cap Cover',
				concat('Adding ',m.[PolicyCover],' to existing cover of ',m.[ExistingCover],' will exceed cap of ',b.[CapCover],' for member ',m.[MemberName],' with ID number ',m.[IdNumber],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralBenefit] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[ProductOptionId] = m.[ProductOptionId] and b.[BenefitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] != 99
				and m.[BenefitId] > 0
				and m.[ExistingCover] + m.[PolicyCover] > b.[CapCover]

		-- Max members per benefit
		insert into @errors
			select @fileIdentifier, 
				t.[MainMemberIdNumber], 
				'Max Members',
				concat(t.[Members],' exceeds the maximum number of ',t.[MaxPersonsPerBenefit],' members for benefit ',b.[BenefitName],' for main member ',m.[MemberName],' with ID number ',m.[IdNumber],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join (
					select m.[ClientReference],
						   m.[MainMemberIdNumber],
						   m.[CoverMemberTypeId],
						   m.[BenefitId],
						   b.[MaxPersonsPerBenefit],
						   count(*) [Members]
					from [Load].[ConsolidatedFuneralMember] m (nolock)
						inner join [Load].[ConsolidatedFuneralBenefit] b (nolock) on
							b.[FileIdentifier] = m.[FileIdentifier] and 
							b.[ProductOptionId] = m.[ProductOptionId] and
							b.[BenefitId] = m.[BenefitId]
					where m.[FileIdentifier] = @fileIdentifier
					  and m.[CoverMemberTypeId] != 99
					group by m.[ClientReference],
						   m.[MainMemberIdNumber],
						   m.[CoverMemberTypeId],
						   m.[BenefitId],
						   b.[MaxPersonsPerBenefit]
				) t on t.[ClientReference] = m.[ClientReference] and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
				inner join [Load].[ConsolidatedFuneralBenefit] b (nolock) on 
					b.[FileIdentifier] = m.[FileIdentifier] and 
					b.[ProductOptionId] = m.[ProductOptionId] and
					b.[BenefitId] = t.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and t.[Members] > t.[MaxPersonsPerBenefit]

		-- Max members per benefit
		insert into @errors
			select @fileIdentifier, 
				t.[MainMemberIdNumber], 
				'Max Members',
				concat(t.[Members],' exceeds the maximum number of ',t.[MaxPersonsPerProductOption],' for ',t.[RolePlayerType],' members on the product option for main member ',m.[MemberName],' with ID number ',m.[IdNumber],'.')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join (
					select m.[ClientReference],
						   m.[MainMemberIdNumber],
						   rt.[Name] [RolePlayerType],
						   b.[MaxPersonsPerProductOption],
						   count(*) [Members]
					from [Load].[ConsolidatedFuneralMember] m (nolock)
						inner join [Load].[ConsolidatedFuneralBenefit] b (nolock) on
							b.[FileIdentifier] = m.[FileIdentifier] and 
							b.[ProductOptionId] = m.[ProductOptionId] and
							b.[BenefitId] = m.[BenefitId]
						inner join [client].[RolePlayerType] rt (nolock) on rt.[RolePlayerTypeId] = m.[RolePlayerTypeId]
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

		-- Previous insurer
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Previous Insurance',
				concat('Previous insurer ',ci.[PreviousInsurer],' for member ',m.[FirstName], ' ', m.[Surname],' with ID Number ',m.[IdNumber],' does not exist in the system')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralInsurance] ci (nolock) on ci.[FileIdentifier] = m.[FileIdentifier] and ci.[IdNumber] = m.[IdNumber]
				left join [common].[PreviousInsurer] pri (nolock) on pri.[Name] = ci.[PreviousInsurer]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] < 10
			  and pri.[Id] is null

		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Previous Insurance',
				concat('Incomplete previous insurance information for member ',m.[FirstName], ' ', m.[Surname],' with ID number ',m.[IdNumber])
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralInsurance] ci (nolock) on ci.[FileIdentifier] = m.[FileIdentifier] and ci.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] < 10
			  and (isnull(ci.[PreviousInsurerPolicyNumber], '') = '' 
				or isnull(ci.[PreviousInsurerStartDate], '') = '' 
				or isnull(ci.[SumAssured], '') = '')

		-- PERSAL number errors
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Employment Details',
				concat('PERSAL number for member ',concat(m.[FirstName], ' ', m.[Surname]),' with ID number ',m.[IdNumber],' is missing')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join [Load].[ConsolidatedFuneralDeduction] d (nolock) on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[PaymentMethodId] = 12
			  and d.Id is null

		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Employment Details',
				concat('Payroll code ',d.PayrollCode,' for member ',m.MemberName,' with ID number ', m.IdNumber, ' is not registered in the system')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralDeduction] d (nolock) on 
					d.FileIdentifier = m.FileIdentifier and
					d.IdNumber = m.IdNumber
				left join [common].[QLinkPayrollType] q (nolock) on q.Id = isnull(try_parse(d.PayrollCode as int), 0)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[PaymentMethodId] = 12
			  and q.[Id] is null

		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Employment Details',
				concat('PERSAL number ',d.[PersalNumber],' for member ',concat(m.[FirstName], ' ', m.[Surname]),' with ID number ',m.[IdNumber],' is invalid')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralDeduction] d (nolock) on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[PaymentMethodId] = 12
			  and isnull(d.[PersalNumber], '') <> ''
			  and isnumeric(d.[PersalNumber]) = 0		  

		-- Payroll Code
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Employment Details',
				concat('Employee number for member ',concat(m.[FirstName], ' ', m.[Surname]),' with ID number ',m.[IdNumber],' is missing')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join [Load].[ConsolidatedFuneralDeduction] d (nolock) on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[PaymentMethodId] = 19
			  and (d.[Id] is null or isnull(d.[PersalNumber], '') = '')

		-- Stop order employer code
		insert into @errors
			select @fileIdentifier,
				[MainMemberIdNumber],
				'Employment Details',
				concat('Employer code for member ',concat(m.[FirstName], ' ', m.[Surname]),' with ID number ',m.[IdNumber],' is missing')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join [Load].[ConsolidatedFuneralDeduction] d (nolock) on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
				left join [client].[StopOrderCompany] co (nolock) on co.CompanyCode = substring(d.Employer, 1, len(co.CompanyCode))
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 1
				and m.[PaymentMethodId] = 19
				and co.[CompanyCode] is null

		-- Representative
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Representative',
				concat('Could not find representative with ID number ',m.[RepIdNumber],' in the system')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[ProductOption] <> ''
			  and m.[BenefitName] <> ''
			  and isnull(m.[RepresentativeId], 0) = 0

		-- Brokerage
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Brokerage',
				concat('Could not find brokerage for representative ',r.[FirstName], ' ',r.[SurnameOrCompanyName],' with ID number ',m.[RepIdNumber],' in the system')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [broker].[Representative] r (nolock) on r.[Id] = m.[RepresentativeId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and m.[ProductOption] <> ''
			  and m.[BenefitName] <> ''
			  and isnull(m.[RepresentativeId], 0) > 0
			  and isnull(m.[BrokerageId], 0) = 0

		-- Bank detail errors
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Banking Details',
				concat('Missing banking details for ',m.[MemberName],' with ID ', isnull(m.[IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join [Load].[ConsolidatedFuneralBank] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and b.[Id] is null

		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Banking Details',
				concat(b.[Bank],' branch ',b.[BranchCode],' for ',m.[MemberName],' with ID ', isnull(m.[IdNumber],'[blank]'),' is not registered in the system')
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralBank] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[IdNumber] = m.[IdNumber]
				left join [common].[BankBranch] bb (nolock) on bb.[Code] = b.[BranchCode]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and bb.[Id] is null

		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber],
				'Banking Details',
				concat('Invalid bank account type ',b.[AccountType],' for ',m.[MemberName],' with ID ', isnull(m.[IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [Load].[ConsolidatedFuneralBank] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[IdNumber] = m.[IdNumber]
				left join [common].[BankAccountType] bat (nolock) on bat.[Name] = b.[AccountType]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and bat.[Id] is null

		-- Premium deduction details
		insert into @errors
			select @fileIdentifier, 
				[MainMemberIdNumber], 
				'Payment Details',
				concat('Missing payment details for ',m.[MemberName],' with ID ', isnull(m.[IdNumber],'[blank]'))
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				left join [Load].[ConsolidatedFuneralBank] b (nolock) on b.[FileIdentifier] = m.[FileIdentifier] and b.[IdNumber] = m.[IdNumber]
				left join [Load].[ConsolidatedFuneralDeduction] d (nolock) on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and b.[Id] is null
			  and d.[Id] is null

		-- Update policy premiums for non-CFP policies
		if (@isCfp = 0) begin
			update m set
				m.[PolicyPremium] = br.[BaseRate],
				m.[PolicyCover] = br.[BenefitAmount]
			from [Load].[ConsolidatedFuneralMember] m (nolock)
				inner join [product].[CurrentBenefitRate] br (nolock) on br.[ProductOptionId] = m.[ProductOptionId] and br.[BenefitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
		end

		if exists (select top 1 * from @errors) begin
			insert into [Load].[ConsolidatedFuneralError] ([FileIdentifier], [MainMemberIdNumber], [MainMemberName], [ErrorCategory], [ErrorMessage], [NotificationStatusId])
				select distinct @fileIdentifier, 
					t.[MainMemberIdNumber],
					m.[MemberName] [MainMemberName],
					t.[ErrorCategory], 
					t.[ErrorMessage], 
					1 [NotificationStatusId] 
				from @errors t
					left join [Load].[ConsolidatedFuneralMember] m (nolock) on
						m.[IdNumber] = t.[MainMemberIdNumber] and
						m.[CoverMemberTypeId] = 1
				where m.[FileIdentifier] = @fileIdentifier
				order by t.[ErrorCategory], 
					t.[ErrorMessage]
		end 
	end

	select count(*) [Errors] 
	from [Load].[ConsolidatedFuneralError] (nolock)
	where [FileIdentifier] = @fileIdentifier 
	  and [NotificationStatusId] = 1

END
