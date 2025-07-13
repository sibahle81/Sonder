CREATE PROCEDURE [policy].[ImportInsuredLives] (@fileIdentifier varchar(1000), @saveInsuredLives bit)
AS
begin
declare @severity int, @state int;
declare @rowcount int
		declare @message varchar(max)
		-- Error capturing table
		declare @errors table (
			[FileIdentifier] varchar(512),
			[ErrorCategory] varchar(64),
			[ErrorMessage] varchar(1024)
		)
		-- Policy, benefit and rule information
		declare @policies table (
			[FileIdentifier] varchar(128),
			[AccountHolder] varchar(128),
			[PolicyOwnerId] int,
			[CompanyName] varchar(64),
			[PolicyId] int,
			[PolicyNumber] varchar(30),
			[ProductOptionId] int,
			[BenefitId] int,
			[CoverMemberTypeId] int,
			[Premium] float,
			[BenefitAmount] float,
			[CapCoverLessFive] float,
			[CapCoverLessThirteen] float,
			[CapCoverOverThirteen] float,
			[MinimumAge] int,
			[MaximumAge] int
		)

	begin try
		begin tran TImport
		
		insert into @policies
			select @fileIdentifier,
				fp.[Company],
				c.[RolePlayerId],
				c.[Name],
				p.[PolicyId],
				p.[PolicyNumber],
				p.[ProductOptionId],
				b.[Id],
				b.[CoverMemberTypeId],
				isnull(br.[BaseRate], 0.0) [TotalPremium],
				isnull(br.[BenefitAmount], 0.0) [TotalBenefitAmount],
				isnull(json_value(r2.[RuleConfiguration], '$[0].fieldValue'), 0.0),
				isnull(json_value(r3.[RuleConfiguration], '$[0].fieldValue'), 0.0),
				isnull(json_value(r4.[RuleConfiguration], '$[0].fieldValue'), 0.0),
				isnull(json_value(minAge.[RuleConfiguration], '$[0].fieldValue'), 0) [MinimumAge],
				isnull(json_value(maxAge.[RuleConfiguration], '$[0].fieldValue'), 1000) [MaximumAge]
			from [Load].[FuneralPremium] fp
				left join [client].[Company] c on c.[Name] = fp.[Company] and c.[IsDeleted] = 0
				left join [policy].[Policy] p on p.[PolicyOwnerId] = c.[RolePlayerId] and p.[IsDeleted] = 0
				left join [product].[ProductOption] po on po.[Id] = p.[ProductOptionId] and po.[IsDeleted] = 0
				left join [product].[Product] pr on pr.[Id] = po.[ProductId] and pr.[IsDeleted] = 0
				left join [product].[ProductOptionBenefit] pob on pob.ProductOptionId = po.[Id]
				left join [product].[Benefit] b on b.[Id] = pob.[BenefitId] and b.[CoverMemberTypeId] = 1 and b.[IsDeleted] = 0
					left join (
					select [BenefitId],
						[BaseRate],
						[BenefitAmount],
						rank() over (partition by [BenefitId] order by [EffectiveDate] desc) [Rank]
					from [product].[BenefitRate]
					where [IsDeleted] = 0
				) br on br.[BenefitId] = b.[Id]
				left join [product].[BenefitRule] minAge on minAge.[BenefitId] = b.[Id] and minAge.[RuleId] = 12 and minAge.[IsDeleted] = 0
				left join [product].[BenefitRule] maxAge on maxAge.[BenefitId] = b.[Id] and maxAge.[RuleId] = 11 and maxAge.[IsDeleted] = 0
				left join [product].[ProductRule] r2 on r2.[ProductId] = pr.[Id] and r2.[RuleId] = 2 and r2.[IsDeleted] = 0
				left join [product].[ProductRule] r3 on r3.[ProductId] = pr.[Id] and r3.[RuleId] = 3 and r3.[IsDeleted] = 0
				left join [product].[ProductRule] r4 on r4.[ProductId] = pr.[Id] and r4.[RuleId] = 4 and r4.[IsDeleted] = 0
			where p.[ParentPolicyId] is null
				and br.[Rank] = 1
				and fp.[FileIdentifier] = @fileIdentifier
			group by fp.[Company],
				c.[RolePlayerId],
				c.[Name],
				p.[PolicyId],
				p.[PolicyNumber],
				p.[ProductOptionId],
				b.[Id],
				b.[CoverMemberTypeId],
				r2.[RuleConfiguration],
				r3.[RuleConfiguration],
				r4.[RuleConfiguration],
				minAge.[RuleConfiguration],
				maxAge.[RuleConfiguration],
				br.[BenefitAmount],
				br.[BaseRate]
		-- Check if records for file identifier exists
		set @rowcount = @@ROWCOUNT
		-- Remove records with no benefits
		if @rowcount > 0 begin
			delete from @policies where [BenefitId] is null
			set @rowcount -= @@ROWCOUNT
		end
		set nocount on
		if (@rowcount = 0) begin
			raiserror('No funeral premium file records found for identifier %s', 11, 1, @fileIdentifier)
		end
		-- Validate the company
		select top 1 @message = CONCAT('Company ', [AccountHolder], ' does not exist in the system.') from @policies where [PolicyOwnerId] is null
		if (@message is not null) begin
			raiserror(@message, 11, 1)
		end
		-- Validate the policies
		select top 1 @message = CONCAT('Company ', [CompanyName], ' does not own any policies.') from @policies where [PolicyOwnerId] is not null and [PolicyId] is null
		if (@message is not null) begin
			raiserror(@message, 11, 1)
		end
		-- Check for duplicate member
		insert into @errors
			select @fileIdentifier,
				'Duplicate Members',
				CONCAT(count(*), ' members with identifier ', iif(isnull(fp.[IdNumber], '') = '', fp.[PassportNumber], fp.[IdNumber]))
			from [Load].[FuneralPremium] fp
			where fp.[FileIdentifier] = @fileIdentifier
				and trim(concat(fp.[Name], fp.[Surname])) != ''
			group by iif(isnull(fp.[IdNumber], '') = '', fp.[PassportNumber], fp.[IdNumber])
			having count(*) > 1
		-- First, insert the roleplayers
		declare @roleplayers table (
			[RolePlayerId] int,
			[FirstName] varchar(128),
			[Surname] varchar(128),
			[IdTypeId] int,
			[IdNumber] varchar(32),
			[DateOfBirth] date,
			[Age] int,
			[DateJoined] date,
			[ClientPremium] float default 0.0,
			[CurrentCoverAmount] float default 0.0,
			[ParentPolicyId] int default 0,
			[PolicyId] int default 0,
			[PolicyPremium] float default 0.0,
			[RolePlayerExists] bit default 0,
			[PolicyExists] bit default 0,
			[IsDeleted] bit default 0
		)
		-- Insert all the members from the file into a temp table
		insert into @roleplayers ([RolePlayerId], [FirstName], [Surname], [IdTypeId], [IdNumber], [DateOfBirth], [DateJoined], [ClientPremium], [RolePlayerExists], [PolicyExists])
			select isnull(p.[RolePlayerId], 0) [RolePlayerId],
				fp.[Name],
				fp.[Surname],
				iif(isnull(fp.[IdNumber], '') = '', 2, 1) as [IdTypeId],
				iif(isnull(fp.[IdNumber], '') = '', fp.[PassportNumber], fp.[IdNumber]) as [IdNumber],
				iif(isdate(fp.[DateofBirth]) = 1, convert(date, fp.[DateofBirth]), null) [DateOfBirth],
				iif(isdate(fp.[Date]) = 1, convert(date, fp.[Date]), convert(date, getdate())) [DateJoined],
				cast(fp.[TotalAmount] as float) [ClientPremium],
				cast(iif(p.[RolePlayerId] is null, 0, 1) as bit) [RolePlayerExists],
				cast(0 as bit) [PolicyExists]
			from [Load].[FuneralPremium] fp
				left join [client].[person] p on (p.[IdTypeId] = 1 and p.[IdNumber] = fp.[IDNumber]) or (p.[IdTypeId] = 2 and p.[IdNumber] = fp.[PassportNumber])
			where fp.[FileIdentifier] = @fileIdentifier

		-- VALIDATE MISSING ID NUMBERS
		insert into @errors 
			select @fileIdentifier, 'Missing ID Numbers', CONCAT('Member ', [FirstName], ' ', [Surname], ' has no ID number assigned')
			from @roleplayers where ISNULL([IdNumber], '') = ''
		-- VALIDATE DUPLICATE ID NUMBERS
		insert into @errors
			select @fileIdentifier, 'Duplicate Members', CONCAT(count(*), ' members with identifier ', iif(isnull(fp.[IdNumber], '') = '', fp.[PassportNumber], fp.[IdNumber]))
			from [Load].[FuneralPremium]  fp
			where fp.[FileIdentifier] = @fileIdentifier and trim(concat(fp.[Name], fp.[Surname])) != ''
			group by iif(isnull(fp.[IdNumber], '') = '', fp.[PassportNumber], fp.[IdNumber])
			having count(*) > 1

		-- Update the dob's for members with ID numbers
		update @roleplayers set
				[DateOfBirth] = dbo.GetDOBFromID([IdNumber])
			where [IdTypeId] = 1
			-- Update member age and total cover amount
			update @roleplayers set
				[Age] = datediff(yy, [DateofBirth], getdate()) - case when dateadd(yy, datediff(yy, [DateofBirth], getdate()), [DateofBirth]) > getdate() then 1 else 0 end,
				[CurrentCoverAmount] = dbo.GetTotalCoverAmount([IdTypeId], [IdNumber])

		-- VALIDATE MISSING DOB'S
		insert into @errors
			select @fileIdentifier, 'Missing DOB', CONCAT('Member ', [FirstName], ' ', [Surname], ' has no date of birth assigned')
			from @roleplayers where [DateOfBirth] is null

		-- Update existing policy details
		update rp set
				rp.[ParentPolicyId] = parent.[PolicyId],
				rp.[PolicyId] = child.[PolicyId],
				rp.[PolicyExists] = cast(1 as bit),
				rp.[PolicyPremium] = parent.[Premium]
			from @roleplayers rp
				inner join [policy].[PolicyInsuredLives] pil on pil.[RolePlayerId] = rp.[RolePlayerId]
				inner join [policy].[Policy] child on child.[PolicyId] = pil.[PolicyId]
				inner join @policies parent on parent.[PolicyId] = child.[ParentPolicyId]
		-- Update new policy details
		update rp set
				rp.[ParentPolicyId] = p.[PolicyId],
				rp.[PolicyPremium] = p.[Premium]
			from @policies p
				inner join @roleplayers rp on rp.[ClientPremium] = p.[Premium]
			where rp.[PolicyExists] = 0
		-- Insert details of members that were not included in the import file (deleted members)
		insert into @roleplayers ([RolePlayerId], [FirstName], [Surname], [IdTypeId], [IdNumber], [DateOfBirth], [Age], [DateJoined], [ClientPremium], [CurrentCoverAmount], [ParentPolicyId], [PolicyId], [PolicyPremium], [RolePlayerExists], [PolicyExists], [IsDeleted])
			select p.[RolePlayerId],
				p.[FirstName],
				p.[Surname],
				p.[IdTypeId],
				p.[IdNumber],
				p.[DateOfBirth],
				0 [Age],
				pil.[StartDate] [DateJoined],
				parent.[Premium] [ClientPremium],
				0.0 [CurrentCoverAmount],
				parent.[PolicyId] [ParentPolicyId],
				child.[PolicyId],
				child.[InstallmentPremium] [PolicyPremium],
				cast(1 as bit) [RolePlayerExists],
				cast(1 as bit) [PolicyExists],
				CAST(1 as bit) [IsDeleted]
			from @policies parent
				inner join [policy].[Policy] child on child.[ParentPolicyId] = parent.PolicyId
				inner join [policy].[PolicyInsuredLives] pil on pil.[PolicyId] = child.[PolicyId]
				inner join [client].[Person] p on p.[RolePlayerId] = pil.[RolePlayerId]
				left join @roleplayers rp on rp.[RolePlayerId] = pil.[RolePlayerId]
			where rp.[RolePlayerId] is null

		-- VALIDATE AGE RANGE
		insert into @errors
			select @fileIdentifier, 
				'Age Range', 
				concat('Member ', r.[FirstName],' ',r.[Surname],' with ID ',r.[IdNumber],' falls outside the age range of ',p.[MinimumAge],' to ',p.[MaximumAge],' at ',r.[Age],'.')
			from @roleplayers r
				inner join @policies p on p.[PolicyId] = r.[ParentPolicyId]
			where r.[IsDeleted] = 0
				and r.[Age] not between p.[MinimumAge] and p.[MaximumAge]

		-- VALIDATE COVER AMOUNTS
			insert into @errors	-- Less than 5 years old
			select @fileIdentifier, 'Cap Cover', CONCAT('Adding ', p.[BenefitAmount], ' to existing cover of ', r.[CurrentCoverAmount], ' will exceed cap cover of ', p.[CapCoverLessFive], ' for member ', r.[FirstName], ' ', r.[Surname], ' with ID ', r.[IdNumber], '.')
			from @roleplayers r inner join @policies p on p.[PolicyId] = r.[ParentPolicyId]
			where r.[PolicyExists] = 0 and r.[Age] < 5 and p.[CapCoverLessFive] > 0.0 and p.[BenefitAmount] + r.[CurrentCoverAmount] > p.[CapCoverLessFive]
		
			insert into @errors -- Less than 13 years old
			select @fileIdentifier, 'Cap Cover', CONCAT('Adding ', p.[BenefitAmount], ' to existing cover of ', r.[CurrentCoverAmount], ' will exceed cap cover of ', p.[CapCoverLessThirteen], ' for member ', r.[FirstName], ' ', r.[Surname], ' with ID ', r.[IdNumber], '.')
			from @roleplayers r inner join @policies p on p.[PolicyId] = r.[ParentPolicyId]
			where r.[PolicyExists] = 0 and r.[Age] between 5 and 12 and p.[CapCoverLessThirteen] > 0.0 and p.[BenefitAmount] + r.[CurrentCoverAmount] > p.[CapCoverLessThirteen]
		
			insert into @errors -- 13 years and older
			select @fileIdentifier, 'Cap Cover', CONCAT('Adding ', p.[BenefitAmount], ' to existing cover of ', r.[CurrentCoverAmount], ' will exceed cap cover of ', p.[CapCoverOverThirteen], ' for member ', r.[FirstName], ' ', r.[Surname], ' with ID ', r.[IdNumber], '.')
			from @roleplayers r inner join @policies p on p.[PolicyId] = r.[ParentPolicyId]
			where r.[PolicyExists] = 0 and r.[Age] >= 13 and p.[CapCoverOverThirteen] > 0.0 and p.[BenefitAmount] + r.[CurrentCoverAmount] > p.[CapCoverOverThirteen]

		if (@saveInsuredLives = 1) begin
			-- Update the role player id's of new members
			declare @rolePlayerId int
			select @rolePlayerId = max([RolePlayerId]) from [client].[RolePlayer]
			update rp set
					rp.[RolePlayerId] = t.[RolePlayerId]
				from @roleplayers rp
				inner join (
					select @rolePlayerId + ROW_NUMBER() over (order by [RolePlayerId]) [RolePlayerId],
						[IdTypeId],
						[IdNumber]
					from @roleplayers
					where [RolePlayerExists] = 0
				) t on t.[IdTypeId] = rp.[IdTypeId] and t.[IdNumber] = rp.[IdNumber]
			update [common].[DocumentNumbers] set [NextNumber] = @rolePlayerId where [Name] = 'RolePlayerId'
			-- Insert new RolePlayers
			insert into [client].[RolePlayer] ([RolePlayerId], [DisplayName], [PreferredCommunicationTypeId], [RolePlayerIdentificationTypeId], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select [RolePlayerId], 
					trim(concat([FirstName], ' ', [Surname])), 
					1, 
					1, 
					0, 
					'BackEndProcess', 
					getdate(), 
					'BackEndProcess', 
					getdate()
				from @roleplayers
				where [RolePlayerExists] = 0
			-- Update existing RolePlayers
			update r set
					r.[DisplayName] = trim(concat(rp.[FirstName], ' ', rp.[Surname])),
					r.[RolePlayerIdentificationTypeId] = 1,
					r.[IsDeleted] = 0
				from @roleplayers rp
					inner join [client].[RolePlayer] r on r.[RolePlayerId] = rp.[RolePlayerId]
				where rp.[RolePlayerExists] = 1
			-- Insert new persons
			insert into [client].[Person] ([RolePlayerId], [FirstName], [Surname], [IdTypeId], [IdNumber], [DateOfBirth], [IsAlive], [IsVopdVerified], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
				select [RolePlayerId],
					[FirstName],
					[Surname],
					[IdTypeId],
					[IdNumber],
					ISNULL([DateOfBirth], dbo.GetDOBFromID([IdNumber])),
					1 [IsAlive],
					0 [IsVopdVerified],
					0 [IsDeleted],
					'BackEndProcess' [CreatedBy],
					getdate() [CreatedDate],
					'BackEndProcess' [ModifiedBy],
					getdate() [ModifiedDate]
					from @roleplayers
					where [RolePlayerExists] = 0
					-- Update existing persons
					update p set
					p.[FirstName] = r.[FirstName],
					p.[Surname] = r.[Surname],
					p.[DateOfBirth] = r.[DateOfBirth],
					p.[IsAlive] = 1
				from @roleplayers r
					inner join [client].[Person] p on p.[RolePlayerId] = r.[RolePlayerId]
				where r.[RolePlayerExists] = 1
			-- Update existing persons
			update p set
					p.[FirstName] = r.[FirstName],
					p.[Surname] = r.[Surname],
					p.[DateOfBirth] = r.[DateOfBirth],
					p.[IsAlive] = 1
				from @roleplayers r
					inner join [client].[Person] p on p.[RolePlayerId] = r.[RolePlayerId]
				where r.[RolePlayerExists] = 1
					and r.[IsDeleted] = 0
			-- Update the policy numbers for new policies
			declare @policyId int
			select @policyId = max([PolicyId]) from [policy].[Policy]
			update rp set
				rp.[PolicyId] = t.[PolicyId]
				from @roleplayers rp
				inner join (
					select @policyId + ROW_NUMBER() over (order by [PolicyId]) [PolicyId],
						[IdTypeId],
						[IdNumber]
					from @roleplayers
					where [PolicyExists] = 0
				) t on t.[IdTypeId] = rp.[IdTypeId] and t.[IdNumber] = rp.[IdNumber]
			update [common].[DocumentNumbers] set [NextNumber] = @policyId where [Name] = 'PolicyNumber'
			-- Insert new policies
			declare @date varchar(8)
			set @date = concat(year(getdate()), right(concat('00', month(getdate())), 2)) 
			insert into [policy].[Policy] ([PolicyId], [BrokerageId], [ProductOptionId], [RepresentativeId], [JuristicRepresentativeId], [PolicyOwnerId], [PolicyPayeeId], [PaymentFrequencyId], [PaymentMethodId], [PolicyNumber], [PolicyInceptionDate], [ExpiryDate], [CancellationDate], [FirstInstallmentDate], [LastInstallmentDate], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [PolicyStatusId], [AnnualPremium], [InstallmentPremium], [CommissionPercentage], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [AdminPercentage], [ParentPolicyId])
				select r.[PolicyId],
					parent.[BrokerageId],
					parent.[ProductOptionId],
					parent.[RepresentativeId],
					parent.[JuristicRepresentativeId],
					r.[RolePlayerId] [PolicyOwnerId],
					parent.[PolicyPayeeId],
					parent.[PaymentFrequencyId],
					parent.[PaymentMethodId],
					concat('01-', @date, '-', right(concat('000000', r.[PolicyId]), 6)) [PolicyNumber],
					parent.[PolicyInceptionDate],
					parent.[ExpiryDate],
					parent.[CancellationDate],
					parent.[FirstInstallmentDate],
					parent.[LastInstallmentDate],
					parent.[RegularInstallmentDayOfMonth],
					parent.[DecemberInstallmentDayOfMonth],
					parent.[PolicyStatusId],
					r.[PolicyPremium] * 12.0 [AnnualPremium],
					case parent.[PaymentFrequencyId]
						when 1 then r.[PolicyPremium] * 12.0	-- Annually
						when 3 then r.[PolicyPremium] * 4.0		-- Quarterly
						when 4 then r.[PolicyPremium] * 6.0		-- Bi-Annually
						else r.[PolicyPremium]					-- Monthly
					end [InstallmentPremium],
					parent.[CommissionPercentage],
					parent.[IsDeleted],
					'BackEndProcess' [CreatedBy],
					getdate() [CreatedDate],
					'BackEndProcess' [ModifiedBy],
					getdate() [ModifiedDate],
					isnull(parent.[AdminPercentage], 0.0) [AdminPercentage],
					parent.[PolicyId] [ParentPolicyId]
				from [policy].[Policy] parent
					inner join @policies p on p.[PolicyId] = parent.[PolicyId]
					inner join @roleplayers r on r.[ParentPolicyId] = p.[PolicyId]
				where r.[PolicyExists] = 0
			-- Insert insured lives
			insert into [policy].[PolicyInsuredLives] ([PolicyId], [RolePlayerId], [RolePlayerTypeId], [InsuredLifeStatusId], [StartDate])
				select r.[PolicyId], 
					r.[RolePlayerId], 
					10 [RolePlayerTypeId], 
					1 [InsuredLifeStatusId], 
					cast(concat(year(getdate()),'-',month(getdate()),'-1') as date) [StartDate]
				from @roleplayers r
				where r.[PolicyExists] = 0
			-- Insert roleplayer address lines
			insert into [client].[RolePlayerAddress] ([RolePlayerId], [AddressTypeId], [AddressLine1], [AddressLine2], [PostalCode], [City], [Province], [CountryId], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [EffectiveDate])
			select r.[RolePlayerId],
				a.[AddressTypeId],
				a.[AddressLine1],
				a.[AddressLine2],
				a.[PostalCode],
				a.[City],
				a.[Province],
				a.[CountryId],
				0 [IsDeleted],
				'BackEndProcess' [CreatedBy],
				getdate() [CreatedDate],
				'BackEndProcess' [ModifiedBy],
				getdate() [ModifiedDate],
				a.[EffectiveDate]
			from @policies p
				inner join @roleplayers r on r.[ParentPolicyId] = p.[PolicyId]
				inner join [client].[RolePlayerAddress] a on a.[RolePlayerId] = p.[PolicyOwnerId]
			where r.[PolicyExists] = 0
				and a.[IsDeleted] = 0
			order by r.[RolePlayerId],
				a.[AddressTypeId]
			-- Terminate policies where the member has been removed
			update pil set
					pil.[InsuredLifeStatusId] = 2,
					pil.[EndDate] = cast(getdate() as date)
				from @roleplayers r
					inner join [policy].[PolicyInsuredLives] pil on
						pil.[RolePlayerId] = r.[RolePlayerId] and
						pil.[PolicyId] = r.[PolicyId]
				where r.[IsDeleted] = 1
			-- Pause policies where the client premium is 0
			update pil set
					pil.[InsuredLifeStatusId] = 3
				from @roleplayers r
					inner join [policy].[PolicyInsuredLives] pil on
						pil.[RolePlayerId] = r.[RolePlayerId] and
						pil.[PolicyId] = r.[PolicyId]
				where r.[PolicyExists] = 1
					and r.[ClientPremium] <= 0.0
					and r.[IsDeleted] = 0
			-- Reactivate policies of members that have been added back into the file
			update pil set
				pil.[InsuredLifeStatusId] = 1,
				pil.[EndDate] = null
			from @roleplayers r
				inner join [policy].[PolicyInsuredLives] pil on pil.[PolicyId] = r.[PolicyId] and pil.[RolePlayerId] = r.[RolePlayerId]
			where r.[IsDeleted] = 0
				and pil.[InsuredLifeStatusId] = 2
			-- Insert beneficiaries into roleplayer relations
			insert into [client].[RolePlayerRelation] ([FromRolePlayerId],[ToRolePlayerId],[RolePlayerTypeId],[PolicyId])
				select rp.[RolePlayerId] [FromRolePlayerId],
					rp.[RolePlayerId] [ToRolePlayerId],
					41 [RolePlayerTypeId],
					rp.[PolicyId]
				from @roleplayers rp
					left join [client].[RolePlayerRelation] r on
						r.[FromRolePlayerId] = rp.[RolePlayerId] and
						r.[ToRolePlayerId] = rp.[RolePlayerId] and
						r.[RolePlayerTypeId] = 41 and
						r.[PolicyId] = rp.[PolicyId]
				where r.[Id] is null
			-- Update premiums for the parent policy
			update p set
				p.[AnnualPremium] = t.[Premium] * 12.0,
				p.[InstallmentPremium] = case p.[PaymentFrequencyId]
						when 1 then t.[Premium] * 12.0	-- Annually
						when 3 then t.[Premium] * 4.0	-- Quarterly
						when 4 then t.[Premium] * 6.0	-- Bi-Annually
						else t.[Premium]				-- Monthly
					end
			from [policy].[Policy] p 
			inner join (
				select p.[PolicyId],
					sum(r.[PolicyPremium]) [Premium]
				from @policies p
					inner join @roleplayers r on r.[ParentPolicyId] = p.[PolicyId]
				group by p.[PolicyId]
			) t on t.[PolicyId] = p.[PolicyId]
		end

		
		select @rowcount = count(*) from @errors
		if (@rowcount > 0) 
		begin
			select @severity = ERROR_SEVERITY(), @state = ERROR_STATE();
			raiserror('Import Insured Lives errors', @severity, @state);
		end	
	
		select cast(sum(isnull(case p.[IsDeleted] when 1 then 0 else (case p.[PolicyExists] when 1 then 0 else 1 end) end, 0)) as int) [NewUsers],
			cast(sum(isnull(case p.[IsDeleted] when 1 then 0 else (case p.[PolicyExists] when 1 then 1 else 0 end) end, 0)) as int) [UpdatedUsers],
			sum(cast(p.[IsDeleted] as int)) [DeletedUsers],
			cast(count(*) as int) [TotalUsers],
			cast(sum(isnull(case p.[IsDeleted] when 1 then 0.0 else (case p.[PolicyExists] when 1 then 0 else p.[PolicyPremium] end) end, 0)) as float) [TotalNew],
			cast(sum(isnull(case p.[IsDeleted] when 1 then 0.0 else (case p.[PolicyExists] when 1 then p.[PolicyPremium] else 0 end) end, 0)) as float) [TotalUpdate],
			cast(0 as float) as [TotalDelete],
			cast(sum(case p.[IsDeleted] when 1 then 0.0 else p.[PolicyPremium] end) as float) [Total]
		from @roleplayers p

		commit tran TImport
	end try
	begin catch
		rollback tran TImport

		delete from [policy].[PremiumListingError] where [FileIdentifier] = @fileIdentifier	
		
		insert into [policy].[PremiumListingError] ([FileIdentifier], [ErrorCategory], [ErrorMessage])
			select [FileIdentifier], [ErrorCategory], [ErrorMessage] from @errors
		
		select @message = ERROR_MESSAGE(), @severity = ERROR_SEVERITY(), @state = ERROR_STATE();
		raiserror(@message, @severity, @state);
	end catch
end
