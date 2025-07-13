
CREATE   PROCEDURE [Load].[ImportPremiumListingMembers] (@fileIdentifier uniqueidentifier,  @userId varchar(64))
as begin

	--declare @fileIdentifier uniqueidentifier = '082ADEB9-BA9E-4B88-B438-36FBE3D5B683'
	--declare @userId varchar(128) = 'tpursooth@randmutual.co.za'

	set nocount on

	begin try
		begin tran PremiumListingTransaction

		declare @now datetime = getdate()

		declare @count int
		select @count = count(*) from [Load].[PremiumListingError] where [FileIdentifier] = @fileIdentifier
		if (@count > 0) begin
			declare @error varchar(128) = concat('The import task cannot be completed, because there are still ',@count,' errors.')
			raiserror(@error, 11, 1)
		end

		-- ROLEPLAYERS
		update [Load].[PremiumListingMessage] set [Message] = 'Inserting new roleplayers...' where [FileIdentifier] = @fileIdentifier
		if exists (select top 1 [Id] from [Load].[PremiumListingMember] where [FileIdentifier] = @fileIdentifier and [RolePlayerExists] = 0) begin

			-- Update roleplayer id's of new roleplayers
			declare @rolePlayerId int
			select @rolePlayerId = max([RolePlayerId]) from [client].[RolePlayer]

			update m set m.[RolePlayerId] = t.[RolePlayerId]
			from [Load].[PremiumListingMember] m inner join (
				select t.[IdTypeId],
					   t.[IdNumber],
					   @rolePlayerId + row_number() over (order by [Id]) [RolePlayerId]
				from (
					select distinct min([Id]) [Id], [IdTypeId], [IdNumber]
					from [Load].[PremiumListingMember] with (nolock)
					where [FileIdentifier] = @fileIdentifier and [RolePlayerExists] = 0
					group by [IdTypeId], [IdNumber]
				) t
			) t on t.[IdTypeId] = m.[IdTypeId] and t.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier

			select @rolePlayerId = max([RolePlayerId]) + 1 from [Load].[PremiumListingMember] where [FileIdentifier] = @fileIdentifier
			update [common].[DocumentNumbers] set [NextNumber] = @rolePlayerId where [Name] = 'RolePlayerId'

			-- Insert new RolePlayers
			insert into [client].[RolePlayer] ([RolePlayerId], [DisplayName], [RolePlayerIdentificationTypeId], [IsDeleted], [PreferredCommunicationTypeId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select distinct m.[RolePlayerId], m.[MemberName], 1, 0, 1, @userId, @now, @userId, @now
				from [Load].[PremiumListingMember] m with (nolock)
					left join [client].[RolePlayer] r with (nolock) on r.[RolePlayerId] = m.[RolePlayerId]
				where m.[FileIdentifier] = @fileIdentifier
				  and r.[RolePlayerId] is null
				group by m.[RolePlayerId],
					m.[MemberName]

			-- Insert new persons
			insert into [client].[Person] ([RolePlayerId], [FirstName], [Surname], [IdTypeId], [IdNumber], [DateOfBirth], [IsAlive], [IsVopdVerified], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select distinct m.[RolePlayerId], m.[FirstName], m.[Surname], m.[IdTypeId], m.[IdNumber], m.[DateOfBirth], 1, 0, 0, @userId, @now, @userId, @now
				from [Load].[PremiumListingMember] m with (nolock)
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
			from [Load].[PremiumListingMember] m with (nolock)
				inner join [client].[RolePlayer] rp on rp.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier

		end
		-- Update existing RolePlayers
		update r set
			r.[DisplayName] = rp.[MemberName],
			r.[RolePlayerIdentificationTypeId] = 1,
			r.[TellNumber] = rp.[TelNo],
			r.[CellNumber] = rp.[CelNo],
			r.[EmailAddress] = rp.[Email],
			r.[PreferredCommunicationTypeId] = rp.[PreferredCommunication],
			r.[IsDeleted] = 0
		from [Load].[PremiumListingMember] rp
			inner join [client].[RolePlayer] r on r.[RolePlayerId] = rp.[RolePlayerId]
		where rp.[FileIdentifier] = @fileIdentifier
			and rp.[RolePlayerExists] = 1
		-- Update existing persons
		update p set
			p.[FirstName] = r.[FirstName],
			p.[Surname] = r.[Surname],
			p.[DateOfBirth] = r.[DateOfBirth],
			p.[IsAlive] = 1
		from [Load].[PremiumListingMember] r
			inner join [client].[Person] p on p.[RolePlayerId] = r.[RolePlayerId]
		where r.[FileIdentifier] = @fileIdentifier
			and r.[RolePlayerExists] = 1

		-- Update main member roleplayer id's
		update m set m.[MainMemberRolePlayerId] = t.[RolePlayerId]
		from [Load].[PremiumListingMember] m inner join (
			select distinct [RolePlayerId],
				   [IdNumber] [MainMemberIdNumber]
			from [Load].[PremiumListingMember] with (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
		) t on t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] != 1

		-- POLICIES
		update [Load].[PremiumListingMessage] set [Message] = 'Creating new policies...' where [FileIdentifier] = @fileIdentifier
		if exists (select top 1 [Id] from [Load].[PremiumListingMember] where [FileIdentifier] = @fileIdentifier and [CoverMemberTypeId] = 1 and [PolicyExists] = 0) begin

			-- Update policy id's of new policies
			declare @policyId int
			select @policyId = max([PolicyId]) from [policy].[Policy]
			update m set m.[PolicyId] = t.[PolicyId]
			from [Load].[PremiumListingMember] m inner join (
				select [Id], @policyId + row_number() over (order by [Id]) [PolicyId]
				from [Load].[PremiumListingMember] with (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] = 1
				  and [PolicyExists] = 0
			) t on t.[Id] = m.[Id]
			where m.[FileIdentifier] = @fileIdentifier
			select @policyId = max([PolicyId]) + 1 from [Load].[PremiumListingMember] where [FileIdentifier] = @fileIdentifier
			update [common].[DocumentNumbers] set [NextNumber] = @policyId where [Name] = 'PolicyNumber'

			-- Update policy numbers of dependent members
			update m set m.[PolicyId] = t.[PolicyId]
			from [Load].[PremiumListingMember] m inner join (
				select [ClientReference],
					[IdNumber] [MainMemberIdNumber],
					[PolicyId]
				from [Load].[PremiumListingMember] with (nolock)
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] = 1
			) t on t.[ClientReference] = m.[ClientReference] and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
			where m.[FileIdentifier] = @fileIdentifier

			-- Insert new policies
			declare @date varchar(8)
			set @date = concat(year(getdate()), right(concat('00', month(getdate())), 2))
			insert into [policy].[Policy] ([PolicyId],[TenantId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PolicyPayeeId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationDate], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [PolicyStatusId], [AnnualPremium], [InstallmentPremium], [CommissionPercentage], [BinderFeePercentage], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [AdminPercentage], [ClientReference], [ParentPolicyId],[CanLapse], [IsEuropAssist], [EuropAssistEffectiveDate])
				select distinct m.[PolicyId]
					,1 [TenantId]
					,p.[BrokerageId]
					,p.[ProductOptionId]
					,p.[RepresentativeId]
					,p.[JuristicRepresentativeId]
					,m.[RolePlayerId] [PolicyOwnerId]
					,p.[PolicyPayeeId]
					,p.[PaymentFrequencyId]
					,p.[PaymentMethodId]
					,concat('01-', @date, '-', right(concat('000000', m.[PolicyId]), 6)) [PolicyNumber]
					,m.[JoinDate] [PolicyInceptionDate]
					,null [ExpiryDate]
					,null [CancellationDate]
					,p.[FirstInstallmentDate]
					,p.[LastInstallmentDate]
					,p.[RegularInstallmentDayOfMonth]
					,p.[DecemberInstallmentDayOfMonth]
					,1 [PolicyStatusId]
					,m.[PolicyPremium] * 12.0 [AnnualPremium]
					,m.[PolicyPremium] * m.[Multiplier] [InstallmentPremium]
					,p.[CommissionPercentage]
					,p.[BinderFeePercentage]
					,0 [IsDeleted]
					,@userId [CreatedBy]
					,@now [CreatedDate]
					,@userId [ModifiedBy]
					,@now [ModifiedDate]
					,p.[AdminPercentage]
					,iif(left(m.[ClientReference], 3) = 'XXX', null, m.[ClientReference]) [ClientReference]
					,c.[PolicyId] [ParentPolicyId]
					,p.[CanLapse]
					,p.[IsEuropAssist]
					,p.[EuropAssistEffectiveDate]
				from [Load].[PremiumListingCompany] c with (nolock)
				    inner join [policy].[Policy] p with (nolock) on p.[PolicyId] = c.[PolicyId]
					inner join [Load].[PremiumListingBenefit] b with (nolock) on b.[FileIdentifier] = c.[FileIdentifier]
					inner join [Load].[PremiumListingMember] m with (nolock) on
						m.[FileIdentifier] = c.[FileIdentifier] and
						m.[ParentPolicyId] = c.[PolicyId] and
						m.[BenefitId] = b.[BenefitId] and
						m.[CoverMemberTypeId] = b.[CoverMemberTypeId]
					left join (
						select [PolicyId], sum([PolicyPremium]) [Premium]
						from [Load].[PremiumListingMember] with (nolock)
						where [FileIdentifier] = @fileIdentifier
						group by [PolicyId]
					) t on t.[PolicyId] = m.[PolicyId]
				where c.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] = 1
				  and m.[PolicyExists] = 0
		end

		-- Insert policy insured lives (incl. beneficiaries)
		update [Load].[PremiumListingMessage] set [Message] = 'Inserting new insured lives...' where [FileIdentifier] = @fileIdentifier
		insert into [policy].[PolicyInsuredLives] ([PolicyId], [RolePlayerId], [RolePlayerTypeId], [InsuredLifeStatusId], [StatedBenefitId], [StartDate], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select distinct m.[PolicyId],
				m.[RolePlayerId],
				m.[RolePlayerTypeId],
				1 [InsuredLifeStatusId],
				m.[BenefitId],
				m.[JoinDate],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
			from [Load].[PremiumListingMember] m with (nolock)
				left join [policy].[PolicyInsuredLives] pil with (nolock) on
					pil.[PolicyId] = m.[PolicyId] and
					pil.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] < 20
				and pil.[PolicyId] is null

		-- Update premiums of existing policies
		update p set
			p.[AnnualPremium] = t.[Premium] * 12.0,
			p.[InstallmentPremium] = t.[Premium] * t.[Multiplier]
		from [policy].[Policy] p inner join (
			select m.[PolicyId], m.[Multiplier], sum(m.[PolicyPremium]) [Premium]
			from [Load].[PremiumListingMember] m with (nolock)
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[PolicyExists] = 1
			group by m.[PolicyId], m.[Multiplier]
		) t on t.[PolicyId] = p.[PolicyId]

		-- Reactivate policies of members that have been added back into the file
		update pil set
			pil.[InsuredLifeStatusId] = 1,
			pil.[StatedBenefitId] = m.[BenefitId],
			pil.[StartDate] = m.[JoinDate],
			pil.[EndDate] = null,
			pil.[IsDeleted] = 0,
			pil.[ModifiedBy] = @userId,
			pil.[ModifiedDate] = getdate()
		from [Load].[PremiumListingMember] m
			inner join [policy].[PolicyInsuredLives] pil on
				pil.[PolicyId] = m.[PolicyId] and
				pil.[RolePlayerId] = m.[RolePlayerId]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[PolicyExists] = 1
			and m.[CoverMemberTypeId] < 20

		-- Insert roleplayer relations
		insert into [client].[RolePlayerRelation] ([FromRolePlayerId], [ToRolePlayerId], [RolePlayerTypeId], [PolicyId])
			select distinct m.[RolePlayerId] [FromRolePlayerId],
				   m.[MainMemberRolePlayerId] [ToRolePlayerId],
				   m.[RolePlayerTypeId],
				   m.[PolicyId]
			from [Load].[PremiumListingMember] m with (nolock)
				left join [client].[RolePlayerRelation] rr with (nolock) on
					rr.[FromRolePlayerId] = m.[RolePlayerId] and
					rr.[ToRolePlayerId] = m.[MainMemberRolePlayerId] and
					rr.[RolePlayerTypeId] = m.[RolePlayerTypeId] and
					rr.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] != 1
			  and rr.[Id] is null

		-- Add main member beneficiaries
		update [Load].[PremiumListingMessage] set [Message] = 'Inserting new beneficiaries...' where [FileIdentifier] = @fileIdentifier
		insert into [client].[RolePlayerRelation] ([FromRolePlayerId], [ToRolePlayerId], [RolePlayerTypeId], [PolicyId])
			select m.[RolePlayerId] [FromRolePlayerId],
				   m.[RolePlayerId] [ToRolePlayerId],
				   41 [RolePlayerTypeId],
				   m.[PolicyId]
			from [Load].[PremiumListingMember] m with (nolock)
				left join [client].[RolePlayerRelation] rr on
					rr.[FromRolePlayerId] = m.[RolePlayerId] and
					rr.[ToRolePlayerId] = m.[RolePlayerId] and
					rr.[RolePlayerTypeId] = 41 and
					rr.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and rr.[Id] is null

		-- Insert policy benefits
		insert into [policy].[PolicyBenefit]
			select m.[PolicyId],
				m.[BenefitId]
			from [Load].[PremiumListingMember] m with (nolock)
				left join [policy].[PolicyBenefit] b with (nolock) on
					b.[PolicyId] = m.[PolicyId] and
					b.[BenifitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] < 20
				and b.[BenifitId] is null
			group by m.[PolicyId], m.[BenefitId]

		-- Insert policy brokers
		insert into [policy].[PolicyBroker] ([PolicyId], [RepId], [BrokerageId], [JuristicRepId], [EffectiveDate], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select  m.[PolicyId],
				ppb.[RepId],
				ppb.[BrokerageId],
				ppb.[JuristicRepId],
				ppb.[EffectiveDate],
				0 [IsDeleted],
				@userId,
				@now,
				@userId,
				@now
			from [Load].[PremiumListingMember] m with (nolock)
				inner join [policy].[PolicyBroker] ppb with (nolock) on ppb.[PolicyId] = m.[ParentPolicyId]
				left join [policy].[PolicyBroker] cpb with (nolock) on cpb.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 1
				and cpb.[PolicyBrokerId] is null

		update [Load].[PremiumListingMessage] set [Message] = 'Updating member addresses...' where [FileIdentifier] = @fileIdentifier
		-- Update roleplayer physical addresses
		update a set
			a.[AddressLine1] = left(m.[Address1], 50),
			a.[AddressLine2] = left(m.[Address2], 50),
			a.[PostalCode] = m.[PostalCode],
			a.[City] = m.[City],
			a.[Province] = m.[Province],
			a.[ModifiedBy] = @userId,
			a.[ModifiedDate] = @now
		from [Load].[PremiumListingMember] m
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
			from [Load].[PremiumListingMember] m with (nolock)
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
		from [Load].[PremiumListingMember] m
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
			from [Load].[PremiumListingMember] r with (nolock)
				left join [client].[RolePlayerAddress] rpa with (nolock) on rpa.[RolePlayerId] = r.[RolePlayerId] and rpa.[AddressTypeId] = 2
			where r.[FileIdentifier] = @fileIdentifier
				and r.[CoverMemberTypeId] = 1
				and isnull(r.[PostalAddress1], '') != ''
				and rpa.[RolePlayerAddressId] is null

		-- Update previous insurer end date
		update m set
			m.[PreviousInsurerEndDate] = cast(dbo.ConvertToDate(m.[JoinDate]) as varchar(16))
		from [Load].[PremiumListingMember] m with (nolock)
		where m.[FileIdentifier] = @fileIdentifier
		  and isnull(m.[PreviousInsurerPolicyNumber], '') <> ''
		  and isnull(m.[PreviousInsurerStartDate], '') <> ''
		  and isnull(m.[PreviousInsurerEndDate], '') = ''

		-- Insert previous insurer information
		update [Load].[PremiumListingMessage] set [Message] = 'Inserting previous insurer details...' where [FileIdentifier] = @fileIdentifier
		insert into [client].[PreviousInsurerRolePlayer] ([PreviousInsurerID], [RolePlayerID], [PolicyNumber], [PolicyStartDate], [PolicyEndDate], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select p.[Id],
					m.[RolePlayerId],
					m.[PreviousInsurerPolicyNumber] [PolicyNumber],
					[dbo].[ConvertToDate](m.[PreviousInsurerStartDate]) [PreviousInsurerStartDate],
					[dbo].[ConvertToDate](m.[PreviousInsurerEndDate]) [PreviousInsurerEndDate],
					@userId [CreatedBy],
					@now [CreatedDate],
					@userId [ModifiedBy],
					@now [ModifiedDate]
			from [Load].[PremiumListingMember] m with (nolock)
				inner join [common].[PreviousInsurer] p with (nolock) on p.[Name] = m.[PreviousInsurer]
				left join [client].[PreviousInsurerRolePlayer] pr with (nolock) on
					pr.[PreviousInsurerID] = p.[Id] and
					pr.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				and isnull(m.[PreviousInsurerStartDate], '') <> ''
				and isnull(m.[PreviousInsurerEndDate], '') <> ''
				and pr.[Id] is null
		 
		-- Insert additional benefits
		insert into [policy].[PolicyInsuredLifeAdditionalBenefits] ([PolicyId], [RolePlayerId], [BenefitId], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select m.[PolicyId],
				m.[RolePlayerId],
				br.[BenefitId],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
			from [Load].[PremiumListingMember] m
				inner join [policy].[Policy] p on p.PolicyId = m.PolicyId
				inner join [product].[CurrentBenefitRate] br on br.[ProductOptionId] = p.[ProductOptionId] and br.[BenefitTypeId] = 2
				left join [policy].[PolicyInsuredLifeAdditionalBenefits] ad on 
					ad.[PolicyId] = m.[PolicyId] and 
					ad.[RolePlayerId] = m.[RolePlayerId] and
					ad.[BenefitId] = br.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] < 20
			  and ad.[RolePlayerId] is null

		-- Insert Premium Listing Group Policy Premium Movement
		IF (SELECT COUNT(*) FROM common.FeatureFlagSettings WHERE [Key] = 'PremiumListingPolicyPremiumMovementFeature' AND [Value] = 'true') > 0 BEGIN
			INSERT [Load].[PremiumListingPolicyPremiumMovement] (FileIdentifier,PolicyId,CurrentInstallmentPremium,CurrentAnnualPremium,NewInstallmentPremium, NewAnnualPremium, CreatedBy, ModifiedBy)
			SELECT  DISTINCT
					@fileIdentifier AS FileIdentifier,
					pp.PolicyId,
					pp.InstallmentPremium as CurrentInstallmentPremium,
					pp.AnnualPremium as CurrentAnnualPremium,
					np.InstallmentPremium as NewInstallmentPremium,
					np.AnnualPremium as NewAnnualPremium,
					pc.CreatedBy,
					pc.ModifiedBy
			FROM (SELECT c.PolicyId,
							sum(p.[AnnualPremium]) [AnnualPremium],
							sum(p.[InstallmentPremium]) [InstallmentPremium]
					FROM [Load].[PremiumListingCompany] c with (nolock)
					INNER JOIN [POLICY].[POLICY] p with (nolock) on p.[ParentPolicyId] = c.[PolicyId]
					WHERE c.[FileIdentifier] = @fileIdentifier
					GROUP BY c.[PolicyId]
					) np
				INNER JOIN [policy].[Policy] pp on pp.PolicyId = np.PolicyId
				INNER JOIN [Load].[PremiumListingCompany] pc on pc.PolicyId = np.PolicyId AND pc.FileIdentifier = @fileIdentifier
				LEFT  JOIN [Load].[PremiumListingPolicyPremiumMovement] pppm on pppm.PolicyId = pp.PolicyId AND pppm.FileIdentifier = @fileIdentifier
			WHERE pp.InstallmentPremium > 0 AND pp.InstallmentPremium <> np.InstallmentPremium AND pppm.Id IS NULL

			IF(SELECT COUNT(*) FROM [Load].[PremiumListingPolicyPremiumMovement] WHERE IsProcessed = 0) > 0
			BEGIN
					insert [scheduledTask].[ScheduledTask]([ScheduledTaskTypeId], [TaskScheduleFrequencyId], [ScheduledDate], [LastRun], [LastRunDurationSeconds], [LastStatus], [HostName], [LastReason], [DateTimeLockedToHost], [NumberOfRetriesRemaining], [Priority])
					select 39,13,DATEADD(mi, 1, GETDATE()),GETDATE()-1,0,'Success',NULL,NULL,NULL,1,1

					-- Schedule Assign InvoiceNumbers to run in 10 minutes
					UPDATE [scheduledTask].[ScheduledTask] SET [ScheduledDate] = DATEADD(mi, 10, GETDATE()) WHERE [ScheduledTaskTypeId] = 15;

			END
		END

		-- Update the main policy premium
		update [Load].[PremiumListingMessage] set [Message] = 'Updating main policy premiums...' where [FileIdentifier] = @fileIdentifier
		update p set
			p.[AnnualPremium] = t.[AnnualPremium],
			p.[InstallmentPremium] = t.[InstallmentPremium]
		from [policy].[Policy] p inner join (
			select c.[PolicyId],
				   sum(p.[AnnualPremium]) [AnnualPremium],
				   sum(p.[InstallmentPremium]) [InstallmentPremium]
			from [Load].[PremiumListingCompany] c with (nolock)
				inner join [policy].[Policy] p with (nolock) on p.[ParentPolicyId] = c.[PolicyId]
			where c.[FileIdentifier] = @fileIdentifier
			group by c.[PolicyId]
		) t on t.[PolicyId] = p.[PolicyId]

		select top 1 [PolicyId] from [Load].[PremiumListingCompany] with (nolock) where [FileIdentifier] = @fileIdentifier

		commit tran PremiumListingTransaction

	end try
	begin catch
		rollback tran PremiumListingTransaction
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

	set nocount off

end
