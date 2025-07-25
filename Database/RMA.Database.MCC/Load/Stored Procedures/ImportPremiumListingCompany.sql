CREATE PROCEDURE [Load].[ImportPremiumListingCompany] (@fileIdentifier uniqueidentifier, @userId varchar(64))
as begin

	--declare @fileIdentifier uniqueidentifier = '04D23434-34E0-4C15-98E3-18A4F3EAA1AC'
	--declare @userId varchar(128) = 'ccilliers@randmutual.co.za'

	set nocount on

	-- Add the company
	insert into [Load].[PremiumListingCompany]
		select @fileIdentifier [FileIdentifier],
				p.[PolicyId],
				p.[PolicyNumber],
				c.[RolePlayerId],
				c.[Name] [Company],
				p.[ProductOptionId],
				p.[PolicyInceptionDate],
				p.[CommissionPercentage],
				p.[AdminPercentage],
				p.[BinderFeePercentage],
				p.[PremiumAdjustmentPercentage],
				p.[PaymentFrequencyId],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate],
				p.[IsEuropAssist]
		from [Load].[PremiumListing] pl with (nolock)
			inner join [client].[Company] c with (nolock) on c.[Name] = pl.[Company]
			inner join [policy].[Policy] p with (nolock) on 
				p.[PolicyNumber] = pl.[PolicyNumber] and
				p.[PolicyOwnerId] = c.[RolePlayerId]
		where pl.[FileIdentifier] = @fileIdentifier
		group by p.[PolicyId],
				p.[PolicyNumber],
				c.[RolePlayerId],
				c.[Name],
				p.[ProductOptionId],
				p.[PolicyInceptionDate],
				p.[CommissionPercentage],
				p.[AdminPercentage],
				p.[BinderFeePercentage],
				p.PremiumAdjustmentPercentage,
				p.[PaymentFrequencyId],
				p.[IsEuropAssist]
	
	declare @isEuropAssist bit
	declare @productOptionId int
	select @productOptionId = ProductOptionid, @isEuropAssist = IsEuropAssist from [Load].[PremiumListingCompany] with (nolock) where [FileIdentifier] = @fileIdentifier

	-- Fix benefit names
	update [Load].[PremiumListing] set [BenefitName] = replace([BenefitName], '@ ', '@') where FileIdentifier = @fileIdentifier and [BenefitName] like '%@ %'

	-- Add the benefits for the company's selected product option
	insert into [Load].[PremiumListingBenefit]
		select co.FileIdentifier [FileIdentifier],
			br.[ProductOptionId],
			br.[BenefitId],
			trim(replace(br.[BenefitName], '  ', ' ')) [BenefitName],
			br.[CoverMemberTypeId],
			br.[BaseRate] [BenefitRate],
			br.[BenefitAmount],
			200 [MaxPersonsPerProductOption],
			200 [MaxPersonsPerBenefit],
			br.[MinimumAge] [MinEntryAge],
			br.[MaximumAge] [MaxEntryAge],
			9999999.0 [CapCover],
			iif(br.[CoverMemberTypeId] = 1 and co.[IsEuropAssist] = 1, [policy].[GetEuropAssistFee](co.[CommissionPercentage]), 0.0),
			br.[BenefitTypeId]
		from [Load].[PremiumListingCompany] co (nolock)
			inner join [product].[CurrentBenefitRate] (nolock) br on br.ProductOptionId = co.ProductOptionId
		where co.[FileIdentifier] = @fileIdentifier

	-- Get the default maximum cap cover
	declare @amount money
	select @amount = try_cast([Value] as money) from common.Settings where [Key] = 'MaxBenefitCover'

	if (@amount is not null) begin
		update [Load].[PremiumListingBenefit] set
			[CapCover] = @amount
		where [FileIdentifier] = @fileIdentifier
	end

	-- Allow age next birthday for benefits
	update [Load].[PremiumListingBenefit] set
		[MinEntryAge] = [MinEntryAge] - 1
	where [FileIdentifier] = @fileIdentifier
	  and [MinEntryAge] > 0

	-- Get maximum number of people per benefit
	update b set 
		b.[MaxPersonsPerBenefit] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[BenefitRule] r with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 10

	-- Max number of spouses per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOptionRule] r with (nolock) on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 2
		and r.[RuleId] = 37
	-- Max number of children per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOptionRule] r with (nolock) on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 3
		and r.[RuleId] = 38
	-- Max number of extended family members per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOptionRule] r with (nolock) on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 4
		and r.[RuleId] = 39

	-- Update cap cover for children under 5
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 2
	  and charindex(replace(b.[BenefitName], ' ', ''), '-5)') > 1
	-- Update cap cover for children under 13
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 3
	  and charindex(replace(b.[BenefitName], ' ', ''), '-13)') > 1
	-- Update cap cover for children under 21
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 4
	  and charindex(replace(b.[BenefitName], ' ', ''), '-21)') > 1
	-- Update cap cover for adult members
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] != 3
	  and r.[RuleId] = 42

	set nocount off

end
