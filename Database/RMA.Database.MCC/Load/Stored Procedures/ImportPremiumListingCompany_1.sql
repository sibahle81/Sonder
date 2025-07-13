CREATE   PROCEDURE [Load].[ImportPremiumListingCompany] (@fileIdentifier uniqueidentifier, @userId varchar(64))
as begin

	--declare @fileIdentifier uniqueidentifier = '04D23434-34E0-4C15-98E3-18A4F3EAA1AC'
	--declare @userId varchar(128) = 'ccilliers@randmutual.co.za'

	set nocount on

	-- Add the company
	insert into [Load].[PremiumListingMessage] values (@fileIdentifier, 'Loading parent policy details...');
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
	update [Load].[PremiumListingMessage] set [Message] = 'Loading policy benefit details...' where [FileIdentifier] = @fileIdentifier
	insert into [Load].[PremiumListingBenefit]
	select t.[FileIdentifier],
			t.[ProductOptionId],
			t.[BenefitId],
			trim(replace(t.[BenefitName], '  ', ' ')) [BenefitName],
			t.[CoverMemberTypeId],
			t.[BenefitRate],
			t.[BenefitAmount],
			200 [MaxPersonsPerProductOption],
			200 [MaxPersonsPerBenefit],
			0 [MinEntryAge],
			200 [MaxEntryAge],
			9999999.0 [CapCover],
			iif(t.[CoverMemberTypeId] = 1 and t.[IsEuropAssist] = 1, [policy].[GetEuropAssistFee](t.[CommissionPercentage]), 0.0),
			t.[BenefitTypeId]
	from (
		select c.[FileIdentifier],
				c.[ProductOptionId],	
				b.[Id] [BenefitId],
				trim(replace(b.[Name], '  ', ' ')) [BenefitName],
				b.[CoverMemberTypeId],
				b.[BenefitTypeId],
				br.[BaseRate] [BenefitRate],
				br.[BenefitAmount],
				c.[IsEuropAssist],
				c.[CommissionPercentage],
				rank() over (partition by br.[BenefitId] order by br.[EffectiveDate] desc) [Rank]
		from [Load].[PremiumListingCompany] c with (nolock)
			inner join [product].[ProductOptionBenefit] pb with (nolock) on pb.[ProductOptionId] = c.[ProductOptionId]
			inner join [product].[Benefit] b with (nolock) on b.[Id] = pb.[BenefitId]
			inner join [product].[BenefitRate] br with (nolock) on br.[BenefitId] = b.[Id]
		where c.[FileIdentifier] = @fileIdentifier
		    and br.[IsDeleted] = 0
			and b.[IsDeleted] = 0
	) t
	where t.[Rank] = 1
	order by t.[CoverMemberTypeId], t.[BenefitName]

	-- Get maximum number of people per benefit
	update b set 
		b.[MaxPersonsPerBenefit] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b with (nolock)
		inner join [product].[BenefitRule] r with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 10

	-- Get maximum entry age per benfit
	update b set 
		b.[MaxEntryAge] = json_value(r.[RuleConfiguration], '$[0].fieldValue') 
	from [Load].[PremiumListingBenefit] b  with (nolock)
		inner join [product].[BenefitRule] r  with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 11
	-- Get minimum entry age per benefit
	update b set 
		b.[MinEntryAge] = cast(json_value(r.[RuleConfiguration], '$[0].fieldValue') as int) - 1
	from [Load].[PremiumListingBenefit] b  with (nolock)
		inner join [product].[BenefitRule] r with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 12

	-- Max number of spouses per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 2
		and r.[RuleId] = 37
	-- Max number of children per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 3
		and r.[RuleId] = 38
	-- Max number of extended family members per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 4
		and r.[RuleId] = 39

	-- Update cap cover for children under 5
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 2
	  and charindex(replace(b.[BenefitName], ' ', ''), '-5)') > 1
	-- Update cap cover for children under 13
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 3
	  and charindex(replace(b.[BenefitName], ' ', ''), '-13)') > 1
	-- Update cap cover for children under 21
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 4
	  and charindex(replace(b.[BenefitName], ' ', ''), '-21)') > 1
	-- Update cap cover for adult members
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[PremiumListingBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] != 3
	  and r.[RuleId] = 42

	set nocount off

end
