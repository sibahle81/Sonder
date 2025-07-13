CREATE VIEW [client].[RolePlayerBankAccount] 
AS
	select * from (
		select bd.RolePlayerBankingId,
			bd.RolePlayerId,
			bd.PurposeId,
			bp.[Name] [Purpose],
			bb.BankId,
			b.Name [BankName],
			bd.BankBranchId,
			bb.Code [BankBranchCode],
			bd.BranchCode [BranchCode],
			bd.BankAccountTypeId,
			bat.Name [BankAccountType],
			bd.AccountNumber,
			Rank() over (partition by RolePlayerId order by RolePlayerBankingId desc) [Rank]
		from client.RolePlayerBankingDetails bd (nolock)
			inner join common.BankingPurpose bp (nolock) on bp.Id = bd.PurposeId
			inner join common.BankAccountType bat (nolock) on bat.Id = bd.BankAccountTypeId
			inner join common.BankBranch bb (nolock) on bb.Id = bd.BankBranchId
			inner join common.Bank b (nolock) on b.Id = bb.BankId
		where bd.IsDeleted = 0
	) b
	where b.[Rank] = 1

GO
