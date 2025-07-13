--EXEC  [policy].[MarkPolicyAsCancelled] @policyId = 114550, @cancelReasonId =3, @cancellationDate = '2021-02-01', @isPolicyToBeDeleted = 0
CREATE PROCEDURE [policy].[MarkPolicyAsCancelled]
  @policyId INT,
  @cancelReasonId INT,
  @cancellationDate date,
  @isPolicyToBeDeleted bit = 0
as begin

	begin tran trxMarkPolicyAsCancelled

	begin try
		declare @outstandingInvoices table (
			invoiceId int,
			invoiceNumber varchar(50),
			transactionId int,
			rolePlayerId int,
		    outstandingAmount decimal(18,2)
		)

		-- Get any outstanding invoices
		insert into @outstandingInvoices
			select i.InvoiceId, i.InvoiceNumber, t.TransactionId, t.RolePlayerId, dbo.GetTransactionBalance(t.TransactionId)
			from [billing].[Transactions] t with (nolock)
				inner join [billing].[Invoice] i with (nolock) on i.InvoiceId = t.InvoiceId
			where i.PolicyId = @policyId and dbo.GetTransactionBalance(t.TransactionId) > 0
			and t.TransactionTypeId = 6 --invoice transaction type
		    and i.InvoiceDate >= @cancellationDate

	   -- Settle all outstanding invoices
		insert into billing.Transactions (InvoiceId, RolePlayerId, TransactionTypeLinkId, Amount,
		TransactionDate, RmaReference, TransactionTypeId, CreatedDate, ModifiedDate, CreatedBy, ModifiedBy)
		(select invoiceId, rolePlayerId, 2, outstandingAmount, (select getdate()),
		concat('Policy Cancellation: ',InvoiceNumber), 4, (select getdate()),
		(select getdate()), 'system@randmutual.co.za', 'system@randmutual.co.za' from @outstandingInvoices)

	   -- Update invoice statuses
		update i set
		     i.InvoiceStatusId = 1, -- paid state
			 i.ModifiedDate = (select getdate()),
			 i.ModifiedBy = 'system@randmutual.co.za'
		from [billing].[Invoice] i, @outstandingInvoices oi
		where i.InvoiceId = oi.invoiceId

		-- Update policy
		update p set
		     p.PolicyStatusId = 2, -- cancelled state
			 p.CancellationDate = @cancellationDate,
			 p.PolicyCancelReasonId = @cancelReasonId,
			 p.IsDeleted = @isPolicyToBeDeleted,
			 p.ModifiedBy = 'system@randmutual.co.za',
			 p.ModifiedDate = (select getdate())
		from [policy].[Policy] p
		where p.PolicyId = @PolicyId
		--where p.PolicyId = 114556

		commit tran trxMarkPolicyAsCancelled 

	end try
	begin catch
		rollback tran trxMarkPolicyAsCancelled
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

		begin tran trxInsertIntoInvoiceAllocations
		insert into billing.InvoiceAllocation (TransactionId, CreatedDate, CreatedBy,
		ModifiedBy, ModifiedDate, InvoiceId, Amount, ClaimRecoveryId)
		(select t.TransactionId, t.CreatedDate, t.CreatedBy,
		 t.ModifiedBy, t.ModifiedDate, t.InvoiceId, t.Amount, null from billing.Transactions t where
		 t.TransactionTypeId = 4 and t.CreatedDate >= '2020-11-01' and
		 t.InvoiceId is not null
		 and not exists (select ia.InvoiceAllocationId from billing.InvoiceAllocation ia
		 where ia.TransactionId = t.TransactionId))
		commit tran trxInsertIntoInvoiceAllocations 

end