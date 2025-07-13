CREATE VIEW [product].[CurrentBenefitRate] 
as 
	select pob.ProductOptionId,
		po.Name [ProductOptionName],
		t.BenefitId,
		b.Name [BenefitName],
		b.Code [BenefitCode],
		b.CoverMemberTypeId,
		b.BenefitTypeId,
		cast(isnull(json_value([minAge].[RuleConfiguration], '$[0].fieldValue'), 0) as int) [MinimumAge],
		cast(isnull(json_value([maxAge].[RuleConfiguration], '$[0].fieldValue'), 999) as int) [MaximumAge],
		t.BaseRate,
		t.BenefitAmount
	from product.ProductOption po with (nolock)
		inner join product.ProductOptionBenefit pob with (nolock) on pob.ProductOptionId = po.Id
	    inner join product.Benefit b with (nolock) on b.[Id] = pob.[BenefitId]
		inner join(
			select BenefitId,
			BaseRate,
			BenefitAmount,
			Rank() over (partition by BenefitId order by EffectiveDate desc) [Rank]
			from product.BenefitRate with (nolock)
			where EffectiveDate <= getdate()
			and IsDeleted = 0
		) t on t.BenefitId = b.Id
		left join product.BenefitRule [minAge] with (nolock) on [minAge].[BenefitId] = b.[Id] and [minAge].[RuleId] = 12
		left join product.BenefitRule [maxAge] with (nolock) on [maxAge].[BenefitId] = b.[Id] and [maxAge].[RuleId] = 11
	where b.IsDeleted = 0
	  and t.[Rank] = 1

GO


