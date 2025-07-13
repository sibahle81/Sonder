-- =============================================
-- Author:		Bongani Makelane
-- Create date: 13 Jul 2022
-- Description:	Allocating payment to roleplayer's invoices and interest and other debits
-- =============================================
create PROCEDURE [billing].[AllocateCreditBalanceToDebitTransactions] 
	@roleplayerId int
AS
BEGIN
  
	declare @invoiceTransactions table(CalculatedBalance decimal(18,2),[TransactionId] bigint,
	[InvoiceId] bigint ,
	[RolePlayerId] [int] ,
	[BankStatementEntryId] [int] ,
	[TransactionTypeLinkId] [int] ,
	[Amount] [decimal](18, 2) ,
	[TransactionDate] [datetime] ,
	[BankReference] [varchar](50),
	[TransactionTypeId] [int],
	[CreatedDate] [datetime],
	[ModifiedDate] [datetime],
	[IsDeleted] [bit] )
declare @debitTransactions table(CalculatedBalance decimal(18,2),[TransactionId] bigint,
	[InvoiceId] bigint,
	[RolePlayerId] [int],
	[BankStatementEntryId] [int],
	[TransactionTypeLinkId] [int],
	[Amount] [decimal](18, 2),
	[TransactionDate] [datetime],
	[BankReference] [varchar](50),
	[TransactionTypeId] [int],
	[CreatedDate] [datetime],
	[ModifiedDate] [datetime],
	[IsDeleted] [bit])

	declare @creditTransactions table([TransactionId] bigint,	
	[CreditBalance] [decimal](18, 2))
	
--negative balance means we have a credit balance
--*(-1) to make all calcutations positive based
insert into 
@creditTransactions
select t.transactionid, dbo.GetTransactionBalance(t.TransactionId) *(-1) from billing.Transactions t where RolePlayerId = @roleplayerId and TransactionTypeLinkId =2 
group by   t.transactionid
having dbo.GetTransactionBalance(t.TransactionId) < 0
order by    t.transactionid

select * from @creditTransactions

insert into @invoiceTransactions
	select  dbo.GetTransactionBalance(t.TransactionId) CalculatedBalance,[TransactionId],[InvoiceId],[RolePlayerId],[BankStatementEntryId],[TransactionTypeLinkId],[Amount],[TransactionDate],[BankReference],[TransactionTypeId],[CreatedDate],[ModifiedDate],[IsDeleted] from billing.Transactions t
where roleplayerid =@roleplayerId and transactiontypeid in(6) and t.IsDeleted =0
and dbo.GetTransactionBalance(t.TransactionId) > 0
order by  t.TransactionId 

select * from @invoiceTransactions

insert into @debitTransactions
	select  dbo.GetTransactionBalance(t.TransactionId) Balance,[TransactionId],[InvoiceId],[RolePlayerId],[BankStatementEntryId],[TransactionTypeLinkId],[Amount],[TransactionDate],[BankReference],[TransactionTypeId],[CreatedDate],[ModifiedDate],[IsDeleted] from billing.Transactions t
where roleplayerid =@roleplayerId and transactiontypeid in(7) and t.IsDeleted =0
--and dbo.GetTransactionBalanceForInterest(t.TransactionId) > 0
order by  t.TransactionId

select * from @debitTransactions

 	declare @currentDebitTransactionid  bigint = (select top 1 [TransactionId] from @debitTransactions)
		--debit loop
		while (select count(transactionid) from @debitTransactions) >0
		begin 
		
			declare @debitTransactionBalance decimal(18,2)
			declare @creditTransactionBalance decimal(18,2)
			declare @currentCreditTransactionid bigint		
		 	 
			select  @debitTransactionBalance=CalculatedBalance  from @debitTransactions
			where [TransactionId] = @currentDebitTransactionid

			------begin slowly allocate to reduce balance
				while @debitTransactionBalance > 0
				begin				
					select top 1 @creditTransactionBalance = [CreditBalance],@currentCreditTransactionid =transactionId  from @creditTransactions
					if @creditTransactionBalance > @debitTransactionBalance --cap the allocatable amount to the @debitTransactionBalance
					begin
						insert into billing.DebitTransactionAllocation (DebitTransactionId,CreditTransactionId,[CreatedDate],[CreatedBy],[ModifiedBy],[ModifiedDate],[Amount]) 
					values(@currentDebitTransactionid,@currentCreditTransactionid, GETDATE(),'sp_AllocateCreditBalanceToDebitTransactions','sp_AllocateCreditBalanceToDebitTransactions',GETDATE(),@debitTransactionBalance )	
						
						set @debitTransactionBalance = 0							
					end
					else
					begin
							insert into billing.DebitTransactionAllocation (DebitTransactionId,CreditTransactionId,[CreatedDate],[CreatedBy],[ModifiedBy],[ModifiedDate],[Amount]) 
					values(@currentDebitTransactionid,@currentCreditTransactionid, GETDATE(),'sp_AllocateCreditBalanceToDebitTransactions','sp_AllocateCreditBalanceToDebitTransactions',GETDATE(),@creditTransactionBalance )	
						
						set @debitTransactionBalance =@debitTransactionBalance - @creditTransactionBalance
													
						delete from @creditTransactions where [TransactionId] = @currentCreditTransactionid	
						set	@currentCreditTransactionid = (select top 1 [TransactionId] from @creditTransactions)							
					end
				end 	------end slowly allocate to reduce balance
			
			delete  @debitTransactions where TransactionId	=@currentDebitTransactionid
			set	@currentDebitTransactionid = (select top 1 [TransactionId] from @debitTransactions)							
			
		end--end while debit loop

