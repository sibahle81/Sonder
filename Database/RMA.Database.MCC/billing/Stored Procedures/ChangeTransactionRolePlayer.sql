CREATE PROCEDURE [billing].[ChangeTransactionRolePlayer] @oldRolePlayerId int, @newRolePlayerId int, @userId varchar(128)
as begin

	update [billing].[Transactions] set 
		[RolePlayerId] = @newRolePlayerId,
		[ModifiedBy] = @userId,
		[ModifiedDate] = getdate()
	where [RolePlayerId] = @oldRolePlayerId		

end
