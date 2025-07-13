

CREATE   VIEW [product].[CurrentBenefitRate] 
as 
	select p.Id [ProductId],
		p.Name [ProductName],
		pob.ProductOptionId,
		po.Name [ProductOptionName],
		po.Code [ProductOptionCode],
		b.Id [BenefitId],
		b.Code [BenefitCode],
		b.Name [BenefitName],
		b.CoverMemberTypeId,
		b.BenefitTypeId,
		cast(isnull(json_value([minAge].[RuleConfiguration], '$[0].fieldValue'), 0) as int) [MinimumAge],
		cast(isnull(json_value([maxAge].[RuleConfiguration], '$[0].fieldValue'), 999) as int) [MaximumAge],
		isnull(t.BaseRate, 0.00) [BaseRate],
		isnull(t.BenefitAmount, 0.00) [BenefitAmount]
	from product.Product p (nolock)
		inner join product.ProductOption po with (nolock) on po.ProductId = p.Id
		inner join product.ProductOptionBenefit pob with (nolock) on pob.ProductOptionId = po.Id
	    inner join product.Benefit b with (nolock) on b.[Id] = pob.[BenefitId]
		left join(
			select BenefitId,
			BaseRate,
			BenefitAmount,
			Rank() over (partition by BenefitId order by EffectiveDate desc) [Rank]
			from product.BenefitRate with (nolock)
			where EffectiveDate <= getdate()
			and IsDeleted = 0
		) t on t.BenefitId = b.Id and t.[Rank] = 1
		left join product.BenefitRule [minAge] with (nolock) on [minAge].[BenefitId] = b.[Id] and [minAge].[RuleId] = 12 and [minAge].[IsDeleted] = 0
		left join product.BenefitRule [maxAge] with (nolock) on [maxAge].[BenefitId] = b.[Id] and [maxAge].[RuleId] = 11 and [maxAge].[IsDeleted] = 0
	where p.IsDeleted = 0
	  and po.IsDeleted = 0
	  and b.IsDeleted = 0