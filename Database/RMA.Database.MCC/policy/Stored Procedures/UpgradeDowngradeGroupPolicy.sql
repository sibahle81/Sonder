CREATE PROCEDURE [policy].[UpgradeDowngradeGroupPolicy] @policyChangeProductId int, @userId varchar(128)
AS BEGIN

	declare @parentPolicyId int
	declare @productOptionId int
	
	set nocount on

	begin try
		begin tran trxUpgradeDowngrade

		declare @benefits table (
			[Before] int,
			[After] int
		)
	
		select @parentPolicyId = [PolicyId],
			@productOptionId = [ProductOptionId]
		from [policy].[PolicyChangeProduct]
		where [PolicyChangeProductId] = @policyChangeProductId

		insert into @benefits ([Before], [After])
			select [OldBenefitId], [NewBenefitId]
			from [policy].[PolicyChangeBenefit]
			where [PolicyChangeProductId] = @policyChangeProductId
		
		update p set
			p.ProductOptionId = @productOptionId
		from policy.Policy p
		where @parentPolicyId in (p.PolicyId, p.ParentPolicyId)

		update pil set
			pil.StatedBenefitId = b.[After]
		from policy.Policy p
			inner join policy.PolicyInsuredLives pil on pil.PolicyId = p.PolicyId
			inner join @benefits b on b.[Before] = pil.StatedBenefitId 
		where @parentPolicyId in (p.PolicyId, p.ParentPolicyId)
	
		delete pb
		from policy.Policy p
			inner join policy.PolicyBenefit pb on pb.PolicyId = p.PolicyId
		where @parentPolicyId in (p.PolicyId, p.ParentPolicyId)

		insert into policy.PolicyBenefit (PolicyId, BenifitId)
			select distinct p.PolicyId,
				pil.StatedBenefitId
			from policy.Policy p
				inner join policy.PolicyInsuredLives pil on pil.PolicyId = p.PolicyId
			where @parentPolicyId in (p.PolicyId, p.ParentPolicyId)
			  and pil.StatedBenefitId is not null

		insert into policy.PolicyNote (PolicyId, [Text], IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
			select p.PolicyId,
				'Policy cover amount changed' [Text], 
				0 [IsDeleted], 
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
			from policy.Policy p
			where @parentPolicyId in (p.PolicyId, p.ParentPolicyId)

		exec policy.UpdateChildPolicyPremiums @parentPolicyId, @userId

		commit tran trxUpgradeDowngrade

	end try
	begin catch
		rollback tran trxUpgradeDowngrade
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

	set nocount off
END
