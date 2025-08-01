CREATE PROCEDURE [policy].[GetGroupMemberDetails] @policyId int
AS BEGIN

	declare @roundingCutoffDate date
	select @roundingCutoffDate = cast([Value] as date) from common.Settings where [Key] = 'GroupRoundingCutoffDate'

	declare @policy table (
		PolicyId int primary key,
		ParentPolicyId int index tidx_001 clustered,
		PolicyNumber varchar(36),
		ProductOptionId int index tidx_002 nonclustered,
		SchemeInceptionDate date,
		PolicyInceptionDate date,
		IsGroupScheme bit,
		Rounding int,
		IsEuropAssist bit,
		AdminPercentage decimal(6, 4),
		CommissionPercentage decimal(6, 4),
		BinderFeePercentage decimal(6, 4),
		PremiumAdjustmentPercentage decimal(6, 4),
		WaitingPeriod int
	)

	-- Get group scheme policies
	insert into @policy
		select c.PolicyId,
			c.ParentPolicyId,
			c.PolicyNumber,
			c.ProductOptionId,
			p.PolicyInceptionDate [SchemeInceptionDate],
			c.PolicyInceptionDate [PolicyInceptionDate],
			1 [IsGroupScheme],
			iif(p.PolicyInceptionDate <= @roundingCutoffDate, iif(ex.PolicyId is null, 0, 2), 2) [Rounding],
			p.IsEuropAssist,
			p.AdminPercentage,
			p.CommissionPercentage,
			p.BinderFeePercentage,
			p.PremiumAdjustmentPercentage,
			isnull(json_value(por.RuleConfiguration, '$[0].fieldValue'), 0)
		from policy.Policy p (nolock)
			inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId
			inner join policy.Policy c (nolock) on c.ParentPolicyId = p.PolicyId
			left join policy.GroupSchemePremiumRoundingExclusion ex (nolock) on ex.PolicyId = p.PolicyId
			left join product.ProductOptionRule por (nolock) on por.ProductOptionId = p.ProductOptionId and por.RuleId = 5 and por.IsDeleted = 0
		where @policyId in (c.ParentPolicyId, c.PolicyId)
			and c.PolicyStatusId not in (2, 4, 5, 7, 13)
			and c.IsDeleted = 0
		order by c.PolicyId

	-- Get individual funeral policies
	insert into @policy
		select p.PolicyId,
			p.ParentPolicyId,
			p.PolicyNumber,
			p.ProductOptionId,
			p.PolicyInceptionDate,
			p.PolicyInceptionDate,
			0 [IsGroupScheme],
			2 [Rounding],
			p.IsEuropAssist,
			p.AdminPercentage,
			p.CommissionPercentage,
			p.BinderFeePercentage,
			p.PremiumAdjustmentPercentage,
			isnull(json_value(por.RuleConfiguration, '$[0].fieldValue'), 0)
		from policy.Policy p (nolock)
			left join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId
			left join product.ProductOptionRule por (nolock) on por.ProductOptionId = p.ProductOptionId and por.RuleId = 5 and por.IsDeleted = 0
		where p.PolicyId = @policyId
		  and p.ParentPolicyId is null
		  and p.PolicyStatusId not in (2, 4, 5, 7, 13)
		  and p.IsDeleted = 0
		  and co.RolePlayerId is null

	declare @member table (
		PolicyId int,
		RolePlayerId int,
		primary key (PolicyId, RolePlayerId)
	)

	select x.PolicyNumber,
		upper(concat(per.FirstName, ' ', per.Surname)) [MemberName],
		iif(patindex('%[^a-zA-Z0-9]%', per.IdNumber) = 0, per.IdNumber, format(per.DateOfBirth, 'yyyy-MM-dd')) [IdNumber],
		per.DateOfBirth,
		cast(pil.StartDate as date) [StartDate],
		round([policy].[CalculateFuneralPolicyPremium](br.[BaseRate] * (1 + x.PremiumAdjustmentPercentage), x.[AdminPercentage], x.[CommissionPercentage], x.[BinderFeePercentage]), x.Rounding) [MemberRate],
		br.BenefitAmount,
		cast(dateadd(month, x.WaitingPeriod, pil.StartDate) as date) [WaitingPeriodEnd],
		dateadd(month, x.WaitingPeriod, cp.[EffectiveDate]) [UpgradeDowngradeWaitingPeriodEnd],
		cp.EffectiveDate,
		x.IsEuropAssist
	from @policy x
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = x.PolicyId
		inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
		inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = x.ProductOptionId and br.BenefitId = pil.StatedBenefitId
		left join policy.PolicyChangeProduct cp (nolock) on cp.PolicyId = x.ParentPolicyId and cp.PolicyChangeStatusId = 1
	where pil.InsuredLifeStatusId = 1
	order by x.PolicyId,
		br.CoverMemberTypeId,
		[MemberName]
END
