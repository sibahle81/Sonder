CREATE PROCEDURE [policy].[GetOutstandingPremiumPaybacks]
AS BEGIN

	declare @payDate date = getdate()

	select p.PolicyId,
		p.PolicyNumber,
		p.PolicyInceptionDate,
		rp.RolePlayerId,
		upper(rp.DisplayName) [PolicyOwner],
		rp.CellNumber [MobileNumber],
		pb.PremiumPaybackId,
		pb.PaybackDate,
		pb.NotificationSendDate [NotificationDate],
		pb.PremiumPaybackStatusId [PremiumPaybackStatus],
		pb.PaybackAmount,
		pb.PaybackFailedReason,
		bank.RolePlayerBankingId,
		bank.BankAccountTypeId [BankAccountType],
		bank.AccountNumber,
		bank.BankId,
		bank.BankBranchId,
		bank.BranchCode
	from policy.Policy p
		inner join policy.PremiumPayback pb on pb.PolicyId = p.PolicyId
		inner join client.RolePlayer rp on rp.RolePlayerId = p.PolicyOwnerId
		left join client.RoleplayerBankAccount bank on bank.RolePlayerId = bank.RolePlayerId
	where pb.PremiumPaybackStatusId != 10
	order by p.PolicyId

END
