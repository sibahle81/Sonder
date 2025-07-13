CREATE PROCEDURE [billing].[CreatePremiumPaybackDebitNote] @paymentId int, @userId varchar(128)
AS BEGIN

	declare @now datetime = getdate()

	declare @transaction table (
		RolePlayerId int,
		BankStatementEntryId int,
		TransactionTypeLinkId int,
		Amount money,
		TransactionDate date,
		BankReference varchar(50),
		TransactionTypeId int,
		Reason varchar(255),
		RmaReference varchar(100),
		LinkedTransactionId int,
		CreatedDate date
	)

	insert into @transaction (RolePlayerId,BankStatementEntryId,TransactionTypeLinkId,Amount,TransactionDate,BankReference,TransactionTypeId,Reason,RmaReference,LinkedTransactionId,CreatedDate)
		select tx.RolePlayerId,
			tx.BankStatementEntryId,
			1 [TransactionTypeLinkId],
			tx.Amount,
			cast(@now as date) [TransactionDate],
			tx.BankReference,
			2 [TransactionTypeId],
			replace(tx.Reason, 'Credit', 'Debit') [Reason],
			replace(tx.RmaReference, 'CN', 'DN') [RmaReference],
			tx.TransactionId [LinkedTransactionId],
			pp.CreatedDate
		from payment.Payment pp (nolock)
			inner join policy.Policy p (nolock) on p.PolicyId = pp.PolicyId
			inner join billing.Transactions tx (nolock) on 
				tx.RolePlayerId = p.PolicyOwnerId and
				tx.TransactionTypeId = 4 and
				tx.TransactionTypeLinkId = 2 and
				tx.Amount = pp.Amount
		where pp.PaymentId = @paymentId
		  and tx.TransactionTypeId = 4
		  and tx.Reason like '%payback%'

	insert into [billing].[Transactions] ([RolePlayerId], [BankStatementEntryId], [TransactionTypeLinkId], [Amount], [TransactionDate], [BankReference], [TransactionTypeId], [Reason], [RmaReference], [LinkedTransactionId], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		select distinct x.RolePlayerId,
			x.BankStatementEntryId,
			x.TransactionTypeLinkId,
			x.Amount,
			x.TransactionDate,
			x.BankReference,
			x.TransactionTypeId,
			x.Reason,
			x.RmaReference,
			x.LinkedTransactionId,
			0 [IsDeleted],
			@userId [CreatedBy], 
			getdate() [CreatedDate], 
			@userId [ModifiedBy], 
			getdate() [ModifiedDate]
		from @transaction x
			left join billing.Transactions tx on 
				tx.RolePlayerId = x.RolePlayerId and
				tx.TransactionTypeLinkId = x.TransactionTypeLinkId and
				tx.Amount = x.Amount and
				tx.TransactionDate = x.TransactionDate and
				tx.TransactionTypeId = x.TransactionTypeId and
				tx.Reason = x.Reason and
				tx.RmaReference = x.RmaReference and
				tx.LinkedTransactionId = x.LinkedTransactionId
		where tx.TransactionId is null

END
go
--begin tran
--	exec billing.CreatePremiumPaybackDebitNote 30186, 'system'
--	select * from billing.Transactions where RolePlayerId = 940485 and Reason like '%payback%'
--rollback tran