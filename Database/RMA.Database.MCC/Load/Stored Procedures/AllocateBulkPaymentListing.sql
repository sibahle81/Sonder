CREATE   procedure [Load].[AllocateBulkPaymentListing] (@fileIdentifier uniqueidentifier,  @userId varchar(64), @unallocatedPaymentId int)
as begin

	delete from [Load].[PremiumListingError] where [FileIdentifier] = @fileIdentifier

	begin try
		begin tran trxPayments

		declare @count int

		declare @payments table (
			RolePlayerId int not null,
			PolicyId int not null,
			Amount money not null
		)

		declare @errors table (
			Comment varchar(512)
		)

		insert into @payments
			select p.[PolicyOwnerId], p.[PolicyId], pp.PaymentAmount
			from [Load].[BulkPaymentListing] pp with (nolock)
				inner join [policy].[Policy] p with (nolock) on p.[PolicyNumber] = pp.[PolicyNumber]
			where pp.[FileIdentifier] = @fileIdentifier

		select @count = count(*) from @errors

		if @count = 0 begin
			insert into billing.Transactions (RolePlayerId, BankStatementEntryId, TransactionTypeLinkId, Amount, TransactionDate, BankReference, TransactionTypeId, 
			CreatedDate, ModifiedDate, CreatedBy, ModifiedBy, RmaReference)
            (select p.RolePlayerId, bs.BankStatementEntryId, 2, p.Amount, getdate(), (SELECT CONCAT(Bs.StatementNumber, '/', Bs.StatementLineNumber, ' ', getdate())),
            3, (select getdate()), (select getdate()), 'system@randmutual.co.za', 'system@randmutual.co.za', ''
			from @payments p, finance.BankStatementEntry bs, billing.UnallocatedPayment up 
			where bs.BankStatementEntryId = up.BankStatementEntryId and up.UnallocatedPaymentId = @unallocatedPaymentId)

			update up set AllocationProgressStatusId = 3, UnallocatedAmount = 0, ModifiedDate = getdate(), ModifiedBy = 'system@randmutual.co.za'
			from billing.UnallocatedPayment up where up.UnallocatedPaymentId = @unallocatedPaymentId

			commit tran trxPayments
		end else begin
			declare @msg varchar(64) = concat('Validation: ', @fileIdentifier)
			raiserror(@msg, 11, 1)
		end

	end try
	begin catch
		rollback tran trxPayments
		insert into [Load].[PremiumListingError] select @fileIdentifier, 'Payments', [Comment] from @errors
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

end