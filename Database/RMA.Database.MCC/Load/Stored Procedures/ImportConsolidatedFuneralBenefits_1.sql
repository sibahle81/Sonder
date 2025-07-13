
CREATE   PROCEDURE [Load].[ImportConsolidatedFuneralBenefits] @fileIdentifier uniqueidentifier
AS BEGIN

	--declare @fileIdentifier uniqueidentifier = '0CB4A513-7EFF-4B0A-B257-A7147EBAFB01'

	delete from [Load].[ConsolidatedFuneralBenefit] where [FileIdentifier] = @fileIdentifier

	insert into [Load].[ConsolidatedFuneralBenefit] ([FileIdentifier], [ProductOptionName], [BenefitName])
		select distinct @fileIdentifier [FileIdentifier],
			[ProductOption],
			[BenefitName]
		from [Load].[ConsolidatedFuneral] 
		where [FileIdentifier] = @fileIdentifier
		  and isnull([BenefitName], '') <> ''
		  and isnull([ProductOption], '') <> ''

	update cfb set
		cfb.ProductOptionId = po.Id
	from [Load].[ConsolidatedFuneralBenefit] cfb
		inner join [product].[ProductOption] po on po.[Name] = cfb.[ProductOptionName]
	where cfb.[FileIdentifier] = @fileIdentifier

	update cfb set
		cfb.BenefitId = b.Id,
		cfb.CoverMemberTypeId = b.CoverMemberTypeId
	from [Load].[ConsolidatedFuneralBenefit] cfb
		inner join [product].[Benefit] b on b.[Name] = cfb.[BenefitName]
	where cfb.[FileIdentifier] = @fileIdentifier

	-- Get maximum number of people per benefit
	update b set 
		b.[MaxPersonsPerBenefit] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b   
		inner join [product].[BenefitRule] r   on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 10
	-- Get maximum entry age per benfit
	update b set 
		b.[MaxEntryAge] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b    
		inner join [product].[BenefitRule] r    on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 11
	-- Get minimum entry age per benefit
	update b set 
		b.[MinEntryAge] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b    
		inner join [product].[BenefitRule] r   on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 12
	-- Max number of spouses per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 2
		and r.[RuleId] = 37
	-- Max number of children per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 3
		and r.[RuleId] = 38
	-- Max number of extended family members per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 4
		and r.[RuleId] = 39
	-- Update cap cover for children under 5
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 2
	  and charindex(replace(b.[BenefitName], ' ', ''), '-5)') > 1
	-- Update cap cover for children under 13
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 3
	  and charindex(replace(b.[BenefitName], ' ', ''), '-13)') > 1
	-- Update cap cover for children under 21
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 4
	  and charindex(replace(b.[BenefitName], ' ', ''), '-21)') > 1
	-- Update cap cover for adult members
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[ConsolidatedFuneralBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] != 3
	  and r.[RuleId] = 42
END