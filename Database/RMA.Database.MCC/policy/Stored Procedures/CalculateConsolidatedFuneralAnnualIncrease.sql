CREATE PROCEDURE [policy].[CalculateConsolidatedFuneralAnnualIncrease]
	@currentPolicyIncreaseStatusId int,
	@nextPolicyIncreaseStatusId int,
	@userId varchar(128)
AS BEGIN

	set nocount on

	declare @policy table (
		PolicyId int primary key,
		EffectiveDate date,
		AnnualIncreaseTypeId int,
		VapsPremium money,
		CurrentPremium money,
		CurrentCoverAmount money,
		NewPremium money,
		NewCoverAmount money,
		PolicyOwnerId int,
		MainMemberAge int
	)

	declare @members table (
		PolicyId int,
		RolePlayerId int,
		RolePlayerTypeId int,
		Premium money,
		CoverAmount money,
		NewPremium money,
		NewCoverAmount money,
		MemberAge int
	)

	insert into @policy (PolicyId, EffectiveDate, AnnualIncreaseTypeId, CurrentPremium, CurrentCoverAmount, VapsPremium, PolicyOwnerId, MainMemberAge)
		select p.PolicyId,
			ai.EffectiveDate,
			le.AnnualIncreaseTypeId,
			p.InstallmentPremium,
			pil.CoverAmount,
			sum(br.BaseRate) [VapsPremium],
			p.PolicyOwnerId,
			client.CalculateAge(per.DateOfBirth) [MainMemberAge]
		from policy.Policy p (nolock)
			inner join policy.AnnualIncrease ai (nolock) on ai.PolicyId = p.PolicyId
			inner join policy.PolicyLifeExtension le (nolock) on le.PolicyId = p.PolicyId
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId and pil.RolePlayerTypeId = 10 and pil.InsuredLifeStatusId = 1
			inner join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
			inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitTypeId = 2
		where ai.PolicyIncreaseStatusId = @currentPolicyIncreaseStatusId
		group by p.PolicyId,
			ai.EffectiveDate,
			p.InstallmentPremium,
			pil.CoverAmount,
			le.AnnualIncreaseTypeId,
			p.PolicyOwnerId,
			per.DateOfBirth

	update ai set
		ai.PolicyIncreaseStatusId = 7,
		ai.IncreaseFailedReason = 'No more increases once member is 65 years or older',
		ai.PremiumBefore = x.CurrentPremium,
		ai.PremiumAfter = x.CurrentPremium,
		ai.CoverAmountBefore = x.CurrentCoverAmount,
		ai.CoverAmountAfter = x.CurrentCoverAmount,
		ai.ModifiedBy = @userId,
		ai.ModifiedDate = getdate()
	from @policy x
		inner join policy.AnnualIncrease ai on ai.PolicyId = x.PolicyId and ai.EffectiveDate = x.EffectiveDate
	where x.MainMemberAge >= 65

	delete from @policy where MainMemberAge >= 65

	if exists (select policyId from @policy) begin
		-- Get insured lives excluding children
		insert into @members (PolicyId, RolePlayerId, RolePlayerTypeId, Premium, CoverAmount, MemberAge)
			select pil.PolicyId,
				pil.RolePlayerId,
				pil.RolePlayerTypeId,
				pil.Premium,
				pil.CoverAmount,
				client.CalculateAge(per.DateOfBirth) [MemberAge]
			from @policy p
				inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
				inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
			where pil.InsuredLifeStatusId = 1
			  and pil.RolePlayerTypeId <> 32
			order by pil.PolicyId,
				pil.RolePlayerTypeId,
				pil.RolePlayerId

		-- Get child members with highest premium
		insert into @members (PolicyId, RolePlayerId, RolePlayerTypeId, Premium, CoverAmount, MemberAge)
			select PolicyId, RolePlayerId, RolePlayerTypeId, Premium, CoverAmount, MemberAge
			from (
				select pil.PolicyId,
					pil.RolePlayerId,
					pil.RolePlayerTypeId,
					pil.Premium,
					pil.CoverAmount,
					client.CalculateAge(per.DateOfBirth) [MemberAge],
					Rank() over (partition by pil.PolicyId order by pil.Premium desc) [Rank]
				from @policy p
					inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
					inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
				where pil.InsuredLifeStatusId = 1
				  and pil.RolePlayerTypeId = 32
				  and pil.Premium > 0
			) t
			where t.[Rank] = 1

		-- Update the new premium and cover amount for each member
			-- 2. Premium Increase 5 Percent And 4 Percent Benefit Increase
			-- 3. Premium Increase 10 Percent And 8 Percent Benefit Increase
		update m set	
			m.NewPremium = round(cast(case p.AnnualIncreaseTypeId when 2 then Premium * 1.05 when 3 then Premium * 1.10 else Premium end as money), 2),
			m.NewCoverAmount = round(cast(case p.AnnualIncreaseTypeId when 2 then CoverAmount * 1.04 when 3 then CoverAmount * 1.08 else CoverAmount end as money), 0)
		from @policy p
			inner join @members m on m.PolicyId = p.PolicyId

		-- Update the new premium in the policy table variable
		update p set
			p.CurrentPremium = t.CurrentPremium + p.VapsPremium,
			p.NewPremium = t.NewPremium + p.VapsPremium
		from @policy p
			inner join (
				select p.PolicyId,
					sum(m.Premium) [CurrentPremium],
					sum(m.NewPremium) [NewPremium]
				from @policy p
					inner join @members m on m.PolicyId = p.PolicyId
				group by p.PolicyId
			) t on t.PolicyId = p.PolicyId

		-- Update the new cover amount
		update p set
			p.NewCoverAmount = m.NewCoverAmount
		from @policy p
			inner join @members m on m.PolicyId = p.PolicyId
		where m.RolePlayerTypeId = 10

		-- Update the annual policy increase table
		update ai set
			ai.PremiumBefore = t.CurrentPremium,
			ai.PremiumAfter = t.NewPremium,
			ai.CoverAmountBefore = t.CurrentCoverAmount,
			ai.CoverAmountAfter = t.NewCoverAmount,
			ai.PolicyIncreaseStatusId = @nextPolicyIncreaseStatusId,
			ai.ModifiedBy = @userId,
			ai.ModifiedDate = getdate()
		from @policy t
			inner join policy.AnnualIncrease ai on
				ai.PolicyId = t.PolicyId and
				ai.EffectiveDate = t.EffectiveDate
	end

	select count(*) [Count] from @policy

	set nocount off

END
GO
