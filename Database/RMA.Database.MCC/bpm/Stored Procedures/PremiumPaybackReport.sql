CREATE PROCEDURE [bpm].[PremiumPaybackReport] @wizardId int
AS BEGIN

	declare @json varchar(max)

	select @json = replace(replace([Data], '[{"paybackItems":', ''), '}]}]', '}]') from bpm.Wizard where Id = @wizardId

	declare @payback table (
		PolicyId int,
		PolicyNumber varchar(32),
		InceptionDate date,
		RolePlayerId int,
		PolicyOwner varchar(128),
		MobileNumber varchar(64),
		PremiumPaybackId int,
		PaybackDate date,
		PremiumPaybackStatus int,
		PaybackAmount money,
		RolePlayerBankingId int,
		BankAccountType int,
		AccountNumber varchar(64),
		BankId int,
		BankBranchId int,
		BranchCode varchar(16),
		PaybackFailedReason varchar(512)
	)

	insert into @payback ([PolicyId], [PolicyNumber], [InceptionDate], [RolePlayerId], [PolicyOwner], [MobileNumber], [PremiumPaybackId], [PaybackDate], [PremiumPaybackStatus], [PaybackAmount], [RolePlayerBankingId], [BankAccountType], [AccountNumber], [BankId], [BankBranchId], [BranchCode], [PaybackFailedReason])
	select * from openjson(@json) with (
		PolicyId int '$.policyId',
		PolicyNumber varchar(32) '$.policyNumber',
		InceptionDate date '$.policyInceptionDate',
		RolePlayerId int '$.RolePlayerId',
		PolicyOwner varchar(128) '$.policyOwner',
		MobileNumber varchar(64) '$.mobileNumber',
		PremiumPaybackId int '$.premiumPaybackId',
		PaybackDate date '$.paybackDate',
		PremiumPaybackStatus int '$.premiumPaybackStatus',
		PaybackAmount money '$.paybackAmount',
		RolePlayerBankingId int '$.rolePlayerBankingId',
		BankAccountType int '$.bankAccountType',
		AccountNumber varchar(64) '$.accountNumber',
		BankId int '$.bankId',
		BankBranchId int '$.bankBranchId',
		BranchCode varchar(16) '$.branchCode',
		PaybackFailedReason varchar(512) '$.paybackFailedReason'
	)

	select x.PolicyId,
		x.PolicyNumber,
		ps.Name [PolicyStatus],
		x.InceptionDate,
		x.PolicyOwner,
		per.IdNumber,
		per.DateOfBirth,
		x.MobileNumber,
		x.PaybackDate,
		pbs.Name [PaybackStatus],
		x.PaybackAmount,
		b.Name [Bank],
		concat(ac.Id, ' - ', ac.Name) [AccountType],
		x.BranchCode,
		x.AccountNumber,
		x.PaybackFailedReason
	from @payback x
		inner join policy.Policy p on p.PolicyId = x.PolicyId
		inner join common.PolicyStatus ps on ps.Id = p.PolicyStatusId
		inner join common.PremiumPaybackStatus pbs on pbs.Id = x.PremiumPaybackStatus
		inner join common.Bank b on b.Id = x.BankId
		inner join common.BankAccountType ac on ac.Id = x.BankAccountType
		inner join client.Person per on per.RolePlayerId = x.RolePlayerId
	order by x.PaybackDate,
	x.PolicyNumber

END
GO
