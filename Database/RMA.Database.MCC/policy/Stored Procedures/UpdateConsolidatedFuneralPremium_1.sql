
CREATE   PROCEDURE [policy].[UpdateConsolidatedFuneralPremium] (@policyId int, @userId varchar(128))
AS BEGIN

	declare @premium money
	declare @vapsPremium money
	
	declare @member table(
		RolePlayerId int,
		RolePlayerTypeId int,
		Premium money
	)

	insert into @member (RolePlayerId, RolePlayerTypeId, Premium)
		select RolePlayerId,
			RolePlayerTypeId,
			Premium
		from policy.PolicyInsuredLives
		where PolicyId = @policyId
		  and InsuredLifeStatusId = 1
		  and RolePlayerTypeId <> 32
	insert into @member (RolePlayerId, RolePlayerTypeId, Premium)
		select top 1 RolePlayerId,
			RolePlayerTypeId,
			Premium
		from policy.PolicyInsuredLives
		where PolicyId = @policyId
		  and InsuredLifeStatusId = 1
		  and RolePlayerTypeId = 32
		order by Premium desc

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