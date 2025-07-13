CREATE   procedure [Load].[ValidatePremiumListingMemberPortal] @fileIdentifier uniqueidentifier, @UserId int
as begin
    

	DECLARE @ErrorsCount INT
	set nocount on

	delete from [policy].[PremiumListingErrorAudit] where [FileIdentifier] = @fileIdentifier

	update [Load].[PremiumListingMessage] set [Message] = 'Validating member data...' where [FileIdentifier] = @fileIdentifier

	declare @errors table (
		[FileIdentifier] varchar(512),
		[ErrorCategory] varchar(64),
		[ErrorMessage] varchar(1024),
		[PolicyNumber] varchar(100),
		[IdNumber] varchar(100),
		[Name] varchar(100),
		[Surname] varchar(100),
		[ExcelRowNumber] varchar(100)
	)

	IF NOT EXISTS(SELECT DISTINCT 
	       POL.*,
		  [ClientName] = P.DisplayName
    FROM security.UserBrokerageMap (NOLOCK) UBM
	INNER JOIN policy.Policy (NOLOCK) POL ON POL.BrokerageId = UBM.BrokerageId
	INNER JOIN client.RolePlayer (NOLOCK) P on P.RolePlayerId = POL.PolicyOwnerId
	INNER JOIN [Load].[PremiumListing] (NOLOCK) PR ON POL.PolicyNumber = PR.PolicyNumber
	WHERE UBM.UserId = @UserId AND PR.[FileIdentifier] = @fileIdentifier)
	BEGIN
	   insert into @errors
		select Top 1 [FileIdentifier], 'Broker Policy Link Error',
			concat('Policy ',[PolicyNumber],' is not linked to broker, cannot be uploaded.'),
                ISNULL([PolicyNumber],''),
				'',
				'',
				'',
				''
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
	END

	--Policy number validation
	insert into @errors 
		select @fileIdentifier, 'Policy Number Error',
			concat('Member ',[FirstName],' with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have a valid or existing policy (',[PolicyNumber],').'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  AND [PolicyNumber] != ''
		  AND [PolicyNumber] NOT IN (SELECT PolicyNumber FROM [policy].[Policy])

		  insert into @errors 
		select @fileIdentifier, 'Missing - Policy Number',
			concat('Member ',[FirstName],' with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have a valid policy number.'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  AND [PolicyNumber] = ''
	

	--Missing first Name
	insert into @errors 
		select @fileIdentifier, 'First Name Error',
			concat('Member with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have first name.'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  and [FirstName] = ''

		  --Missing surname
	insert into @errors 
		select @fileIdentifier, 'Last Name Error',
			concat('Member with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have surname.'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  and [Surname] = ''


	-- Missing date of birth
	insert into @errors 
		select @fileIdentifier, 'Date Error',
			concat('Member ',[FirstName],' with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have a valid date of birth (',[DateOfBirth],').'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  and [DateOfBirth] = ''

		  insert into @errors 
		select @fileIdentifier, 'Invalid Date Of Birth Error',
			concat('Member ',[FirstName],' with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have a valid date of birth (',[DateOfBirth],').'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  and [DateOfBirth] NOT LIKE '%[0-9][^a-zA-Z0-9]%'
		  AND [DateOfBirth] != ''

		    insert into @errors 
		select @fileIdentifier, 'Invalid Join Date Error',
			concat('Member ',[FirstName],' with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have a valid join date (',[JoinDate],').'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  and [JoinDate] NOT LIKE '%[0-9][^a-zA-Z0-9]%'
		  AND [JoinDate] != ''

	-- Missing join dates
	insert into @errors 
		select @fileIdentifier, 'Date Error',
			concat('Member ',[FirstName],' with ID number ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' does not have a valid policy join date (',[JoinDate],').'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  AND [JoinDate] = ''
		  AND [ClientType] != 'Beneficiary'

	-- Missing ID numbers
	insert into @errors 
		select @fileIdentifier, 'Missing ID/Passport Numbers',
			concat('Member ',[FirstName],' born on ',[DateOfBirth],' does not have a valid ID or passport number.'),
                ISNULL([PolicyNumber],''),
				ISNULL([IdNumber],''),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  AND [IdNumber] = ''
		  AND [PassportNumber] = ''

		  --7603218709081 03/21/76 ----- 1965/02/08  6502080319277
		  insert into @errors 
		select @fileIdentifier, 'ID Number Date Of Birth Match Error',
			concat('Member ',[FirstName],' born on ',[DateOfBirth],' ID number does not match date of birth.'),
                ISNULL([PolicyNumber],''),
				ISNULL([IdNumber],''),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  AND [PassportNumber] = ''
		  AND LEN([DateOfBirth]) = 8
		  AND ([IdNumber] != ''
		  AND (SUBSTRING([IdNumber],3,2) != SUBSTRING([DateOfBirth],1,2))
		  OR (SUBSTRING([IdNumber],5,2) != SUBSTRING([DateOfBirth],4,2))
		  OR (SUBSTRING([IdNumber],1,2) != SUBSTRING([DateOfBirth],7,2)))

		  	  insert into @errors 
		select @fileIdentifier, 'ID Number Date Of Birth Match Error',
			concat('Member ',[FirstName],' born on ',[DateOfBirth],' ID number does not match date of birth.'),
                ISNULL([PolicyNumber],''),
				ISNULL([IdNumber],''),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  AND [PassportNumber] = ''
		  AND LEN([DateOfBirth]) = 10
		  AND ([IdNumber] != ''
		  AND (SUBSTRING([IdNumber],3,2) != SUBSTRING([DateOfBirth],6,2))
		  OR (SUBSTRING([IdNumber],5,2) != SUBSTRING([DateOfBirth],9,2))
		  OR (SUBSTRING([IdNumber],1,2) != SUBSTRING([DateOfBirth],3,2)))

	-- Invalid ID numbers
	insert into @errors
		select @fileIdentifier, 'Missing ID Numbers',
			concat('Member ',[FirstName],' born on ',[DateOfBirth],' does not have a valid ID number (',[IdNumber],').'),
                ISNULL([PolicyNumber],''),
				ISNULL([IdNumber],''),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing]
		where [FileIdentifier] = @fileIdentifier
		  and (len(IdNumber) != 13 or isnumeric(IdNumber) = 0)
		  AND [PassportNumber] = ''

	-- Duplicate client references in the file
	insert into @errors
		select @fileIdentifier, 'Duplicate Policies',
			concat('Policy with client reference ',m.[ClientReference],' appears in the import file ',count(*),' times.'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL(m.[FirstName],''),
				ISNULL(m.[Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing] m
		where m.[FileIdentifier] = @fileIdentifier
		  --and m.[CoverMemberTypeId] = 1
		  and m.[ClientReference] != ''
		group by m.[ClientReference],
			m.[FirstName],
			m.[Surname],m.[IdNumber], m.[PolicyNumber],m.[PassportNumber],m.[ExcelRowNumber]
		having count(*) > 1

		---- Invalid email addresses
	insert into @errors
		select @fileIdentifier, 'Invalid Email', 
			concat('Email address ', isnull([Email],''), ' for member ',[FirstName], ' with ID ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' is invalid'),
                 ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing] 
		where [FileIdentifier] = @fileIdentifier
			and isnull([Email], '') != ''
			and not ([Email] LIKE '%_@__%.__%' AND PATINDEX('%[^a-z,0-9,@,.,_,\-]%', [Email]) = 0)

			insert into @errors
		select @fileIdentifier, 'Invalid Cell No.', 
			concat('Cellphone number ', isnull([Mobile],''), ' for member ',[FirstName], ' with ID ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' is invalid'),
                ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing] 
		where [FileIdentifier] = @fileIdentifier
			and isnull([Mobile], '') != ''
			 and (len([Mobile]) != 10 or isnumeric([Mobile]) = 0)

				insert into @errors
		select @fileIdentifier, 'Missing - Email', 
			concat('No preferred contact email address has been set for ',[FirstName],' with ID ', ISNULL(NULLIF(IdNumber, ''), PassportNumber)),
                 ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing] 
		where [FileIdentifier] = @fileIdentifier
			and [PreferredCommunication] = 'Email'
			and isnull([Email], '') = ''

				insert into @errors
		select @fileIdentifier, 'Missing - Cell number', 
			concat('No preferred contact number has been set for ',[FirstName],' with ID ', ISNULL(NULLIF(IdNumber, ''), PassportNumber)),
                 ISNULL([PolicyNumber],''),
				ISNULL(NULLIF(IdNumber, ''), PassportNumber),
				ISNULL([FirstName],''),
				ISNULL([Surname],''),
				ISNULL([ExcelRowNumber],'')
		from [Load].[PremiumListing] 
		where [FileIdentifier] = @fileIdentifier
			and [PreferredCommunication] = 'SMS'
			and isnull([Mobile], '') = ''

	

	-- Missing residential address
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details', 
	--		concat('Residential address for main member ',[FirstName],' with ID ', isnull([IdNumber],'[blank]'),' is missing'),
 --               NULL,
	--			ISNULL(m.[IdNumber],''),
	--			ISNULL(m.[FirstName],''),
	--			ISNULL(m.[Surname],'')
	--	from [Load].[PremiumListing] m
	--	where m.[FileIdentifier] = @fileIdentifier
	--	  --and m.[CoverMemberTypeId] = 1
	--	  and isnull(m.[Address1], '') = ''

	---- Missing postal address
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details', 
	--		concat('Postal address for main member ',[FirstName],' with ID ', isnull([IdNumber],'[blank]'),' is missing'),
 --               NULL,
	--			ISNULL(m.[IdNumber],''),
	--			ISNULL(m.[FirstName],''),
	--			ISNULL(m.[Surname],'')
	--	from [Load].[PremiumListing] m
	--	where m.[FileIdentifier] = @fileIdentifier
	--	  --and m.[CoverMemberTypeId] = 1
	--	  and isnull(m.[PostalAddress1], '') = ''

	---- Invalid email addresses
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details', 
	--		concat('Email address ', isnull([Email],''), ' for member ',[FirstName], ' with ID ',[IdNumber],' is invalid'),
 --               NULL,
	--			ISNULL([IdNumber],''),
	--			ISNULL([FirstName],''),
	--			ISNULL([Surname],'')
	--	from [Load].[PremiumListing] 
	--	where [FileIdentifier] = @fileIdentifier
	--		and isnull([Email], '') != ''
	--		and not ([Email] LIKE '%_@__%.__%' AND PATINDEX('%[^a-z,0-9,@,.,_,\-]%', [Email]) = 0)
	---- Missing preferred communication methods
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details', 
	--		concat('No preferred contact email address has been set for ',[FirstName],' with ID ', isnull([IdNumber],'[blank]')),
 --               NULL,
	--			ISNULL([IdNumber],''),
	--			ISNULL([FirstName],''),
	--			ISNULL([Surname],'')
	--	from [Load].[PremiumListing] 
	--	where [FileIdentifier] = @fileIdentifier
	--		--and [CoverMemberTypeId] in (1, 99)
	--		and [PreferredCommunication] = 1
	--		and isnull([Email], '') = ''
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details', 
	--		concat('No preferred contact telephone number has been set for ',[FirstName],' with ID ', isnull([IdNumber],'[blank]')),
 --               NULL,
	--			ISNULL([IdNumber],''),
	--			ISNULL([FirstName],''),
	--			ISNULL([Surname],'')
	--	from [Load].[PremiumListing] 
	--	where [FileIdentifier] = @fileIdentifier
	--		--and [CoverMemberTypeId] in (1, 99)
	--		and [PreferredCommunication] = 2
	--		and isnull([CelNo], '') = ''
	--		and isnull([TelNo], '') = ''
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details', 
	--		concat('No preferred contact mobile number has been set for ',[FirstName],' with ID ', isnull([IdNumber],'[blank]')),
 --               NULL,
	--			ISNULL([IdNumber],''),
	--			ISNULL([FirstName],''),
	--			ISNULL([Surname],'')
	--	from [Load].[PremiumListing] 
	--	where [FileIdentifier] = @fileIdentifier
	--		--and [CoverMemberTypeId] in (1, 99)
	--		and [PreferredCommunication] = 3
	--		and isnull([CelNo], '') = ''
	--insert into @errors
	--	select @fileIdentifier, 'Contact Details',
	--		concat('No preferred contact postal address has been set for ',[FirstName],' with ID ', isnull([IdNumber],'[blank]')),
 --               NULL,
	--			ISNULL([IdNumber],''),
	--			ISNULL([FirstName],''),
	--			ISNULL([Surname],'')
	--	from [Load].[PremiumListing] 
	--	where [FileIdentifier] = @fileIdentifier
	--		--and [CoverMemberTypeId] in (1, 99)
	--		and [PreferredCommunication] = 4
	--		and isnull([PostalAddress1], '') = ''

	-- Missing benefits
	--insert into @errors
	--	select @fileIdentifier, 'Missing Benefit',
	--		concat('Benefit for member ',[FirstName],' with ID ',ISNULL(NULLIF(IdNumber, ''), PassportNumber),' could not be found.'),
 --               ISNULL([PolicyNumber],''),
	--			ISNULL(NULLIF(IdNumber, ''), PassportNumber),
	--			ISNULL([FirstName],''),
	--			ISNULL([Surname],'')
	--	from [Load].[PremiumListing] 
	--	where [FileIdentifier] = @fileIdentifier
	--		and [BenefitName] = ''
	
	--Validates authenticity of the Id number
	EXEC [Load].[ValidatePremiumListingMemberIdNumber] @fileIdentifier
	

	IF EXISTS (SELECT TOP 1 * FROM @errors) BEGIN
	   INSERT INTO [policy].[PremiumListingErrorAudit] ([PolicyNumber],[IdNumber],[Name],[Surname],[FileIdentifier], [ErrorCategory], [ErrorMessage],[ExcelRowNumber])
		SELECT DISTINCT [PolicyNumber],[IdNumber],[Name],[Surname],[FileIdentifier], [ErrorCategory], [ErrorMessage],[ExcelRowNumber] FROM @errors
		ORDER BY [ErrorCategory], [ErrorMessage]
	END
	
	set nocount off

end