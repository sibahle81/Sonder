CREATE PROCEDURE [policy].[FixAnnualConsolidatedFuneralPremiumIncreases] @policyIncreaseStatusId int, @userId varchar(128), @effectiveDate date
AS BEGIN

	set nocount on

	update policy.AnnualIncrease set PolicyIncreaseStatusId = 5 where EffectiveDate = @effectiveDate and PolicyIncreaseStatusId = @policyIncreaseStatusId

	declare @maximumCover table (
		MinimumAge int,
		MaximumAge int,
		MaximumCover money
	)

	insert into @maximumCover (MinimumAge, MaximumAge, MaximumCover) values
		(0, 5, 20000),
		(6, 14, 50000);

	declare @policy table (
		AnnualIncreaseId int,
		PolicyId int,
		PolicyStatusId int,
		ProductOptionId int,
		AnnualIncreaseTypeId int,
		VapsPremium money,
		OldPremium money,
		OldAnnualPremium money,
		IncreasePremium money,
		NewPremium money,
		AlreadyIncreased bit default(0),
		PolicyInactive bit default(0),
		Comment varchar(max)
	)

	insert into @policy (AnnualIncreaseId, PolicyId, PolicyStatusId, ProductOptionId, AnnualIncreaseTypeId, OldPremium, OldAnnualPremium, IncreasePremium)
		select ai.AnnualIncreaseId,
			p.PolicyId,
			p.PolicyStatusId,
			p.ProductOptionId,
			le.AnnualIncreaseTypeId,
			p.InstallmentPremium,
			p.AnnualPremium,
			ai.PremiumAfter
		from policy.Policy p (nolock)
			inner join policy.AnnualIncrease ai (nolock) on ai.PolicyId = p.PolicyId
			inner join policy.PolicyLifeExtension le (nolock) on le.PolicyId = ai.PolicyId
		where ai.PolicyIncreaseStatusId = 5
		  and datediff(day, ai.EffectiveDate, @effectiveDate) = 0

	update p set
		p.VapsPremium = t.VapsPremium
	from @policy p
		inner join (
			select p.PolicyId,
				sum(br.BaseRate) [VapsPremium]
			from @policy p
				inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId
			where br.BenefitTypeId = 2
			group by p.PolicyId
		) t on t.PolicyId = p.PolicyId

	-- Some policies might have been increased already, mark those as done
	update @policy set
		AlreadyIncreased = 1
	where abs(IncreasePremium - OldPremium) < 0.50

	-- Some policies don't have to be increased, mark those as done
	update @policy set
		PolicyInactive = 1
	where PolicyStatusId not in (1, 14, 15)

	-- Update annual increases where the policy has already been increased
	update ai set
		ai.PolicyIncreaseStatusId = 6,
		ai.PremiumAfter = x.OldPremium,
		ai.ModifiedBy = @userId,
		ai.ModifiedDate = getdate()
	from @policy x
		inner join policy.AnnualIncrease ai on ai.PolicyId = x.PolicyId
	where x.AlreadyIncreased = 1
	  and x.PolicyInactive = 0

	-- Update annual increases where the policy is inactive
	update ai set
		ai.PolicyIncreaseStatusId = 7,
		ai.IncreaseFailedReason = concat('Policy on inactive status: ', ps.Name),
		ai.ModifiedBy = @userId,
		ai.ModifiedDate = getdate()
	from @policy x
		inner join common.PolicyStatus ps on ps.Id = x.PolicyStatusId
		inner join policy.AnnualIncrease ai on ai.PolicyId = x.PolicyId
	where x.PolicyInactive = 1

	-- Remove these policies from the list
	delete from @policy where AlreadyIncreased = 1 or PolicyInactive = 1

	declare @member table(
		PolicyId int,
		RolePlayerId int,
		CoverMemberTypeId int,
		DateOfBirth date,
		Age int,
		OldPremium money,
		NewPremium money,
		OldCoverAmount money,
		NewCoverAmount money
	)

	-- Get the active member details
	insert into @member (PolicyId, RolePlayerId, CoverMemberTypeId, DateOfBirth, Age, OldPremium, OldCoverAmount)
		select p.PolicyId,
			pil.RolePlayerId,
			b.CoverMemberTypeId,
			per.DateOfBirth,
			client.CalculateAge(per.DateOfBirth) [Age],
			pil.Premium [OldPremium],
			pil.CoverAmount
		from @policy p
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
			inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
			inner join product.Benefit b (nolock) on b.Id = pil.StatedBenefitId
		where pil.InsuredLifeStatusId = 1

	-- Make sure only the oldest child pays a premium
	update @member set
		OldPremium = 0
	from @member m
		inner join (
			select PolicyId,
				RolePlayerId,
				OldPremium,
				Rank() over (partition by PolicyId order by OldPremium desc) [Rank]
			from @member
			where CoverMemberTypeId = 3
		) t on t.PolicyId = m.PolicyId and t.RolePlayerId = m.RolePlayerId
	where t.[Rank] > 1

	-- Update the premiums and cover amounts in the members table variable 
	update m set
		m.NewPremium = round(cast(case p.AnnualIncreaseTypeId when 2 then m.OldPremium * 1.05 when 3 then m.OldPremium * 1.10 else m.OldPremium end as money), 2),
		m.NewCoverAmount = round(cast(case p.AnnualIncreaseTypeId when 2 then m.OldCoverAmount * 1.04 when 3 then m.OldCoverAmount * 1.08 else m.OldCoverAmount end as money), 0)
	from @policy p
		inner join @member m on m.PolicyId = p.PolicyId

	-- Update the total premium in the policy table variable 
	update p set
		p.NewPremium = t.NewPremium + p.VapsPremium
	from @policy p
		inner join (
			select PolicyId,
				sum(NewPremium) [NewPremium]
			from @member
			group by PolicyId
		) t on t.PolicyId = p.PolicyId

	-- Update the maximum cover for children
	update m set
		m.NewCoverAmount = c.MaximumCover
	from @member m
		inner join @maximumCover c on m.Age between c.MinimumAge and c.MaximumAge
	where m.NewCoverAmount > c.MaximumCover

	-- Update the premiums and cover in the PolicyInsuredLives table
	update pil set
		pil.Premium = m.NewPremium,
		pil.CoverAmount = m.NewCoverAmount,
		pil.ModifiedBy = @userId,
		pil.ModifiedDate = getdate()
	from @policy x
		inner join policy.Policy p (nolock) on p.PolicyId = x.PolicyId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join @member m on m.PolicyId = pil.PolicyId and m.RolePlayerId = pil.RolePlayerId
	where x.NewPremium <> p.InstallmentPremium

	-- Update the premiums in the Policy table
	update p set
		p.InstallmentPremium = x.NewPremium,
		p.AnnualPremium = x.NewPremium * 12.0
	from @policy x
		inner join policy.Policy p on p.PolicyId = x.PolicyId
	where x.NewPremium <> p.InstallmentPremium

	-- Update policy notes in table variable
	update @policy set Comment = concat('Annual policy premium increase to R ',cast(NewPremium as money),' applied')

	-- Add policy notes for the increases, but do not add duplicate notw
	insert into policy.PolicyNote (PolicyId, [Text], IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
		select x.PolicyId [PolicyId],
			x.Comment [Text],
			0 [IsDeleted], 
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate]
		from @policy x
			left join policy.PolicyNote n (nolock) on n.PolicyId = x.PolicyId and n.[Text] = x.Comment
		where n.PolicyNoteId is null

	-- Add the audit log entries
	insert into [audit].[AuditLog] ([ItemId], [ItemType], [Action], [OldItem], [NewItem], [Date], [Username], [CorrelationToken])
		select PolicyId [ItemId], 
			'policy_Policy' [ItemType], 
			'Modify' [Action], 
			concat('{"InstallmentPremium": ',OldPremium,', "AnnualPremium": ',OldAnnualPremium,'}') [OldItem], 
			concat('{"InstallmentPremium": ',NewPremium,', "AnnualPremium": ',cast(NewPremium * 12.0 as money),'}') [NewItem],
			getdate() [Date], 
			@userId [Username], 
			newid () [CorrelationToken]
		from @policy

	-- Update the Annual Increase status for the selected policies
	update ai set
		ai.PremiumAfter = p.NewPremium,
		ai.PolicyIncreaseStatusId = @policyIncreaseStatusId,
		ai.ModifiedBy = @userId,
		ai.ModifiedDate = getdate()
	from @policy p
		inner join policy.AnnualIncrease ai on ai.AnnualIncreaseId = p.AnnualIncreaseId

	select PolicyId from policy.AnnualIncrease (nolock) where EffectiveDate = @effectiveDate and PolicyIncreaseStatusId = @policyIncreaseStatusId order by PolicyId

	set nocount off

END
GO
