CREATE   PROCEDURE [policy].[MarkPolicyAsLapsed]
  @policyId INT,
  @lapseDate date,
  @userId varchar(64)
as begin 

	begin tran trxMarkPolicyAsLapsed

	begin try
		declare @outstandingInvoices table (
			invoiceId int,
			invoiceNumber varchar(50),
			transactionId int,
			rolePlayerId int,
		    outstandingAmount decimal(18,2)
		)

		declare @policy table (
			PolicyId int primary key,
			PolicyStatusId int,
			LastLapsedDate date,
			LapsedCount int,
			PolicyCancelReasonId int
		)

		insert into @policy (PolicyId, PolicyStatusId, LastLapsedDate, LapsedCount, PolicyCancelReasonId)
			select PolicyId,
				PolicyStatusId,
				LastLapsedDate,
				isnull(LapsedCount, 0) [LapsedCount],
				PolicyCancelReasonId
			from policy.Policy with (nolock) 
			where PolicyId = @policyId

		-- Get any outstanding invoices
		insert into @outstandingInvoices
			select i.InvoiceId, i.InvoiceNumber, t.TransactionId, t.RolePlayerId, dbo.GetTransactionBalance(t.TransactionId)
			from [billing].[Transactions] t with (nolock)
				inner join [billing].[Invoice] i with (nolock) on i.InvoiceId = t.InvoiceId
			where i.PolicyId = @policyId and i.InvoiceDate >= @lapseDate
			and dbo.GetTransactionBalance(t.TransactionId) > 0
			and t.TransactionTypeId = 6 --invoice transaction type

	   -- Settle all outstanding invoices after lapse date
		insert into billing.Transactions (InvoiceId, RolePlayerId, TransactionTypeLinkId, Amount,
		TransactionDate, RmaReference, TransactionTypeId, CreatedDate, ModifiedDate, CreatedBy, ModifiedBy)
		(select invoiceId, rolePlayerId, 2, outstandingAmount, (select getdate()),
		   concat('Policy Lapse: ',InvoiceNumber), 4, (select getdate()),
		(select getdate()), @userId, @userId from @outstandingInvoices)

	   -- Update invoice statuses
		update i set
		     i.InvoiceStatusId = 1, -- paid state
			 i.ModifiedDate = getdate(),
			 i.ModifiedBy = @userId
		from [billing].[Invoice] i, @outstandingInvoices oi
		where i.InvoiceId = oi.invoiceId

		-- Update policy
		update p set
		     p.PolicyStatusId = 5, -- lapsed state
			 p.LapsedCount = isnull(p.LapsedCount, 0) + 1,
			 p.LastLapsedDate = @lapseDate,
			 p.ModifiedBy = @userId,
			 p.ModifiedDate = getdate(),
			 p.PolicyCancelReasonId = 18
		from [policy].[Policy] p
		where p.PolicyId = @PolicyId

		insert into [policy].[PolicyNote] ([PolicyId], [Text], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		select p.[PolicyId],
			concat('Policy lapsed via procedure [policy].[MarkPolicyAsLapsed] by ', @userId) [Text],
			0 [IsDeleted],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate]
		from @policy p

		insert into [audit].[AuditLog] ([ItemId], [ItemType], [Action], [OldItem], [NewItem], [Date], [UserName], [CorrelationToken]) 
		select p.PolicyId [ItemId],
			'policy_Policy' [ItemType],
			'Modified' [Action],
			concat('{"PolicyStatusId": ', t.PolicyStatusId,', "LastLapsedDate": "',t.LastLapsedDate,'", "LapsedCount": ',t.LapsedCount,', "PolicyCancelReasonId": ',t.PolicyCancelReasonId,'}') [OldItem],
			concat('{"PolicyStatusId": ', p.PolicyStatusId,', "LastLapsedDate": "',p.LastLapsedDate,'", "LapsedCount": ',p.LapsedCount,', "PolicyCancelReasonId": ',p.PolicyCancelReasonId,'}') [NewItem],
			getdate() [Date],
			@userId [UserName],
			NEWID() [CorrelationToken]
		from policy.Policy p with (nolock)
			inner join @policy t on t.PolicyId = p.PolicyId

		commit tran trxMarkPolicyAsLapsed 
	end try
	begin catch
		rollback tran trxMarkPolicyAsLapsed
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

end