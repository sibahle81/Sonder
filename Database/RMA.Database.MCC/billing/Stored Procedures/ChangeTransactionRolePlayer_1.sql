CREATE   PROCEDURE [billing].[ChangeTransactionRolePlayer] @oldRolePlayerId int, @newRolePlayerId int, @userId varchar(128)
as begin

	declare @policyCount int
	select @policyCount = count(*) from policy.Policy with (nolock)
		where PolicyOwnerId = @oldRolePlayerId
		  and PolicyStatusId = 1

	if @policyCount = 1 begin
		update [billing].[Transactions] set 
			[RolePlayerId] = @newRolePlayerId,
			[ModifiedBy] = @userId,
			[ModifiedDate] = getdate()
		where [RolePlayerId] = @oldRolePlayerId		
	end

end