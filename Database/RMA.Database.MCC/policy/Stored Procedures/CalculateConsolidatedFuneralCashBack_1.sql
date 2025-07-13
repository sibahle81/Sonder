
CREATE   PROCEDURE [policy].[CalculateConsolidatedFuneralCashBack] @userId varchar(128)
AS BEGIN

	declare @today date = getdate() -- This is used later as well
	declare @date date = datefromparts(year(@today), month(@today), 1)

	declare @policyCutoffDate date = dateadd(month, -11, @date)
	declare @paymentCutoffDate date = dateadd(month, -13, @date)

	declare @minDate date, @maxDate date

	declare @payback table (
		PolicyId int primary key,
		PaybackDate date
	)

	declare @vaps table (
		ProductOptionId int,
		Premium money
	)

	-- Get the VAPS premiums
	insert into @vaps (ProductOptionId, Premium)
		select ProductOptionId,
			cast(sum(BaseRate) as money) [VapsPremium]
		from product.CurrentBenefitRate
		where ProductOptionId in (132, 133)
			and BenefitTypeId = 2
		group by ProductOptionId

	-- First, get the last payback date of all policies that have already had pay backs
	insert into @payback (PolicyId, PaybackDate)
	select PolicyId, max(PayBackdate) [PaybackDate]
	from policy.PremiumPayback
	where [PaybackDate] > @paymentCutoffDate
	  and [PremiumPaybackStatusId] = 4 -- Successful paybacks
	group by PolicyId
	order by PolicyId

	-- Create a table with the start dates of the last 13 months
	declare @month table (
		MonthStart date
	)
	;with MonthsCTE as (
		select cast(dateadd(month, datediff(month, 0, getdate()) - 12, 0) as date) as MonthStart
		union all
		select dateadd(month, 1, MonthStart)
		from MonthsCTE
		where MonthStart < dateadd(month, datediff(month, 0, getdate()), 0)
	)
	insert into @month select * from MonthsCTE

	-- Get the payment details for the past 13 months
	declare @transaction table (
		Id int identity primary key,
		PolicyId int,
		ProductOptionId int,
		TransactionDate date,
		TransactionAmount money,
		VapsPremium money,
		PaybackAmount money
	)

	-- Get the payment details that ARE linked to an invoice from the transactions tables
	insert into @transaction (PolicyId, ProductOptionId, TransactionDate, TransactionAmount)
		select p.PolicyId,
			p.ProductOptionId,
			cast(i.InvoiceDate as date) [TransactionDate],
			sum(cast(iif(bs.BankStatementEntryId is null, t.Amount, bs.NettAmount / 100.0) as money)) [TransactionAmount]
		from policy.Policy p (nolock)
			--inner join policy.PolicyStatusActionsMatrix pam (nolock) on pam.PolicyStatus = p.PolicyStatusId
			inner join billing.Invoice i (nolock) on i.PolicyId = p.PolicyId
			inner join billing.Transactions t (nolock) on t.InvoiceId = i.InvoiceId
			left join finance.BankStatementEntry bs (nolock) on bs.BankStatementEntryId = t.BankStatementEntryId
			left join @payback pb on pb.PolicyId = p.PolicyId
		where p.ProductOptionId in (132, 133)
		  and p.PolicyInceptionDate <= @policyCutoffDate -- exclude policies created within the last 12 months (they won't qualify)
		  --and pam.DoRaiseInstallementPremiums = 1
		  and t.TransactionTypeId = 3
		  and pb.PolicyId is null
		group by p.PolicyId, p.ProductOptionId, i.InvoiceDate
		order by 1, 3

	-- Get the payment details that ARE NOT linked to an invoice from the transactions tables
	insert into @transaction (PolicyId, ProductOptionId, TransactionDate, TransactionAmount)
		select distinct t.PolicyId, t.ProductOptionId, t.TransactionDate, sum(t.TransactionAmount) [TransactionAmount]
		from (
			select p.PolicyId,
				p.ProductOptionId,
				cast(isnull(bs.BankAndStatementDate, t.TransactionDate) as date) [TransactionDate],
				cast(iif(bs.BankStatementEntryId is null, t.Amount, bs.NettAmount / 100.0) as money) [TransactionAmount]
			from policy.Policy p (nolock)
				--inner join policy.PolicyStatusActionsMatrix pam (nolock) on pam.PolicyStatus = p.PolicyStatusId
				inner join billing.Transactions t (nolock) on t.RolePlayerId = p.PolicyOwnerId and t.InvoiceId is null
				left join finance.BankStatementEntry bs (nolock) on bs.BankStatementEntryId = t.BankStatementEntryId
				left join @payback pb on pb.PolicyId = p.PolicyId
			where p.ProductOptionId in (132, 133)
			  and p.PolicyInceptionDate <= @policyCutoffDate -- exclude policies created within the last 12 months (they won't qualify anyway)
			  --and pam.DoRaiseInstallementPremiums = 1
			  and t.TransactionTypeId = 3
			  and pb.PolicyId is null
		) t left join @transaction tx on tx.PolicyId = t.PolicyId and tx.TransactionDate = t.TransactionDate
		where tx.PolicyId is null
		group by t.PolicyId, t.ProductOptionId, t.TransactionDate
		order by 1, 3

	-- Remove transactions outside of the specified date range
	select @minDate = min(MonthStart), @maxDate = max(MonthStart) from @month
	delete from @transaction where TransactionDate not between @minDate and @maxDate

	-- Update the VAPS premiums
	update t set t.VapsPremium = v.Premium
	from @transaction t inner join @vaps v on v.ProductOptionId = t.ProductOptionId

	-- Insert missing transactions with a zero balance
	insert into @transaction (PolicyId, ProductOptionId, TransactionDate, TransactionAmount, VapsPremium)
	select t.PolicyId, 0, t.MonthStart, 0, 0 from (
		select distinct PolicyId, MonthStart from @transaction, @month
	) t left join @transaction tx on tx.PolicyId = t.PolicyId and tx.TransactionDate = t.MonthStart
	where tx.PolicyId is null

	-- Now we have 13 months for each policy in the temp table. Remove the first and last payments if they are zero
	delete from @transaction where TransactionDate = @minDate and TransactionAmount = 0
	delete from @transaction where TransactionDate = @maxDate and TransactionAmount = 0

	-- Remove the last transaction for policies with more than 12 payments
	delete trx
	from @transaction trx
		inner join (
			select PolicyId, max(Id) [MaxId], count(*) [Records] 
			from @transaction
			group by PolicyId
			having count(*) > 12
		) t on t.MaxId = trx.Id

	-- Update the payback amount
	update @transaction set PaybackAmount = TransactionAmount - VapsPremium

	-- Calculate the next payment date. Payments are made on the 15 of each month.
	-- If the 15th of this month has already passed, pay next month
	declare @payDate date = datefromparts(year(@today), month(@today), 15)
	if (@today > @payDate) begin
		set @payDate = dateadd(month, 1, @payDate)
	end

	-- Now all policies with 12 records remaining in the table qualify for cash back
	insert into [policy].[PremiumPayback] ([PolicyId], [PremiumPaybackStatusId], [PaybackDate], [PaybackAmount], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		select [PolicyId],
			2 [PremiumPaybackStatusId],
			@payDate [PaybackDate],
			round(cast(avg(PaybackAmount) as money), 2) [PaybackAmount],
			0 [IsDeleted],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate]
		from @transaction 
		where TransactionAmount > 0
		group by PolicyId 
		having count(*) >= 12
		order by PolicyId

	SELECT @@ROWCOUNT [Count]

END