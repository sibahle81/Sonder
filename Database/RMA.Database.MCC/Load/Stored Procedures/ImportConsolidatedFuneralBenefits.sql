CREATE PROCEDURE [Load].[ImportConsolidatedFuneralBenefits] @fileIdentifier uniqueidentifier
AS BEGIN

	--declare @fileIdentifier uniqueidentifier = '0CB4A513-7EFF-4B0A-B257-A7147EBAFB01'

	set nocount on 

	-- do not continue if the wizard has already been processed
	if Load.ConsolidatedFuneralPolicyCreated(@fileIdentifier) = 0 begin

		delete from [Load].[ConsolidatedFuneralBenefit] where [FileIdentifier] = @fileIdentifier

		insert into [Load].[ConsolidatedFuneralBenefit] ([FileIdentifier], [ProductOptionId], [ProductOptionName], [BenefitId], [BenefitName], [CoverMemberTypeId], [MinEntryAge], [MaxEntryAge])
			select distinct @fileIdentifier [FileIdentifier],
				br.[ProductOptionId],
				br.[ProductOptionName] [ProductOption],
				br.[BenefitId],
				br.[BenefitName],
				br.[CoverMemberTypeId],
				br.[MinimumAge] [MinEntryAge],
				br.[MaximumAge] [MaxEntryAge]
			from [Load].[ConsolidatedFuneral] f with (nolock)
				inner join [product].[CurrentBenefitRate] br (nolock) on br.ProductOptionName = f.[ProductOption] and br.[BenefitName] = f.[BenefitName]
			where f.[FileIdentifier] = @fileIdentifier
			  and isnull(f.[BenefitName], '') <> ''
			  and isnull(f.[ProductOption], '') <> ''

		-- Update the default cap cover
		declare @amount money
		select @amount = try_cast([Value] as money) from common.Settings where [Key] = 'MaxBenefitCover'

		if (@amount is not null) begin
			update [Load].[ConsolidatedFuneralBenefit] set
				CapCover = @amount
			where [FileIdentifier] = @fileIdentifier
		end

		-- Allow age next birthday for benefits
		update [Load].[ConsolidatedFuneralBenefit] set
			[MinEntryAge] = [MinEntryAge] - 1
		where [FileIdentifier] = @fileIdentifier
		  and [MinEntryAge] > 0

		-- Get maximum number of people per benefit
		update b set
			b.[MaxPersonsPerBenefit] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[BenefitRule] r with (nolock) on r.[BenefitId] = b.[Benefitid]
		where b.[FileIdentifier] = @fileIdentifier
		  and r.[RuleId] = 10
		-- Max number of spouses per product option
		update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOptionRule] r with (nolock) on r.[ProductOptionId] = b.[ProductOptionId]
		where b.[FileIdentifier] = @fileIdentifier
			and b.[CoverMemberTypeId] = 2
			and r.[RuleId] = 37
		-- Max number of children per product option
		update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOptionRule] r with (nolock) on r.[ProductOptionId] = b.[ProductOptionId]
		where b.[FileIdentifier] = @fileIdentifier
			and b.[CoverMemberTypeId] = 3
			and r.[RuleId] = 38
		-- Max number of extended family members per product option
		update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOptionRule] r with (nolock) on r.[ProductOptionId] = b.[ProductOptionId]
		where b.[FileIdentifier] = @fileIdentifier
			and b.[CoverMemberTypeId] = 4
			and r.[RuleId] = 39
		-- Update cap cover for children under 5
		update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
			inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
		where b.[FileIdentifier] = @fileIdentifier
		  and b.[CoverMemberTypeId] = 3
		  and r.[RuleId] = 2
		  and charindex(replace(b.[BenefitName], ' ', ''), '-5)') > 1
		-- Update cap cover for children under 13
		update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
			inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
		where b.[FileIdentifier] = @fileIdentifier
		  and b.[CoverMemberTypeId] = 3
		  and r.[RuleId] = 3
		  and charindex(replace(b.[BenefitName], ' ', ''), '-13)') > 1
		-- Update cap cover for children under 21
		update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
			inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
		where b.[FileIdentifier] = @fileIdentifier
		  and b.[CoverMemberTypeId] = 3
		  and r.[RuleId] = 4
		  and charindex(replace(b.[BenefitName], ' ', ''), '-21)') > 1
		-- Update cap cover for adult members
		update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
		from [Load].[ConsolidatedFuneralBenefit] b with (nolock)
			inner join [product].[ProductOption] po with (nolock) on po.[Id] = b.[ProductOptionId]
			inner join [product].[ProductRule] r with (nolock) on r.[ProductId] = po.[ProductId]
		where b.[FileIdentifier] = @fileIdentifier
		  and b.[CoverMemberTypeId] != 3
		  and r.[RuleId] = 42
	end

END
