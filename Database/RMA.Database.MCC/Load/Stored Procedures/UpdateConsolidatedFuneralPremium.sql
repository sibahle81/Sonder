CREATE PROCEDURE [policy].[UpdateConsolidatedFuneralPremium] (@policyId int, @userId varchar(128))
AS BEGIN

	declare @premium money
	declare @vapsPremium money
	
	declare @member table(
		RolePlayerId int,
		CoverMemberTypeId int,
		DateOfBirth date,
		Premium money
	)

	insert into @member
		select pil.RolePlayerId,
			b.CoverMemberTypeId,
			per.DateOfBirth,
			pil.Premium
		from policy.PolicyInsuredLives pil (nolock)
			inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
			inner join product.Benefit b (nolock) on b.Id = pil.StatedBenefitId
		where pil.PolicyId = @policyId
		  and pil.InsuredLifeStatusId = 1
		  and pil.IsDeleted = 0

	-- Only one child carries a premium. Check if this is indeed the case and correct it
	-- if more than one child has a premium.
	declare @count int
	select @count = count(*) from @member where CoverMemberTypeId = 3 and Premium > 0.00
	if @count > 1 begin
		declare @rolePlayerId int
		-- Get the roleplayer with the highest premium
		select top 1 @rolePlayerId = RolePlayerId
			from @member
			where CoverMemberTypeId = 3
		order by Premium desc, DateOfBirth
		-- Change the premium of all other children to zero, because
		-- only the child with the highest premium pays
		update @member set Premium = 0
		where CoverMemberTypeId = 3
		  and RolePlayerId <> @rolePlayerId
		-- Update the policy
		update pil set
			pil.Premium = m.Premium,
			pil.ModifiedBy = @userId,
			pil.ModifiedDate = getdate()
		from @member m
			inner join policy.PolicyInsuredLives pil on pil.PolicyId = @policyId and pil.RolePlayerId = m.RolePlayerId
		where m.CoverMemberTypeId = 3
		  and m.Premium <> pil.Premium
	end

	select @premium = sum(Premium) from @member

	select @vapsPremium = sum(br.BaseRate)
	from policy.Policy p
		inner join product.CurrentBenefitRate br on br.ProductOptionId = p.ProductOptionId
	where p.PolicyId = @policyId
	  and br.BenefitTypeId = 2

	update policy.Policy set
		InstallmentPremium = @premium + @vapsPremium,
		AnnualPremium = (@premium + @vapsPremium) * 12.0,
		ModifiedBy = @userId,
		ModifiedDate = getdate()
	where PolicyId = @policyId
	
	select InstallmentPremium from policy.Policy where PolicyId = @policyId

END
GO
