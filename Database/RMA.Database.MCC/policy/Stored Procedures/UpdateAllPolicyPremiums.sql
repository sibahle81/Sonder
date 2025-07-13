CREATE PROCEDURE [policy].[UpdateAllPolicyPremiums]
as begin

	begin tran trxUpdateAllPremiums 

	begin try
		-- Update the child policies' admin and commission percentages
		update c set
			c.[AdminPercentage] = p.[AdminPercentage],
			c.[CommissionPercentage] = p.[CommissionPercentage],
			c.[BinderFeePercentage] = p.[BinderFeePercentage],
			c.[PaymentFrequencyId] = p.[PaymentFrequencyId]
		from [policy].[Policy] p
			inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]

		declare @insured_life table (
			ParentPolicyId int,
			PolicyId int,
			IsGroupPolicy bit,
			RolePlayerId int,
			RolePlayerTypeId int,
			BenefitId int,
			Rate decimal(18, 10),
			primary key (ParentPolicyId, PolicyId, RolePlayerId)
		)

		insert into @insured_life
			select isnull(p.ParentPolicyId, 0),
				p.PolicyId,
				iif(isnull(c.RolePlayerId, 0) > 0, 1, 0),
				pil.RolePlayerId,
				pil.RolePlayerTypeId,
				isnull(t.BenefitId, 0),
				isnull(t.BaseRate, 0)
			from [policy].[Policy] p with (nolock)
				inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
				inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
				left join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
				left join client.Company c with (nolock) on c.RolePlayerId = p.PolicyOwnerId
				left join (
					select BenefitId, BaseRate, Rank() over (partition by BenefitId order by EffectiveDate desc) [Rank]
					from product.BenefitRate with (nolock)
				) t on t.BenefitId = pil.StatedBenefitId
			where pil.InsuredLifeStatusId = 1
			  and rp.IsDeleted = 0
			  and isnull(per.IsDeleted, rp.IsDeleted) = 0
			  and t.[Rank] = 1

		declare @policy table (
			PolicyId int primary key not null,
			ParentPolicyId int,
			IsGroupPolicy bit,
			PaymentFrequencyId int,
			Multiplier decimal(6,1),
			AdminFeePercentage decimal(6, 4),
			CommissionPercentage decimal(6, 4),
			BinderFeePercentage decimal(6, 4),
			BaseRate decimal(18, 10),
			MonthlyPremium money
		)

		insert into @policy
			select p.PolicyId,
				i.ParentPolicyId,
				i.IsGroupPolicy,
				p.PaymentFrequencyId,
				case p.PaymentFrequencyId 
					when 1 then 12
					when 2 then 1
					when 3 then 3
					when 4 then 6
				end,
				p.AdminPercentage,
				p.CommissionPercentage,
				p.BinderFeePercentage,
				sum(i.Rate),
				0
			from policy.Policy p with (nolock)
				inner join @insured_life i on i.PolicyId = p.PolicyId
			where p.PolicyStatusId <> 2
			group by p.PolicyId,
				i.ParentPolicyId,
				i.IsGroupPolicy,
				p.PaymentFrequencyId,
				p.AdminPercentage,
				p.CommissionPercentage,
				p.BinderFeePercentage

		update @policy set MonthlyPremium = round(policy.CalculateGroupPolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage), 2) 
			where IsGroupPolicy = 0 and ParentPolicyId > 0
		update @policy set MonthlyPremium = round(policy.CalculateIndividualPolicyPremium(BaseRate, AdminFeePercentage, CommissionPercentage, BinderFeePercentage), 2) 
			where IsGroupPolicy = 0 and ParentPolicyId = 0
	
		-- Update individual and child policy premiums
		update p set
			p.AnnualPremium = cast(t.MonthlyPremium * 12.0 as money),
			p.InstallmentPremium = cast(t.MonthlyPremium * Multiplier as money)
		from policy.Policy p
			inner join @policy t on t.PolicyId = p.PolicyId
		where IsGroupPolicy = 0
		  and (cast(p.AnnualPremium as money) <> cast(t.MonthlyPremium * 12.0 as money)
		   or (cast(p.InstallmentPremium as money) <> cast(t.MonthlyPremium * Multiplier as money)))

		-- Update group policy premiums
		update p set
			p.InstallmentPremium = t.InstallmentPremium,
			p.AnnualPremium = t.AnnualPremium
		from policy.Policy p
			inner join (
				select ParentPolicyId [PolicyId],
					cast(sum(MonthlyPremium * 12.0) as money) [AnnualPremium],
					cast(sum(MonthlyPremium * Multiplier) as money) [InstallmentPremium]
				from @policy
				where ParentPolicyId > 0
				  and IsGroupPolicy = 0
				group by ParentPolicyId
			) t on t.PolicyId = p.PolicyId
		where cast(p.AnnualPremium as money) <> t.AnnualPremium
		   or cast(p.InstallmentPremium as money) <> t.InstallmentPremium

		commit tran trxUpdateAllPremiums 

	end try
	begin catch
		rollback tran trxUpdateAllPremiums
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

end