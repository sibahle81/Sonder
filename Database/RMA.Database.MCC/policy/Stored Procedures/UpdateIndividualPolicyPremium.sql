CREATE PROCEDURE [policy].[UpdateIndividualPolicyPremium] (@policyId int, @userId varchar(64))
as begin

	set nocount on

	declare @policy table (
		PolicyId int primary key,
		Rounding int,
		Premium money,
		Multiplier int,
		InstallmentPremium money,
		AnnualPremium money,
		PayPremium bit
	)

	insert @policy
		select p.PolicyId,
			2 [Rounding],
				-- Base rate
				policy.CalculateGroupSchemePolicyPremium(sum(br.BaseRate), p.AdminPercentage, p.CommissionPercentage, p.BinderFeePercentage, p.PremiumAdjustmentPercentage) 
				-- Vaps
				+ isnull(sum(vaps.BaseRate), 0.00)
				-- EuropAssist fee
				+ (isnull(ea.BasePremium + ea.ProfitExpenseLoadingPremium, 0.00) / (1 - p.CommissionPercentage)) [Premium],
			case p.PaymentFrequencyId 
				when 1 then 12
				when 2 then 1
				when 3 then 3
				when 4 then 6
			end [Multiplier],
			0 [InstallmentPremium],
			0 [AnnualPremium],
			isnull(pam.DoRaiseInstallementPremiums, 0) [PayPremium]
		from policy.Policy p (nolock)
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
			inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
			left join common.EuropAssistPremiumMatrix ea (nolock) on p.IsEuropAssist = 1 and p.EuropAssistEffectiveDate >= ea.StartDate and isnull(p.EuropAssistEndDate, '3000-01-01') <= isnull(ea.EndDate, '3000-01-01')
			left join policy.PolicyStatusActionsMatrix pam (nolock) on pam.PolicyStatus = p.PolicyStatusId
			left join product.CurrentBenefitRate vaps (nolock) on vaps.ProductOptionId = p.ProductOptionId and vaps.BenefitTypeId = 2 and pil.RolePlayerTypeId = 10
		where p.PolicyId = @policyId
		  and p.IsDeleted = 0
		  and pil.IsDeleted = 0
		  and pil.InsuredLifeStatusId = 1
		group by p.PolicyId,
			p.PolicyInceptionDate,
			p.AdminPercentage, 
			p.CommissionPercentage, 
			p.BinderFeePercentage, 
			p.PremiumAdjustmentPercentage,
			p.PaymentFrequencyId,
			ea.BasePremium,
			ea.ProfitExpenseLoadingPremium,
			pam.DoRaiseInstallementPremiums

	update @policy set
		InstallmentPremium = round(Premium, Rounding) * Multiplier,
		AnnualPremium = round(Premium, Rounding) * 12.0

	update p set
		p.AnnualPremium = isnull(x.AnnualPremium, 0.00),
		p.InstallmentPremium = isnull(x.InstallmentPremium, 0.00),
		p.ModifiedBy = @userId,
		p.ModifiedDate = getdate()
	from @policy x
		inner join policy.Policy p on p.PolicyId = x.PolicyId

END
