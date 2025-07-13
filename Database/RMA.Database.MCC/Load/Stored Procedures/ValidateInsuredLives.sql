CREATE   PROCEDURE [Load].[ValidateInsuredLives] (@fileIdentifier uniqueidentifier)
as begin
	
	-- declare @fileIdentifier uniqueidentifier = '64715828-53A7-4C52-92E3-2410727D83B4'

	set nocount on

	delete from [Load].[InsuredLivesError] where [FileIdentifier] = @fileIdentifier

	update [Load].[InsuredLivesMessage] set [Message] = 'Validating member data...' where [FileIdentifier] = @fileIdentifier

	declare @errors table (
		[FileIdentifier] uniqueidentifier,
		[ErrorCategory] varchar(64),
		[ErrorMessage] varchar(1024)
	)

	-- Missing date of birth
	insert into @errors 
		select @fileIdentifier, 'Date Error',
			concat('Member ',[MemberName],' with ID number ',[IdNumber],' does not have a valid date of birth')
		from [Load].[InsuredLivesMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and [DateOfBirth] is null

	-- Missing ID numbers
	insert into @errors 
		select @fileIdentifier, 'Missing ID Numbers',
			concat('Member ',[MemberName],' does not have a valid ID or passport number.')
		from [Load].[InsuredLivesMember] with (nolock)
		where [FileIdentifier] = @fileIdentifier
		  and isnull([IdNumber], '') = ''

	---- Invalid ID numbers
	--insert into @errors
	--	select @fileIdentifier, 'Missing ID Numbers',
	--		concat('Member ',[MemberName],' born on ',[TestDateOfBirth],' does not have a valid ID number (',[IdNumber],').')
	--	from [Load].[InsuredLivesMember] with (nolock)
	--	where [FileIdentifier] = @fileIdentifier
	--	  and [IdTypeId] = 1
	--	  and (len(IdNumber) != 13 or isnumeric(IdNumber) = 0)
		  

	-- Missing residential address
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('Residential address for member ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'),' is missing')
		from [Load].[InsuredLivesMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and isnull(m.[Address1], '') = ''

	-- Missing postal address
	insert into @errors
		select @fileIdentifier, 'Contact Details', 
			concat('Postal address for member ',[MemberName],' with ID ', isnull([IdNumber],'[blank]'),' is missing')
		from [Load].[InsuredLivesMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and isnull(m.[PostalAddress1], '') = ''

	if exists (select top 1 * from @errors) begin
		insert into [Load].[InsuredLivesError] ([FileIdentifier], [ErrorCategory], [ErrorMessage])
			select distinct @fileIdentifier, [ErrorCategory], [ErrorMessage] from @errors
			order by [ErrorCategory], [ErrorMessage]
	end

	exec [Load].[InsuredLivesSummary] @fileIdentifier

	set nocount off

end