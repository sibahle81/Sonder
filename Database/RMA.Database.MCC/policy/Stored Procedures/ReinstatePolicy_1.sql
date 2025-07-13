CREATE   PROCEDURE [policy].[ReinstatePolicy]
  @policyId INT,
  @reinstateDate date,
  @userId varchar(64)
as begin

	declare @policyStatusId int
	declare @policyNumber varchar(32)
	select @policyStatusId = PolicyStatusId, @policyNumber = PolicyNumber from [policy].[Policy] with (nolock) where [PolicyId] = @policyId

	if (@policyStatusId = 5) begin
		update p set
				p.PolicyStatusId = 15, 
				p.LastReinstateDate = @reinstateDate,
				p.ModifiedBy = @userId,
				p.ModifiedDate = getdate()
		from [policy].[Policy] p
		where p.PolicyId = @policyId
		   or (p.ParentPolicyId = @policyId and p.policyStatusId = 5)
	end else begin
		declare @error varchar(128) = concat('The status of policy ', @policyNumber, ' is not lapsed.')
		raiserror(@error, 11, 1) 
	end

	insert into policy.PolicyNote (PolicyId, [Text], IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
		select p.PolicyId [PolicyId], 
			concat('Policy reinstated effective from ', @reinstateDate) [Text], 
			0 [IsDeleted], 
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate]
		from policy.Policy p with (nolock)
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
		where p.PolicyId = @policyId

	select PolicyStatusId from [policy].[Policy] where [PolicyId] = @policyId

end