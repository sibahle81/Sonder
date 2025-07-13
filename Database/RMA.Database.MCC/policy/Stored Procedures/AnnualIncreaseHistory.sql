
CREATE   PROCEDURE [policy].[AnnualIncreaseHistory] @startDate date, @endDate date
AS BEGIN

	declare @end datetime = dateadd(second, -1, dateadd(day, 1, cast(@endDate as datetime)))

	update ai set
		ai.NotificationSendDate = sa.CreatedDate
	from policy.AnnualIncrease ai
		inner join campaign.SmsAudit sa on 
			sa.ItemType = 'Policy' and
			sa.ItemId = ai.PolicyId and
			sa.CreatedDate between ai.CreatedDate and dateadd(month, 3, ai.CreatedDate) and
			sa.[Message] like '%Your new policy premium%'
	where ai.EffectiveDate = @startDate
	  and ai.NotificationSendDate is null

	update ai set
		ai.NotificationSendDate = ea.CreatedDate
	from policy.AnnualIncrease ai
		inner join campaign.EmailAudit ea on 
			ea.ItemType = 'Policy' and
			ea.ItemId = ai.PolicyId and
			ea.CreatedDate between ai.CreatedDate and dateadd(month, 3, ai.CreatedDate) and
			ea.[Subject] like '%Annual Increase%'
	where ai.EffectiveDate = @startDate
	  and ai.NotificationSendDate is null

	select p.PolicyId,
		p.PolicyNumber,
		cast(p.PolicyInceptionDate as date) [InceptionDate],
		ps.[Name] [PolicyStatus],
		it.[Name] [AnnualIncreaseType],
		upper(concat(per.FirstName, ' ', per.Surname)) [MemberName],
		case len(per.IdNumber) when 13 then per.IdNumber else cast(per.DateOfBirth as varchar(16)) end [IdNumber],
		per.DateOfBirth,
		client.CalculateAge(per.DateOfBirth) [MemberAge],
		pis.[Name] [IncreaseStatus],
		cast(ai.EffectiveDate as date) [IncreaseEffectiveDate],
		ai.NotificationSendDate,
		ai.PremiumBefore,
		ai.PremiumAfter,
		cast(t.VapsPremium as money) [VapsPremium],
		ai.CoverAmountBefore,
		ai.CoverAmountAfter,
		ai.IncreaseFailedReason
	from policy.Policy p with (nolock)
		inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
		inner join policy.AnnualIncrease ai with (nolock) on ai.PolicyId = p.PolicyId
		inner join common.PolicyIncreaseStatus pis with (nolock) on pis.Id = ai.PolicyIncreaseStatusId
		inner join policy.PolicyLifeExtension le with (nolock) on le.PolicyId = p.PolicyId
		inner join common.AnnualIncreaseType it with (nolock) on it.Id = le.AnnualIncreaseTypeId
		inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
		inner join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
		inner join (
			select ProductOptionId,
				sum(BaseRate) [VapsPremium]
			from product.CurrentBenefitRate
			where ProductOptionId in (132, 133)
			  and BenefitTypeId = 2
			group by ProductOptionId
		) t on t.ProductOptionId = p.ProductOptionId
	where ai.EffectiveDate = @startDate
	  and pil.RolePlayerTypeId = 10
	  and pil.InsuredLifeStatusId = 1
	order by p.PolicyNumber,
		pil.RolePlayerTypeId

END