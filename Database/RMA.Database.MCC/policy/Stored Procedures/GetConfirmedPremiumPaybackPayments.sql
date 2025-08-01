CREATE PROCEDURE [policy].[GetConfirmedPremiumPaybackPayments]
AS BEGIN

	declare @date date = getdate()
	set @date = datefromparts(year(@date), month(@date), 1)

	select p.PolicyId,
		p.PolicyNumber,
		p.PolicyInceptionDate,
		rp.RolePlayerId,
		upper(concat(per.FirstName, ' ', per.Surname)) [PolicyOwner],
		per.IdNumber,
		rp.CellNumber [MobileNumber],
		pp.PremiumPaybackId,
		pp.PaybackDate,
		pp.NotificationSendDate [NotificationDate],
		pp.PremiumPaybackStatusId [PremiumPaybackStatus],
		cast(pp.PaybackAmount as money) [PaybackAmount],
		pp.PaybackFailedReason,
		ba.RolePlayerBankingId,
		ba.BankAccountTypeId [BankAccountType],
		trim(ba.AccountNumber) [AccountNumber],
		ba.BankId,
		ba.BankBranchId,
		ba.BranchCode
	from policy.Policy p
		inner join policy.PremiumPayback pp on pp.PolicyId = p.PolicyId
		inner join client.RolePlayer rp on rp.RolePlayerId = p.PolicyOwnerId
		inner join client.Person per on per.RolePlayerId = rp.RolePlayerId
		inner join client.RolePlayerBankAccount ba on ba.RolePlayerId = rp.RolePlayerId
	where pp.PremiumPaybackStatusId in (5, 6)
	  and pp.CreatedDate >= @date
	  and pp.IsDeleted = 0
	order by p.PolicyId

END
