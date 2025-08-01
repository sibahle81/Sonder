CREATE PROCEDURE [billing].[GetDebtorOpenTransactions]
	@roleplayerId int,
	@policyIds varchar(max) = NULL,
	@transactionTypeId int = NULL,
	@outputBalance decimal(18,2) output

AS BEGIN

	declare @results table(
		Policynumber varchar(100),
		PolicyId int, 
		Transactiontype varchar(100),
		DocumentNumber varchar(100), 
		DebitAmount decimal(18,2), 
		CreditAmount decimal(18,2), 
		Balance decimal(18,2), 
		TransactionDate date, 
		TransactionEffectiveDate date,  
		TransactionTypeId int
	)

	insert into @results
		select pp.policynumber, 
			isnull( pp.policyid,0),
			tp.name TransactionType,
			CASE 
				WHEN t.TransactionTypeId = 4 and t.Reason like '%cash back%' THEN t.Reason
				WHEN t.TransactionTypeId in (1, 3, 4, 7, 9, 17) THEN t.RmaReference
				WHEN t.TransactionTypeId = 6 THEN inv.InvoiceNumber END AS DocumentNumber,
			CASE WHEN tpl.IsDebit = 1 THEN t.Amount ELSE 0 END AS DebitAmount, 
			CASE WHEN tpl.IsDebit = 0 THEN t.Amount ELSE 0 END AS CreditAmount,
			dbo.GetTransactionBalance(t.TransactionId) as Balance, 
			t.CreatedDate as TransactionDate, 
			t.TransactionEffectiveDate, 
			t.TransactionTypeId
		from billing.transactions t 
			join common.transactiontype tp on t.transactiontypeid = tp.id
			join billing.TransactionTypeLink tpl on tpl.id = t.TransactionTypeLinkid
			left join billing.invoice inv on t.invoiceid = inv.invoiceid and t.transactiontypeid=6
			left join policy.policy pp on pp.policyid = inv.policyid or (t.InvoiceId is null and pp.PolicyOwnerId = t.RolePlayerId)
		where (t.TransactionId not in (select transactionid from billing.InvoiceAllocation)
		    or t.invoiceid not in (select invoiceid from billing.InvoiceAllocation))
			and t.RolePlayerId = @roleplayerId
			and t.TransactionTypeId = iif(isnull(@transactionTypeId, 0) = 0, t.TransactionTypeId, @transactionTypeId)

	select * from @results where Balance <> 0

	set @outputBalance = ( select sum(balance) from @results)

END
