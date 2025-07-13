
CREATE   PROCEDURE [policy].[SaveGroupRiskAdditionalBenefits] @fileIdentifier uniqueidentifier, @userId varchar(128)
AS BEGIN

	declare @productOptionId int 
	declare @benefitId int

	select @productOptionId = ProductOptionId
	from [Load].[StageGroupRisk] gr
	where gr.FileIdentifier = @fileIdentifier
	group by ProductOptionId

	select top 1 @benefitId = BenefitId
	from product.CurrentBenefitRate
	where ProductOptionId = @productOptionId
	  and CoverMemberTypeId = 1
	  and BenefitTypeId = 1

	update pil set
		pil.StatedBenefitId = @benefitId
	from [Load].[StageGroupRisk] gr
		inner join [policy].[PolicyInsuredLives] pil on 
			pil.PolicyId = gr.PolicyId and
			pil.RolePlayerId = gr.EmployeeRolePlayerId
	where gr.FileIdentifier = @fileIdentifier
	  and isnull(pil.StatedBenefitId, 0) = 0

	insert into policy.PolicyInsuredLifeAdditionalBenefits ([PolicyId], [RolePlayerId], [BenefitId], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		select gr.PolicyId,
			gr.EmployeeRolePlayerId [RolePlayerId],
			br.[BenefitId],
			0 [IsDeleted],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate]
		from [Load].[StageGroupRisk] gr
			inner join [product].[CurrentBenefitRate] br on 
				br.ProductOptionId = gr.ProductOptionId and
				br.BenefitId != gr.BenefitId and
				br.CoverMemberTypeId = 1 and
				br.BenefitTypeId != 1
		  left join policy.PolicyInsuredLifeAdditionalBenefits pab on
			pab.PolicyId = gr.PolicyId and
			pab.RoleplayerId = gr.EmployeeRolePlayerId and
			pab.BenefitId = br.BenefitId
		where gr.FileIdentifier = @fileIdentifier
		  and pab.RolePlayerId is null
		order by gr.EmployeeRolePlayerId,
			br.BenefitId
	declare @count int
	select @count = count(*) from [Load].[StageGroupRisk] where FileIdentifier = @fileIdentifier
	select @count [Count]
END