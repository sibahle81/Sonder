CREATE PROCEDURE [policy].[PolicySearchMoreInfo] 
	@policyId int,
	@rolePlayerId bigint
AS BEGIN
	  
	declare @test int = try_cast(@rolePlayerId as int)
	if (isnull(@test, 0) = 0) begin
		select @rolePlayerId = PolicyOwnerId from policy.Policy (nolock) where PolicyId = @policyId
	end

	declare @relation table (
		PolicyId int,
		RolePlayerId int,
		Relation varchar(64),
		BenefitName varchar(128),
		BenefitAmount money
	)

	-- Insert policy member
	insert into @relation 
		select @policyId [PolicyId],
			@rolePlayerId [RolePlayerId],
			rt.[Name] [Relation],
			br.[BenefitName],
			BenefitAmount = isnull(pil.CoverAmount,br.[BenefitAmount])
		from policy.PolicyInsuredLives pil (nolock) 
			inner join product.CurrentBenefitRate br (nolock) on br.BenefitId = pil.StatedBenefitId
			inner join client.RolePlayerType rt (nolock) on rt.RolePlayerTypeId = pil.RolePlayerTypeId
		where pil.PolicyId = @policyId 
		  and pil.RolePlayerId = @rolePlayerId

	-- Insert relation if no policy members found
	insert into @relation
		select @policyId [PolicyId],
			@rolePlayerId [RolePlayerId],
			rt.[Name] [Relation],
			'N/A' [BenefitName],
			0 [BenefitAmount]
		from client.RolePlayerRelation rr (nolock) 
			inner join client.RolePlayerType rt (nolock) on rt.RolePlayerTypeId = rr.RolePlayerTypeId
			left join @relation r on r.PolicyId = rr.PolicyId and r.RolePlayerId = rr.FromRolePlayerId
		where rr.PolicyId = @policyId 
		  and rr.FromRolePlayerId = @rolePlayerId
		  and r.PolicyId is null

	-- Select the policy details
	select p.PolicyNumber [PolicyRecord.policyNumber],
		p.InstallmentPremium [PolicyRecord.CurrentPremium],
		p.AnnualPremium [PolicyRecord.AnnualPremium],
		b.TradeName [PolicyRecord.BrokerName],
		isnull(co.[Name], 'N/A') [PolicyRecord.SchemeName],
		isnull(r.BenefitName, 'N/A') [PolicyRecord.BenefitName],
		isnull(r.BenefitAmount, 0.00) [PolicyRecord.BenefitAmount],
		isnull(r.Relation, 'N/A') [PolicyRecord.Relation],
		isnull(parp.PolicyNumber, 'N/A') [PolicyRecord.Parentpolicynumber]
	from policy.Policy p (nolock)
		inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
		left join policy.Policy parp (nolock) on parp.PolicyId = p.ParentPolicyId
		left join client.Company co (nolock) on co.RolePlayerId = isnull(parp.PolicyOwnerId, p.PolicyOwnerId)
		left join @relation r on r.PolicyId = p.PolicyId
	where p.PolicyId = @policyId
	FOR JSON PATH

END
GO

