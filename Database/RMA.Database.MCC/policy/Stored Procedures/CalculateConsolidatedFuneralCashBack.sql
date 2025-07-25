CREATE PROCEDURE [policy].[CalculateConsolidatedFuneralCashBack] @userId varchar(128)
AS BEGIN

	declare @count int = 0
	declare @today date = getdate()
	declare @paybackDate date = datefromparts(year(@today), month(@today), 15)

	if (@today > @paybackDate) begin
		set @paybackDate = dateadd(month, 1, @paybackDate)
	end

	-- Get the VAPS premiums
	declare @vaps table (
		ProductOptionId int,
		Premium money
	)

	insert into @vaps (ProductOptionId, Premium)
		select ProductOptionId,
			cast(sum(BaseRate) as money) [VapsPremium]
		from product.CurrentBenefitRate
		where ProductOptionId in (132, 133)
			and BenefitTypeId = 2
		group by ProductOptionId

	-- Get the last payback date of all policies that have already had paybacks
	declare @payback table (
		PolicyId int primary key,
		PaybackDate date,
		Payments int
	)

	insert into @payback (PolicyId, PaybackDate, Payments)
		select PolicyId,
			max(Paybackdate) [PaybackDate],
			count(*) [Payments]
		from policy.PremiumPayback (nolock)
		where IsDeleted = 0
		group by PolicyId
		order by PolicyId

	-- Get all the policies that MIGHT qualify for payback.
	declare @policy table (
		PolicyId int primary key,
		PolicyNumber varchar(36),
		ProductOptionId int,
		InceptionDate date,
		LastPaybackDate date,
		PaymentsRequired int
	)

	insert into @policy (PolicyId, PolicyNumber, ProductOptionId, InceptionDate, LastPaybackDate, PaymentsRequired)
		select PolicyId,
			PolicyNumber,
			ProductOptionId,
			PolicyInceptionDate,
			LastPaybackDate,
			(PaybackPayments + 1) * 12 [PaymentsRequired]
		from (
			select p.PolicyId,
				p.PolicyNumber,
				p.ProductOptionId,
				p.PolicyInceptionDate,
				isnull(pb.PaybackDate, p.PolicyInceptionDate) [LastPaybackDate],
				convert(int, round(datediff(month, p.PolicyInceptionDate, @today) / 12.0, 0)) [PolicyYearAge],
				isnull(pb.Payments, 0) [PaybackPayments]
			from policy.Policy p (nolock)
				inner join @vaps v on v.ProductOptionId = p.ProductOptionId
				left join @payback pb on pb.PolicyId = p.PolicyId
			where p.PolicyStatusId != 2
			  and datediff(month, p.PolicyInceptionDate, @today) >= 10
		) x
		where PaybackPayments < PolicyYearAge

	-- Remove policies that have had paybacks in the last 6 months
	declare @cutoff date = dateadd(month, -6, @paybackDate)
	delete from @policy where LastPaybackDate >= @cutoff

	declare @transaction table (
		Id int identity primary key,
		PolicyId int index IX1 clustered,
		TransactionDate date index IX2 nonclustered,
		Amount money default(0),
		Vaps money default(0),
		Payments int default(0),
		[Rank] int
	)

	-- Get the all the payments for the policies that may qualify, rank by transaction 
	-- date so the latest payments start at 1
	insert into @transaction (PolicyId, TransactionDate, Amount, Vaps, Payments, [Rank])
		select p.PolicyId, 
			bs.BankAndStatementDate [TransactionDate],
			(bs.NettAmount / 100.0) [Amount],
			v.Premium,
			1,
			rank() over (partition by p.PolicyId order by bs.BankAndStatementDate desc) [Rank]
		from @policy p
			inner join @vaps v on v.ProductOptionId = p.ProductOptionId
			inner join finance.BankStatementEntry bs (nolock) on
				bs.UserReference = p.PolicyNumber and
				bs.DebitCredit = '+'
		where bs.TransactionDate >= p.InceptionDate
		  and bs.IsDeleted = 0

	-- Remove policies that have not received the required number of payments
	delete p from @policy p
		inner join (
			select PolicyId, count(Payments) [Payments]
			from @transaction 
			group by PolicyId
		) t on t.PolicyId = p.PolicyId
	where t.Payments < p.PaymentsRequired
	delete t from @transaction t left join @policy p on p.PolicyId = t.PolicyId where p.PolicyId is null

	-- Delete old transactions so that we only have the last 12 to calculate average
	delete from @transaction where [Rank] > 12

	-- Delete transactions where the transaction amount is zero (didn't know this could happen)
	delete from @transaction where [Amount] <= 0.00

	-- Insert the premium payback records
	insert into [policy].[PremiumPayback] ([PolicyId], [PremiumPaybackStatusId], [PaybackDate], [PaybackAmount], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		select PolicyId,
			2 [PremiumPaybackStatusId],
			@paybackDate [PaybackDate],
			round(cast((sum(Amount) - sum(Vaps)) / sum(Payments) as money), 2) [PaybackAmount],
			0 [IsDeleted],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate]
		from @transaction
		group by PolicyId, Payments
		order by PolicyId

	select @count = @@ROWCOUNT

	-- Flag records with missing bank account details
	update pp set
		pp.PremiumPaybackStatusId = 4,
		pp.PaybackFailedReason = 'Bank Account Error: Missing bank account details',
		pp.ModifiedBy = @userId,
		pp.ModifiedDate = getdate()
	from policy.Policy p (nolock)
		inner join policy.PremiumPayback pp (nolock) on pp.PolicyId = p.PolicyId
		left join client.RolePlayerBankAccount ba (nolock) on ba.RolePlayerId = p.PolicyOwnerId
	where PaybackDate = @paybackDate
	  and ba.RolePlayerId is null
	  and PremiumPaybackStatusId = 2

	SELECT @count [Count]

END
