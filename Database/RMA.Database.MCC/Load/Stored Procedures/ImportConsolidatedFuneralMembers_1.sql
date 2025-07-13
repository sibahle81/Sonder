
CREATE   PROCEDURE [Load].[ImportConsolidatedFuneralMembers] (@fileIdentifier uniqueidentifier, @userId varchar(64))
AS BEGIN

	--declare @fileIdentifier uniqueidentifier = 'F91FB44B-3029-436C-8B7D-2F33A83DCA6A'
	--declare @userId varchar(64) = 'bndaba@randmutual.co.za'

	set nocount on

	begin tran trxConsolidatedTransaction

	begin try
		
		declare @count int
		declare @now datetime = getdate()
		
		-- Clear system generated errors that were encountered during Approval 
		delete from [Load].[ConsolidatedFuneralError] where [FileIdentifier] = @fileIdentifier and [ErrorCategory] = 'System'
		select @count = count(*) from [Load].[ConsolidatedFuneralError] where [FileIdentifier] = @fileIdentifier and [NotificationStatusId] = 1
		if (@count > 0) begin
			declare @error varchar(256)
			select top 1 @error = [ErrorMessage] from [Load].[ConsolidatedFuneralError] where [FileIdentifier] = @fileIdentifier and [NotificationStatusId] = 1
			-- declare @error varchar(128) = concat('The import task cannot be completed, because there are still ',@count,' errors.')
			raiserror(@error, 11, 1)
		end

		-- Check if this is a Consolidated Funeral import
		declare @productOption varchar(128)
		declare @isCfp bit = 0
	
		select @productOption = [ProductOptionName]
		from [Load].[ConsolidatedFuneralBenefit]
		where [FileIdentifier] = @fileIdentifier
		group by [ProductOptionName]

		if (left(@productOption, 20) = 'Consolidated Funeral') begin
			set @isCfp = 1
		end

		-- ROLEPLAYERS
		if exists (select top 1 [Id] from [Load].[ConsolidatedFuneralMember] where [FileIdentifier] = @fileIdentifier and [RolePlayerExists] = 0) begin
			-- Update roleplayer id's of new roleplayers
			declare @rolePlayerId int
			select @rolePlayerId = max([RolePlayerId]) from [client].[RolePlayer]

			update m set m.[RolePlayerId] = t.[RolePlayerId]
			from [Load].[ConsolidatedFuneralMember] m inner join (
				select t.[IdTypeId],
					   t.[IdNumber],
					   @rolePlayerId + row_number() over (order by [Id]) [RolePlayerId]
				from (
					select distinct min([Id]) [Id], [IdTypeId], [IdNumber]
					from [Load].[ConsolidatedFuneralMember]    
					where [FileIdentifier] = @fileIdentifier 
					  and [RolePlayerExists] = 0
					group by [IdTypeId], [IdNumber]
				) t
			) t on t.[IdTypeId] = m.[IdTypeId] and t.[IdNumber] = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier

			select @rolePlayerId = max([RolePlayerId]) + 1 from [Load].[ConsolidatedFuneralMember] where [FileIdentifier] = @fileIdentifier
			update [common].[DocumentNumbers] set [NextNumber] = @rolePlayerId where [Name] = 'RolePlayerId'

			-- Insert new RolePlayers
			insert into [client].[RolePlayer] ([RolePlayerId], [DisplayName], [RolePlayerIdentificationTypeId], [IsDeleted], [PreferredCommunicationTypeId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select distinct m.[RolePlayerId], m.[MemberName], 1, 0, 1, @userId, @now, @userId, @now
				from [Load].[ConsolidatedFuneralMember] m   
					left join [client].[RolePlayer] r   on r.[RolePlayerId] = m.[RolePlayerId]
				where m.[FileIdentifier] = @fileIdentifier
				  and r.[RolePlayerId] is null
				group by m.[RolePlayerId],
					m.[MemberName]

			-- Insert new persons
			insert into [client].[Person] ([RolePlayerId], [FirstName], [Surname], [IdTypeId], [IdNumber], [GenderId], [DateOfBirth], [IsAlive], [IsVopdVerified], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select distinct m.[RolePlayerId], m.[FirstName], m.[Surname], m.[IdTypeId], m.[IdNumber], cg.[Id], m.[DateOfBirth], 1, 0, 0, @userId, @now, @userId, @now
				from [Load].[ConsolidatedFuneralMember] m   
					left join [client].[Person] per   on per.RolePlayerId = m.RolePlayerId
					left join [common].[Gender] cg   on cg.[Name] = m.[Gender]
				where m.[FileIdentifier] = @fileIdentifier
					and per.[RolePlayerId] is null
					and m.[RolePlayerExists] = 0
				group by m.[RolePlayerId],
					m.[FirstName],
					m.[Surname],
					m.[IdTypeId],
					m.[IdNumber],
					m.[DateOfBirth],
					cg.[Id]

			-- Update contact details of members
			update rp set
				rp.[TellNumber] = m.[TelNo],
				rp.[CellNumber] = m.[CelNo],
				rp.[EmailAddress] = m.[Email],
				rp.[PreferredCommunicationTypeId] = m.[PreferredCommunication]
			from [Load].[ConsolidatedFuneralMember] m   
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
		from [Load].[ConsolidatedFuneralMember] rp
			inner join [client].[RolePlayer] r on r.[RolePlayerId] = rp.[RolePlayerId]
		where rp.[FileIdentifier] = @fileIdentifier
			and rp.[RolePlayerExists] = 1

		-- Update existing persons
		update p set
			p.[FirstName] = r.[FirstName],
			p.[Surname] = r.[Surname],
			p.[IdTypeId] = r.[IdTypeId],
			p.[IdNumber] = r.[IdNumber],
			p.[DateOfBirth] = r.[DateOfBirth],
			p.[IsAlive] = 1
		from [Load].[ConsolidatedFuneralMember] r
			inner join [client].[Person] p on p.[RolePlayerId] = r.[RolePlayerId]
		where r.[FileIdentifier] = @fileIdentifier
			and r.[RolePlayerExists] = 1

		-- Update main member roleplayer id's
		update m set m.[MainMemberRolePlayerId] = t.[RolePlayerId]
		from [Load].[ConsolidatedFuneralMember] m inner join (
			select distinct [RolePlayerId],
				   [IdNumber] [MainMemberIdNumber]
			from [Load].[ConsolidatedFuneralMember]   
			where [FileIdentifier] = @fileIdentifier
			  and [CoverMemberTypeId] = 1
		) t on t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
		where m.[FileIdentifier] = @fileIdentifier
		  and m.[CoverMemberTypeId] != 1

		-- POLICIES
		if exists (select top 1 [Id] from [Load].[ConsolidatedFuneralMember] where [FileIdentifier] = @fileIdentifier and [CoverMemberTypeId] = 1 and [PolicyExists] = 0) begin
			-- Update policy id's of new policies
			declare @policyId int
			select @policyId = max([PolicyId]) from [policy].[Policy]		

			update m set m.[PolicyId] = t.[PolicyId]
			from [Load].[ConsolidatedFuneralMember] m inner join (
				select [Id], @policyId + row_number() over (order by [Id]) [PolicyId]
				from [Load].[ConsolidatedFuneralMember]   
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] = 1
				  and [PolicyExists] = 0
			) t on t.[Id] = m.[Id]
			where m.[FileIdentifier] = @fileIdentifier

			select @policyId = max([PolicyId]) + 1 from [Load].[ConsolidatedFuneralMember] where [FileIdentifier] = @fileIdentifier
			update [common].[DocumentNumbers] set [NextNumber] = @policyId where [Name] = 'PolicyNumber'
			
			-- Update policy numbers of dependent members
			update m set m.[PolicyId] = t.[PolicyId]
			from [Load].[ConsolidatedFuneralMember] m inner join (
				select [ClientReference],
					[IdNumber] [MainMemberIdNumber],
					[PolicyId]
				from [Load].[ConsolidatedFuneralMember]   
				where [FileIdentifier] = @fileIdentifier
				  and [CoverMemberTypeId] = 1
			) t on t.[ClientReference] = m.[ClientReference] and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]
			where m.[FileIdentifier] = @fileIdentifier

			-- Insert new policies
			declare @date varchar(8)
			set @date = concat(year(getdate()), right(concat('00', month(getdate())), 2))
			insert into [policy].[Policy] ([PolicyId],[TenantId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PolicyPayeeId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationDate], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [PolicyStatusId], [AnnualPremium], [InstallmentPremium], [AdminPercentage], [CommissionPercentage], [BinderFeePercentage], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [ClientReference], [ParentPolicyId], [CanLapse])
				select distinct m.[PolicyId],
					1 [TenantId],
					m.[BrokerageId],
					b.[ProductOptionId],
					m.[RepresentativeId],
					null [JuristicRepresentativeId],
					m.[RolePlayerId] [PolicyOwnerId],
					m.[RolePlayerId] [PolicyPayeeId],
					2 [PaymentFrequencyId],
					iif(sd.[IdNumber] = null, 11, 12) [PaymentMethodId],
					concat('01-', @date, '-', right(concat('000000', m.[PolicyId]), 6)) [PolicyNumber],
					m.[JoinDate] [PolicyInceptionDate],
					null [ExpiryDate],
					null [CancellationDate],
					m.[JoinDate] [FirstInstallmentDate],
					null [LastInstallmentDate],
					m.[DebitOrderDay] [RegularInstallmentDayOfMonth],
					m.[DebitOrderDay] [DecemberInstallmentDayOfMonth],
					iif(@isCfp = 1, 20, 1) [PolicyStatusId],
					isnull(pr.[AnnualInstallmentPremium] + (t.[Rate] * 12.0), 0) [AnnualPremium],
					isnull(pr.[InstallmentPremium] + t.[Rate], 0) [InstallmentPremium],
					0 [AdminPercentage],
					0 [CommissionPercentage],
					0 [BinderFeePercentage],
					0 [IsDeleted],
					@userId [CreatedBy],
					getdate() [CreatedDate],
					@userId [ModifiedBy],
					getdate() [ModifiedDate],
					iif(left(m.[ClientReference], 3) = 'XXX', null, m.[ClientReference]) [ClientReference],
					null [ParentPolicyId],
					0 [CanLapse]
				from [Load].[ConsolidatedFuneralMember] m 
					inner join [Load].[ConsolidatedFuneralBenefit] b on b.[FileIdentifier] = m.[FileIdentifier] and b.[ProductOptionId] = m.[ProductOptionId] and b.[BenefitId] = m.[BenefitId]
					inner join (
						select [PolicyId],
							sum([PolicyPremium] * 12.0) [AnnualInstallmentPremium],
							sum([PolicyPremium]) [InstallmentPremium]
						from [Load].[ConsolidatedFuneralMember]
						where [FileIdentifier] = @fileIdentifier
						group by [PolicyId]
					) pr on pr.[PolicyId] = m.[PolicyId]
					left join (
						select br.[ProductOptionId],
							sum(br.[BaseRate]) [Rate]
						from [Load].[ConsolidatedFuneralBenefit] b   
							inner join [product].[CurrentBenefitRate] br   on br.[ProductOptionId] = b.[ProductOptionId] and br.[CoverMemberTypeId] = b.[CoverMemberTypeId]
						where b.[FileIdentifier] = @fileIdentifier
							and br.[BenefitTypeId] = 2
							and br.[CoverMemberTypeId] = 1
						group by br.[ProductOptionId]
					) t on t.[ProductOptionId] = m.[ProductOptionId]
					left join (
						select IdNumber,
							max([PreviousInsurerEndDate]) [LastInsuranceDate]
						from [Load].[ConsolidatedFuneralInsurance]
						where [FileIdentifier] = @fileIdentifier
						group by [IdNumber]
					) d on d.IdNumber = m.[IdNumber]
					left join (
						select [IdNumber]
						from [Load].[ConsolidatedFuneralDeduction]
						where [FileIdentifier] = @fileIdentifier
					) sd on sd.IdNumber = m.[IdNumber]
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[PolicyExists] = 0
				  and m.[CoverMemberTypeId] = 1
		end else begin
			-- Update policy details
			update p set				
				p.[ProductOptionId] = b.ProductOptionId,
				p.[BrokerageId] = m.[BrokerageId],
				p.[RepresentativeId] = m.[RepresentativeId],
				p.[PolicyOwnerId] = m.[RolePlayerId],
				p.[PolicyPayeeId] = m.[RolePlayerId],
				p.[PolicyInceptionDate]	= m.[JoinDate],
				p.[RegularInstallmentDayOfMonth] = m.[DebitOrderDay],
				p.[DecemberInstallmentDayOfMonth] = m.[DebitOrderDay],
				p.[AnnualPremium] = isnull(pr.[AnnualInstallmentPremium] + (t.[Rate] * 12.0), 0),
				p.[InstallmentPremium] = isnull(pr.[InstallmentPremium] + t.[Rate], 0),
				p.[ModifiedBy] = @userId,
				p.[ModifiedDate] = @now
			from [policy].[Policy] p 
				inner join [Load].[ConsolidatedFuneralMember] m on p.[PolicyId] = m.[PolicyId]
				inner join [Load].[ConsolidatedFuneralBenefit] b on b.[FileIdentifier] = m.[FileIdentifier] and b.[ProductOptionId] = m.[ProductOptionId] and b.[BenefitId] = m.[BenefitId]
				inner join (
					select [PolicyId],
						sum([PolicyPremium] * 12.0) [AnnualInstallmentPremium],
						sum([PolicyPremium]) [InstallmentPremium]
					from [Load].[ConsolidatedFuneralMember]
					where [FileIdentifier] = @fileIdentifier
					group by [PolicyId]
				) pr on pr.[PolicyId] = m.[PolicyId]
				left join (
					select br.[ProductOptionId],
						sum(br.[BaseRate]) [Rate]
					from [Load].[ConsolidatedFuneralBenefit] b   
						inner join [product].[CurrentBenefitRate] br   on br.[ProductOptionId] = b.[ProductOptionId] and br.[CoverMemberTypeId] = b.[CoverMemberTypeId]
					where b.[FileIdentifier] = @fileIdentifier
					  and br.[BenefitTypeId] = 2
					  and br.[CoverMemberTypeId] = 1
					group by br.[ProductOptionId]
				) t on t.[ProductOptionId] = m.[ProductOptionId]
				left join (
					select IdNumber,
						max([PreviousInsurerEndDate]) [LastInsuranceDate]
					from [Load].[ConsolidatedFuneralInsurance]
					where [FileIdentifier] = @fileIdentifier
					group by [IdNumber]
				) d on d.IdNumber = m.[IdNumber]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[PolicyExists] = 1
				and m.[CoverMemberTypeId] = 1
		end

		if @isCfp = 1 begin
			-- Update existing PolicyLifeExtension records
			update pe set
				[AnnualIncreaseTypeId] = m.[AnnualIncreaseType],
				[AnnualIncreaseMonth] = m.[AnnualIncreaseMonth],
				[AffordabilityCheckPassed] = case m.[Affordability] when 'Not Affordable' then 0 else 1 end,
				[ModifiedBy] = @userId,
				[ModifiedDate] = getdate()
			from [Load].[ConsolidatedFuneralMember] m 
				inner join [policy].[PolicyLifeExtension] pe on pe.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 1

			-- Insert PolicyLifeExtension records
			insert into [policy].[PolicyLifeExtension] ([PolicyId], [AnnualIncreaseTypeId], [AnnualIncreaseMonth], [AffordabilityCheckPassed], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select m.[PolicyId],
					m.[AnnualIncreaseType] [AnnualIncreaseTypeId],
					m.[AnnualIncreaseMonth] [AnnualIncreaseMonth],
					case m.[Affordability] when 'Not Affordable' then 0 else 1 end [AffordabilityCheckPassed],
					0 [IsDeleted],
					@userId [CreatedBy],
					getdate() [CreatedDate],
					@userId [ModifiedBy],
					getdate() [ModifiedDate]
				from [Load].[ConsolidatedFuneralMember] m 
					left join [policy].[PolicyLifeExtension] pe on pe.[PolicyId] = m.[PolicyId]
				where m.[FileIdentifier] = @fileIdentifier
				  and m.[CoverMemberTypeId] = 1
				  and pe.[PolicyId] is null
		end

		-- Insert policy insured lives (excl. beneficiaries)
		insert into [policy].[PolicyInsuredLives] ([PolicyId], [RolePlayerId], [RolePlayerTypeId], [InsuredLifeStatusId], [StatedBenefitId], [StartDate], [Premium], [CoverAmount], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select distinct m.[PolicyId],
				m.[RolePlayerId],
				m.[RolePlayerTypeId],
				1 [InsuredLifeStatusId],
				m.[BenefitId],
				m.[JoinDate],
				m.[PolicyPremium] [Premium],
				m.[PolicyCover] [CoverAmount],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
			from [Load].[ConsolidatedFuneralMember] m   
				left join [policy].[PolicyInsuredLives] pil   on
					pil.[PolicyId] = m.[PolicyId] and
					pil.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] < 20
				and pil.[PolicyId] is null
			order by m.[RolePlayerTypeId],
				m.[RolePlayerId]

		-- Update existing policy insured lives
		update pil set
			pil.[RolePlayerTypeId] = m.[RolePlayerTypeId],
			pil.[InsuredLifeStatusId] = 1,
			pil.[StartDate] = m.[JoinDate],
			pil.[EndDate] = null,
			pil.[StatedBenefitId] = m.[BenefitId],
			pil.[Premium] = m.[PolicyPremium],
			pil.[CoverAmount] = m.[PolicyCover],
			pil.[ModifiedBy] = @userId,
			pil.[ModifiedDate] = getdate()
		from [Load].[ConsolidatedFuneralMember] m   
				inner join [policy].[PolicyInsuredLives] pil   on
					pil.[PolicyId] = m.[PolicyId] and
					pil.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] < 20

		-- Insert roleplayer relations
		insert into [client].[RolePlayerRelation] ([FromRolePlayerId], [ToRolePlayerId], [RolePlayerTypeId], [PolicyId])
			select distinct m.[RolePlayerId] [FromRolePlayerId],
				   m.[MainMemberRolePlayerId] [ToRolePlayerId],
				   m.[RolePlayerTypeId],
				   m.[PolicyId]
			from [Load].[ConsolidatedFuneralMember] m   
				left join [client].[RolePlayerRelation] rr   on
					rr.[FromRolePlayerId] = m.[RolePlayerId] and
					rr.[ToRolePlayerId] = m.[MainMemberRolePlayerId] and
					rr.[RolePlayerTypeId] = m.[RolePlayerTypeId] and
					rr.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] != 1
			  and rr.[Id] is null
		
		-- Add main member beneficiaries
		insert into [client].[RolePlayerRelation] ([FromRolePlayerId], [ToRolePlayerId], [RolePlayerTypeId], [PolicyId])
			select m.[RolePlayerId] [FromRolePlayerId],
				   m.[RolePlayerId] [ToRolePlayerId],
				   41 [RolePlayerTypeId],
				   m.[PolicyId]
			from [Load].[ConsolidatedFuneralMember] m   
				left join [client].[RolePlayerRelation] rr on
					rr.[FromRolePlayerId] = m.[RolePlayerId] and
					rr.[ToRolePlayerId] = m.[RolePlayerId] and
					rr.[RolePlayerTypeId] = 41 and
					rr.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and rr.[Id] is null

		-- Add additional beneficiaries
		insert into [client].[RolePlayerRelation] ([FromRolePlayerId], [ToRolePlayerId], [RolePlayerTypeId], [PolicyId])
			select m.[RolePlayerId] [FromRolePlayerId],
				   m.[MainMemberRolePlayerId] [ToRolePlayerId],
				   41 [RolePlayerTypeId],
				   m.[PolicyId]
			from [Load].[ConsolidatedFuneralMember] m   
				left join [client].[RolePlayerRelation] rr on
					rr.[FromRolePlayerId] = m.[RolePlayerId] and
					rr.[ToRolePlayerId] = m.[MainMemberRolePlayerId] and
					rr.[RolePlayerTypeId] = 41 and
					rr.[PolicyId] = m.[PolicyId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 99
			  and rr.[Id] is null

		-- Insert policy benefits
		insert into [policy].[PolicyBenefit]
			select m.[PolicyId],
				m.[BenefitId]
			from [Load].[ConsolidatedFuneralMember] m   
				left join [policy].[PolicyBenefit] b   on 
					b.[PolicyId] = m.[PolicyId] and 
					b.[BenifitId] = m.[BenefitId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] < 20
				and b.[BenifitId] is null
			group by m.[PolicyId], m.[BenefitId]

		-- Insert policy brokers
		insert into [policy].[PolicyBroker] ([PolicyId], [RepId], [BrokerageId], [JuristicRepId], [EffectiveDate], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select  m.[PolicyId],
				p.[RepresentativeId] [RepId],
				p.[BrokerageId],
				p.[JuristicRepresentativeId] [JuristicRepId],
				cast(getdate() as date) [EffectiveDate],
				0 [IsDeleted],
				@userId [CreatedBy],
				@now [CreatedDate],
				@userId [ModifiedBy],
				@now [ModifiedDate]
			from [Load].[ConsolidatedFuneralMember] m   
				inner join [policy].[Policy] p   on p.[PolicyId] = m.[PolicyId]
				left join [policy].[PolicyBroker] pb   on pb.[PolicyId] = m.[PolicyId] and pb.[BrokerageId] = m.[BrokerageId] and pb.[RepId] = m.[RepresentativeId]
			where m.[FileIdentifier] = @fileIdentifier
				and m.[CoverMemberTypeId] = 1
				and pb.[PolicyBrokerId] is null

		-- Update roleplayer physical addresses
		update a set
			a.[AddressLine1] = left(m.[Address1], 50),
			a.[AddressLine2] = left(m.[Address2], 50),
			a.[PostalCode] = m.[PostalCode],
			a.[City] = m.[City],
			a.[Province] = m.[Province],
			a.[ModifiedBy] = @userId,
			a.[ModifiedDate] = @now
		from [Load].[ConsolidatedFuneralMember] m
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
			from [Load].[ConsolidatedFuneralMember] m   
				left join [client].[RolePlayerAddress] rpa   on rpa.[RolePlayerId] = m.[RolePlayerId] and rpa.[AddressTypeId] = 1
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
		from [Load].[ConsolidatedFuneralMember] m
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
			from [Load].[ConsolidatedFuneralMember] r   
				left join [client].[RolePlayerAddress] rpa   on rpa.[RolePlayerId] = r.[RolePlayerId] and rpa.[AddressTypeId] = 2
			where r.[FileIdentifier] = @fileIdentifier
				and r.[CoverMemberTypeId] = 1
				and isnull(r.[PostalAddress1], '') != ''
				and rpa.[RolePlayerAddressId] is null

		-- Update previous insurer information
		update pr set
			pr.[PreviousInsurerID] = p.[Id],
			pr.[PolicyNumber] = pin.[PreviousInsurerPolicyNumber],
			pr.[PolicyStartDate] = cast(pin.[PreviousInsurerStartDate] as date),
			pr.[PolicyEndDate] = cast(pin.[PreviousInsurerEndDate] as date),
			pr.[SumAssured] = pin.[SumAssured],
			pr.[ModifiedBy] = @userId,
			pr.[ModifiedDate] = getdate()
		from [Load].[ConsolidatedFuneralMember] m   
			inner join [Load].[ConsolidatedFuneralInsurance] pin   on pin.[FileIdentifier] = m.[FileIdentifier] and pin.[IdNumber] = m.[IdNumber]
			inner join [client].[PreviousInsurerRolePlayer] pr   on pr.[RolePlayerId] = m.[RolePlayerId]
			inner join [common].[PreviousInsurer] p   on p.[Name] = pin.[PreviousInsurer]
		where m.[FileIdentifier] = @fileIdentifier

		-- Insert previous insurer information
		insert into [client].[PreviousInsurerRolePlayer] ([PreviousInsurerID], [RolePlayerID], [PolicyNumber], [PolicyStartDate], [PolicyEndDate], [SumAssured], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select p.[Id],
					m.[RolePlayerId],
					pin.[PreviousInsurerPolicyNumber] [PolicyNumber],
					cast(pin.[PreviousInsurerStartDate] as date) [PreviousInsurerStartDate],
					cast(pin.[PreviousInsurerEndDate] as date) [PreviousInsurerEndDate],
					pin.[SumAssured],
					@userId [CreatedBy],
					@now [CreatedDate],
					@userId [ModifiedBy],
					@now [ModifiedDate]
			from [Load].[ConsolidatedFuneralMember] m   
				inner join [Load].[ConsolidatedFuneralInsurance] pin   on pin.[FileIdentifier] = m.[FileIdentifier] and pin.[IdNumber] = m.[IdNumber]
				inner join [common].[PreviousInsurer] p   on p.[Name] = pin.[PreviousInsurer]
				left join [client].[PreviousInsurerRolePlayer] pr   on pr.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
				and pr.[Id] is null
		 
		-- Insert roleplayer banking details
		insert into [client].[RolePlayerBankingDetails] ([RolePlayerId], [PurposeId], [EffectiveDate], [AccountNumber], [BankBranchId], [BankAccountTypeId], [AccountHolderName], [BranchCode], [ApprovalRequestedFor], [ApprovalRequestId], [IsApproved], [Reason], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [AccountHolderIdNumber])
			select m.[RolePlayerId],
				1 [PurposeId], 
				m.[JoinDate] [EffectiveDate],
				b.[AccountNo] [AccountNumber],
				bb.[Id] [BankBranchId],
				bat.[Id] [BankAccountTypeId],	
				m.[MemberName] [AccountHolderName],
				b.[BranchCode],
				null [ApprovalRequestedFor],
				null [ApprovalRequestId],
				null [IsApproved],
				null [Reason],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate],
				m.[IdNumber] [AccountHolderIdNumber]
			from [Load].[ConsolidatedFuneralMember] m 
				inner join [Load].[ConsolidatedFuneralBank] b on b.[FileIdentifier] = m.[FileIdentifier] and b.[IdNumber] = m.[IdNumber]
				inner join [common].[BankAccountType] bat on bat.[Name] = b.[AccountType]
				left join [common].[BankBranch] bb on bb.[Code] = b.[BranchCode]
				left join [client].[RolePlayerBankingDetails] rbd on rbd.[RolePlayerId] = m.[RolePlayerId] and rbd.[AccountNumber] = b.[AccountNo]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and rbd.[RolePlayerId] is null

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
			from [Load].[ConsolidatedFuneralMember] m   
				inner join [product].[CurrentBenefitRate] br   on br.[ProductOptionId] = m.[ProductOptionId] and br.[BenefitTypeId] = 2
				left join [policy].[PolicyInsuredLifeAdditionalBenefits] ad   on ad.[PolicyId] = m.[PolicyId] and ad.[RolePlayerId] = m.[RolePlayerId]
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] < 20
			  and ad.[RolePlayerId] is null

		-- Insert Government deduction information
		insert into [client].[RolePlayerPersalDetail] ([RolePlayerId], [PersalNumber], [Employer], [Department], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select m.[RolePlayerId],
				d.[PersalNumber],
				d.[Employer],
				d.[Department],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
			from [Load].[ConsolidatedFuneralMember] m 
				inner join [Load].[ConsolidatedFuneralDeduction] d on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
				left join [client].[RolePlayerPersalDetail] rpp on rpp.[RolePlayerId] = m.[RolePlayerId] and rpp.[PersalNumber] = d.[PersalNumber] and rpp.[IsDeleted] = 0
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and rpp.[RolePlayerId] is null

		-- Soft delete old PERSAL details
		update rpp set
			[IsDeleted] = 1,
			[ModifiedBy] = @userId,
			[ModifiedDate] = getdate()
		from [Load].[ConsolidatedFuneralMember] m 
			inner join [Load].[ConsolidatedFuneralDeduction] d on d.[FileIdentifier] = m.[FileIdentifier] and d.[IdNumber] = m.[IdNumber]
			inner join [client].[RolePlayerPersalDetail] rpp on rpp.[RolePlayerId] = m.[RolePlayerId] and rpp.[PersalNumber] <> d.[PersalNumber]
		where m.[FileIdentifier] = @fileIdentifier
			and m.[CoverMemberTypeId] = 1
			and rpp.[IsDeleted] = 0

		-- Insert client.FinPayee records
		declare @client table (
			[Id] int identity,
			[RolePlayerId] int primary key,
			[Initials] varchar(8),
			[NextNumber] int,
			[FinPayeNumber] varchar(16)
		)

		insert into @client ([RolePlayerId], [Initials], [NextNumber], [FinPayeNumber])
			select distinct m.[RolePlayerId],
				concat(left(m.[FirstName], 1), left(m.[Surname], 1)) [Initials],
				0 [NextNumber],
				'' [FinPayeNumber]
			from [Load].[ConsolidatedFuneralMember] m 
				left join client.[FinPayee] fp on fp.RolePlayerId = m.RolePlayerId
			where m.[FileIdentifier] = @fileIdentifier
			  and m.[CoverMemberTypeId] = 1
			  and fp.[RolePlayerId] is null			  

		select @count = count(*) from @client

		if @count > 0 begin
			declare @nextNumber int
			select @nextNumber = [NextNumber] from [common].[DocumentNumbers] where [Name] = 'AccountNumber'
			update @client set [NextNumber] = @nextNumber + [Id]
			select @nextNumber = max([NextNumber]) + 1 from @client
			update [common].[DocumentNumbers] set [NextNumber] = @nextNumber where [Name] = 'AccountNumber'

			insert into client.FinPayee ([RolePlayerId],[FinPayeNumber],[IsAuthorised],[AuthroisedBy],[AuthorisedDate],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[IndustryId])
			select distinct [RolePlayerId],
				concat([Initials], right(concat('000000', [NextNumber]), 6)) [FinPayeNumber],
				1 [IsAuthorised],
				@userId [AuthroisedBy],
				getdate() [AuthorisedDate],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate],
				null [IndustryId]
			from @client
		end

		update m set
			m.[PolicyNumber] = p.[PolicyNumber]
		from [Load].[ConsolidatedFuneralMember] m
			inner join [policy].[Policy] p on p.[PolicyId] = m.[PolicyId]
		where m.[FileIdentifier] = @fileIdentifier

		if @isCfp = 0 begin
			-- Update policy premiums
			update p set
				p.[InstallmentPremium] = t.[Premium],
				p.[AnnualPremium] = t.[Premium] * 12.0
			from [policy].[Policy] p
				inner join (
					select t.[PolicyId],	
						[policy].[CalculateIndividualPolicyPremium](t.[Premium], t.[AdminPercentage], t.[CommissionPercentage], t.[BinderFeePercentage]) [Premium]
					from (
						select p.[PolicyId],
							sum(br.[BaseRate]) [Premium],
							p.[AdminPercentage],
							p.[CommissionPercentage],
							p.[BinderFeePercentage] 
						from [Load].[ConsolidatedFuneralMember] m   
							inner join [policy].[Policy] p   on p.[PolicyId] = m.[PolicyId]
							inner join [policy].[PolicyInsuredLives] pil   on pil.[PolicyId] = p.[PolicyId]
							inner join [product].[CurrentBenefitRate] br   on 
								br.[ProductOptionId] = p.[ProductOptionId] and
								br.[BenefitId] = pil.[StatedBenefitId]
						where m.[FileIdentifier] = @fileIdentifier
						  and m.[CoverMemberTypeId] = 1
						  and pil.[InsuredLifeStatusId] = 1
						group by p.[PolicyId],
							p.[AdminPercentage],
							p.[CommissionPercentage],
							p.[BinderFeePercentage] 
					) t
				) t on t.[PolicyId] = p.[PolicyId]
		end

		commit tran trxConsolidatedTransaction

		select count(*) [Policies]
		from [Load].[ConsolidatedFuneralMember]
		where [FileIdentifier] = @fileIdentifier
		  and [CoverMemberTypeId] = 1

	end try
	begin catch
		rollback tran trxConsolidatedTransaction
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

	set nocount off

END