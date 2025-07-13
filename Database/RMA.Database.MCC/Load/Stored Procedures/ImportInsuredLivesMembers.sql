CREATE   PROCEDURE [Load].[ImportInsuredLivesMembers] (@fileIdentifier uniqueidentifier,  @userId varchar(64))
as begin

	--declare @fileIdentifier uniqueidentifier = '008AE698-2CE4-45D4-9BFA-5C6CA037B7C7'
	--declare @userId varchar(64) = 'system@randmutual.co.za'

	set nocount on

	begin try
		begin tran InsuredLivesTransaction

		declare @now datetime = getdate()
		
		declare @count int
		select @count = count(*) from [Load].[InsuredLivesError] where [FileIdentifier] = @fileIdentifier
		if (@count > 0) begin
			declare @error varchar(128) = concat('The import task cannot be completed, because there are still ',@count,' errors.')
			raiserror(@error, 11, 1)
		end

		-- ROLEPLAYERS
		update [Load].[InsuredLivesMessage] set [Message] = 'Inserting new roleplayers...' where [FileIdentifier] = @fileIdentifier
		if exists (select top 1 [Id] from [Load].[InsuredLivesMember] where [FileIdentifier] = @fileIdentifier and [RolePlayerExists] = 0) begin

			-- Update roleplayer id's of new roleplayers
			declare @rolePlayerId int
			select @rolePlayerId = max([RolePlayerId]) from [client].[RolePlayer]

			update m set m.[RolePlayerId] = t.[RolePlayerId]
			from [Load].[InsuredLivesMember] m inner join (
				select t.[IdTypeId],
					   t.[IdNumber],
					   @rolePlayerId + row_number() over (order by [Id]) [RolePlayerId]
				from (
					select distinct min([Id]) [Id], [IdTypeId], [IdNumber] 
					from [Load].[InsuredLivesMember] with (nolock) 
					where [FileIdentifier] = @fileIdentifier and [RolePlayerExists] = 0
					group by [IdTypeId], [IdNumber] 
				) t
			) t on t.[IdTypeId] = m.[IdTypeId] and t.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier

			select @rolePlayerId = max([RolePlayerId]) + 1 from [Load].[InsuredLivesMember] where [FileIdentifier] = @fileIdentifier
			update [common].[DocumentNumbers] set [NextNumber] = @rolePlayerId where [Name] = 'RolePlayerId'

			-- Insert new RolePlayers
			insert into [client].[RolePlayer] ([RolePlayerId], [DisplayName], [RolePlayerIdentificationTypeId], [IsDeleted], [PreferredCommunicationTypeId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select distinct m.[RolePlayerId], m.[MemberName], 1, 0, 1, @userId, @now, @userId, @now
				from [Load].[InsuredLivesMember] m with (nolock)
					left join [client].[RolePlayer] r with (nolock) on r.[RolePlayerId] = m.[RolePlayerId]
				where m.[FileIdentifier] = @fileIdentifier
				  and r.[RolePlayerId] is null
				group by m.[RolePlayerId],
					m.[MemberName]

			-- Insert new persons
			insert into [client].[Person] ([RolePlayerId], [FirstName], [Surname], [IdTypeId], [IdNumber], [DateOfBirth], [IsAlive], [IsVopdVerified], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select distinct m.[RolePlayerId], m.[FirstName], m.[Surname], m.[IdTypeId], m.[IdNumber], m.[DateOfBirth], 1, 0, 0, @userId, @now, @userId, @now
				from [Load].[InsuredLivesMember] m with (nolock)
					left join [client].[Person] per with (nolock) on per.RolePlayerId = m.RolePlayerId
				where m.[FileIdentifier] = @fileIdentifier
					and per.[RolePlayerId] is null
					and m.[RolePlayerExists] = 0
				group by m.[RolePlayerId],
					m.[FirstName],
					m.[Surname],
					m.[IdTypeId],
					m.[IdNumber],
					m.[DateOfBirth]
			-- Update contact details of members
			update rp set
				rp.[TellNumber] = m.[TelNo],
				rp.[CellNumber] = m.[CelNo],
				rp.[EmailAddress] = m.[Email],
				rp.[PreferredCommunicationTypeId] = m.[PreferredCommunication]
			from [Load].[InsuredLivesMember] m with (nolock)
				inner join [client].[RolePlayer] rp on rp.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				
		end
		-- Update existing RolePlayers
		update r set
			r.[DisplayName] = rp.[MemberName],
			r.[RolePlayerIdentificationTypeId] = 1,
			r.[IsDeleted] = 0
		from [Load].[InsuredLivesMember] rp
			inner join [client].[RolePlayer] r on r.[RolePlayerId] = rp.[RolePlayerId]
		where rp.[FileIdentifier] = @fileIdentifier
			and rp.[RolePlayerExists] = 1
		-- Update existing persons
		update p set
			p.[FirstName] = r.[FirstName],
			p.[Surname] = r.[Surname],
			p.[DateOfBirth] = r.[DateOfBirth],
			p.[IsAlive] = 1
		from [Load].[InsuredLivesMember] r
			inner join [client].[Person] p on p.[RolePlayerId] = r.[RolePlayerId]
		where r.[FileIdentifier] = @fileIdentifier
			and r.[RolePlayerExists] = 1

		-- Update main member roleplayer id's
		update m set m.[MainMemberRolePlayerId] = t.[RolePlayerId]
		from [Load].[InsuredLivesMember] m inner join (
			select distinct [RolePlayerId],
				   [IdNumber] [MainMemberIdNumber]
			from [Load].[InsuredLivesMember] with (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
		) t on t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] != 1
		
		
		-- Insert policy insured lives (incl. beneficiaries)
		update [Load].[InsuredLivesMessage] set [Message] = 'Inserting new insured lives...' where [FileIdentifier] = @fileIdentifier
		insert into [policy].[PolicyInsuredLives] ([PolicyId], [RolePlayerId], [RolePlayerTypeId], [InsuredLifeStatusId], [StatedBenefitId], [StartDate])
			select distinct m.[PolicyId],
				m.[RolePlayerId],
				m.[RolePlayerTypeId],
				1 [InsuredLifeStatusId],
				m.[BenefitId],
				m.[JoinDate]
			from [Load].[InsuredLivesMember] m with (nolock)
				left join [policy].[PolicyInsuredLives] pil with (nolock) on
					pil.[PolicyId] = m.[PolicyId] and
					pil.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] < 20
				and pil.[PolicyId] is null

		
		-- Insert roleplayer relations
		insert into [client].[RolePlayerRelation] ([FromRolePlayerId], [ToRolePlayerId], [RolePlayerTypeId], [PolicyId])
			select distinct m.[RolePlayerId] [FromRolePlayerId],
				   m.[MainMemberRolePlayerId] [ToRolePlayerId],
				   3 [RolePlayerTypeId],
				   m.[PolicyId]
			from [Load].[InsuredLivesMember] m with (nolock)
				left join [client].[RolePlayerRelation] rr with (nolock) on
					rr.[FromRolePlayerId] = m.[RolePlayerId] and
					rr.[ToRolePlayerId] = m.[MainMemberRolePlayerId] and
					rr.[RolePlayerTypeId] = m.[RolePlayerTypeId] and
					rr.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] != 1
			  and rr.[Id] is null
		
		
		update [Load].[InsuredLivesMessage] set [Message] = 'Updating member addresses...' where [FileIdentifier] = @fileIdentifier
		-- Update roleplayer physical addresses
		update a set
			a.[AddressLine1] = left(m.[Address1], 50),
			a.[AddressLine2] = left(m.[Address2], 50),
			a.[PostalCode] = m.[PostalCode],
			a.[City] = m.[City],
			a.[Province] = m.[Province],
			a.[ModifiedBy] = @userId,
			a.[ModifiedDate] = @now
		from [Load].[InsuredLivesMember] m
			inner join [client].[RolePlayerAddress] a on
				a.[RolePlayerId] = m.[RolePlayerId] and 
				a.[AddressTypeId] = 1
		where m.[FileIdentifier] = @fileIdentifier
			and isnull(m.[Address1], '') != ''

		-- Insert new roleplayer physical addresses
		insert into [client].[RolePlayerAddress] ([RolePlayerId],[AddressTypeId],[AddressLine1],[AddressLine2],[PostalCode],[City],[Province],[CountryId],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[EffectiveDate])
			select m.[RolePlayerId],
				1 [AddressTypeId],
				left(m.[Address1], 50),
				left(m.[Address2], 50),
				m.[PostalCode],
				m.[City],
				m.[Province],
				1 [CountryId],
				0 [IsDeleted],
				@userId [CreatedBy],
				@now [CreatedDate],
				@userId [ModifiedBy],
				@now [ModifiedDate],
				convert(date, @now) [EffectiveDate]
			from [Load].[InsuredLivesMember] m with (nolock)
				left join [client].[RolePlayerAddress] rpa with (nolock) on rpa.[RolePlayerId] = m.[RolePlayerId] and rpa.[AddressTypeId] = 1
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 1
				and isnull(m.[Address1], '') != ''
				and rpa.[RolePlayerAddressId] is null
				
		-- Update existing roleplayer postal addresses
		update a set
			a.[AddressLine1] = left(m.[PostalAddress1], 50),
			a.[AddressLine2] = left(m.[PostalAddress2], 50),
			a.[PostalCode] = m.[PostalPostCode],
			a.[City] = m.[PostalCity],
			a.[Province] = m.[PostalProvince],
			a.[ModifiedBy] = @userId,
			a.[ModifiedDate] = @now
		from [Load].[InsuredLivesMember] m
			inner join [client].[RolePlayerAddress] a on 
				a.[RolePlayerId] = m.[RolePlayerId] and 
				a.[AddressTypeId] = 2
		where m.[FileIdentifier] = @fileIdentifier
			and isnull(m.[PostalAddress1], '') != ''

		-- Insert new roleplayer postal addresses
		insert into [client].[RolePlayerAddress] ([RolePlayerId],[AddressTypeId],[AddressLine1],[AddressLine2],[PostalCode],[City],[Province],[CountryId],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[EffectiveDate])
			select r.[RolePlayerId],
				2 [AddressTypeId],
				left(r.[PostalAddress1], 50),
				left(r.[PostalAddress2], 50),
				r.[PostalCode],
				r.[PostalCity],
				r.[PostalProvince],
				1 [CountryId],
				0 [IsDeleted],
				@userId [CreatedBy],
				@now [CreatedDate],
				@userId [ModifiedBy],
				@now [ModifiedDate],
				convert(date, @now) [EffectiveDate]
			from [Load].[InsuredLivesMember] r with (nolock)
				left join [client].[RolePlayerAddress] rpa with (nolock) on rpa.[RolePlayerId] = r.[RolePlayerId] and rpa.[AddressTypeId] = 2
			where r.[FileIdentifier] = @fileIdentifier
				and r.[CoverMemberTypeId] = 1
				and isnull(r.[PostalAddress1], '') != ''
				and rpa.[RolePlayerAddressId] is null

		
		declare @parentPolicyId int
		select @parentPolicyId = [PolicyId] from [Load].[InsuredLivesCompany] with (nolock) where [FileIdentifier] = @fileIdentifier

		exec [Load].[InsuredLivesSummary] @fileIdentifier
		
		commit tran InsuredLivesTransaction

	end try
	begin catch
		rollback tran InsuredLivesTransaction
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

	set nocount off

end