declare @currentInvoiceTransactionId bigint = (select top 1 [TransactionId] from @invoiceTransactions)
		--invoices loop
		while (select count(transactionid) from @invoiceTransactions) >0
		begin 
			
			declare @invoiceBalance decimal(18,2)
			declare @invoiceId bigint	
			declare @commissionInvoicePayment decimal(18,2)
					 	 
			select  @invoiceBalance=CalculatedBalance,@invoiceId = InvoiceId   from @invoiceTransactions
			where [TransactionId] = @currentInvoiceTransactionId	
			
			set @commissionInvoicePayment = (select @invoiceBalance)	
		
				declare @currentInvoiceCreditTransactionid bigint	
				while @invoiceBalance > 0
				begin				
					select top 1 @creditTransactionBalance = [CreditBalance],@currentInvoiceCreditTransactionid =transactionId  from @creditTransactions
					if @creditTransactionBalance > @invoiceBalance --cap the allocatable amount to the @@invoiceBalance
					begin

					insert into billing.InvoiceAllocation ([TransactionId],[CreatedDate],[CreatedBy],[ModifiedBy],[ModifiedDate],[InvoiceId],[Amount],[IsDeleted]) 
					values(@currentInvoiceCreditTransactionid, GETDATE(),'sp_AllocateCreditBalanceToDebitTransactions','sp_AllocateCreditBalanceToDebitTransactions',GETDATE(),@invoiceId,@invoiceBalance,0 )
								
							set	@invoiceBalance =0
					end
					else
					begin
						insert into billing.InvoiceAllocation ([TransactionId],[CreatedDate],[CreatedBy],[ModifiedBy],[ModifiedDate],[InvoiceId],[Amount],[IsDeleted]) 
						values(@currentInvoiceCreditTransactionid, GETDATE(),'sp_AllocateCreditBalanceToDebitTransactions','sp_AllocateCreditBalanceToDebitTransactions',GETDATE(),@invoiceId,@creditTransactionBalance,0 )
							
							set 	@invoiceBalance =@invoiceBalance - @creditTransactionBalance						
								
							delete from @creditTransactions where [TransactionId] = @currentInvoiceCreditTransactionid
							set	@currentInvoiceCreditTransactionid = (select top 1 [TransactionId] from @creditTransactions)					
					end
				end 	------end slowly allocate to reduce balance							
				
				--do auditing
						update billing.Invoice set InvoiceStatusId =1 where InvoiceId= @invoiceId
				--pay commission
				declare @policyId int =(select policyid from billing.invoice where invoiceid = @invoiceId )
				declare @commissionPercentage decimal(18,2)
				declare @adminfee decimal(18,2)				
				select @adminfee= [AdminPercentage],@commissionPercentage=[CommissionPercentage] from policy.policy where policyid =@policyId
					
						if @adminfee  > 0 or @commissionPercentage > 0
							begin
							insert into [commission].[InvoicePaymentAllocation] ([InvoiceId],[Amount],[TransactionDate],[TransactionTypeLinkId],[IsProcessed],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate])
							values (@invoiceId, @commissionInvoicePayment,GETDATE(),2,0,0,'sp_AllocateCreditBalanceToDebitTransactions',GETDATE(),'sp_AllocateCreditBalanceToDebitTransactions',GETDATE())
							end		

					delete from @invoiceTransactions where [TransactionId] = @currentInvoiceTransactionId			
					set	@currentInvoiceTransactionId = (select top 1 [TransactionId] from @invoiceTransactions)	
				
		end--end while invoices loop
END