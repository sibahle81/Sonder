-- =============================================
-- Author:		Bongani Makelane
-- Create date: 13 Jul 2022
-- Description:	Allocating payment to roleplayer's invoices and interest and other debits
-- =============================================
CREATE PROCEDURE [billing].[AllocatePaymentToDebitTransactions] 
	@roleplayerId int,
	@amountPaid decimal,
	@bankstatementEntryId int,
	@rmaReference  varchar(500)
AS
BEGIN

BEGIN TRAN trxAllocations
 BEGIN TRY
  
declare @invoiceTransactions table(CalculatedBalance decimal(18,2),[TransactionId] bigint,
	[InvoiceId] bigint ,
	[RolePlayerId] [int] ,
	[BankStatementEntryId] [int] ,
	[TransactionTypeLinkId] [int] ,
	[Amount] [decimal](18, 2) ,
	[TransactionDate] [datetime] ,
	[BankReference] [varchar](50) ,
	[TransactionTypeId] [int] ,
	[CreatedDate] [datetime] ,
	[ModifiedDate] [datetime] ,
	[IsDeleted] [bit] )
declare @debitTransactions table(CalculatedBalance decimal(18,2),[TransactionId] bigint,
	[InvoiceId] bigint ,
	[RolePlayerId] [int] ,
	[BankStatementEntryId] [int] ,
	[TransactionTypeLinkId] [int] ,
	[Amount] [decimal](18, 2) ,
	[TransactionDate] [datetime] ,
	[BankReference] [varchar](50) ,
	[TransactionTypeId] [int] ,
	[CreatedDate] [datetime] ,
	[ModifiedDate] [datetime] ,
	[IsDeleted] [bit])
	
declare @amountAvailableToAllocate decimal(18,2) =(select @amountPaid)

declare @createdTransactionid bigint
  insert into [billing].[Transactions] ([RolePlayerId]
      ,[TransactionTypeLinkId]
      ,[Amount]
      ,[TransactionDate]
      ,[rmaReference]
      ,[TransactionTypeId]
      ,[CreatedDate]
      ,[ModifiedDate]
      ,[CreatedBy]
      ,[ModifiedBy], BankStatementEntryId)
	  values (@roleplayerId,'2',@amountPaid,getdate(),@rmaReference,'3',	getdate(),	getdate(),	'system@randmutual.co.za',	'system@randmutual.co.za',@bankstatementEntryId)
set @createdTransactionid =(select SCOPE_IDENTITY())
print  @createdTransactionid

insert into @invoiceTransactions
	select  dbo.GetTransactionBalance(t.TransactionId) CalculatedBalance,[TransactionId],[InvoiceId],[RolePlayerId],[BankStatementEntryId],[TransactionTypeLinkId],[Amount],[TransactionDate],[BankReference],[TransactionTypeId],[CreatedDate],[ModifiedDate],[IsDeleted] from billing.Transactions t
where roleplayerid =@roleplayerId and transactiontypeid in(6) and t.IsDeleted =0
and dbo.GetTransactionBalance(t.TransactionId) > 0
order by  t.TransactionId 

insert into @debitTransactions
	select  dbo.GetTransactionBalance(t.TransactionId) Balance,[TransactionId],[InvoiceId],[RolePlayerId],[BankStatementEntryId],[TransactionTypeLinkId],[Amount],[TransactionDate],[BankReference],[TransactionTypeId],[CreatedDate],[ModifiedDate],[IsDeleted] from billing.Transactions t
where roleplayerid =@roleplayerId and transactiontypeid in(7) and t.IsDeleted =0
and dbo.GetTransactionBalance(t.TransactionId) > 0
order by  t.TransactionId


declare @currentTransactionId bigint = (select top 1 [TransactionId] from @debitTransactions)
		--debit loop
		while (select count(transactionid) from @debitTransactions) >0
		begin 
			if @amountAvailableToAllocate =0
				begin
					break
				end	

			declare @transactionBalance decimal(18,2)
		 	 
			select  @transactionBalance=CalculatedBalance  from @debitTransactions
			where [TransactionId] = @currentTransactionId
						
			if @amountAvailableToAllocate-@transactionBalance >=0
			begin
				insert into billing.DebitTransactionAllocation (DebitTransactionId,CreditTransactionId,[CreatedDate],[CreatedBy],[ModifiedBy],[ModifiedDate],[Amount]) 
			values(@currentTransactionId,@createdTransactionid, GETDATE(),'sp_AllocatePaymentToDebitTransactions','sp_AllocatePaymentToDebitTransactions',GETDATE(),@transactionBalance )	

					delete from @invoiceTransactions where [TransactionId] = @currentTransactionId
					set	@currentTransactionId = (select top 1 [TransactionId] from @debitTransactions)			
				set	@amountAvailableToAllocate = @amountAvailableToAllocate-@transactionBalance

			end--@amountAvailableToAllocate-@transactionBalance >=0
			else
				begin
				delete from @invoiceTransactions where [TransactionId] = @currentTransactionId
				set	@currentTransactionId = (select top 1 [TransactionId] from @debitTransactions)
					continue;
				end
		end--end while debit loop


declare @currentInvoiceTransactionId bigint = (select top 1 [TransactionId] from @invoiceTransactions)
		--invoices loop
		while (select count(transactionid) from @invoiceTransactions) >0
		begin 
			if @amountAvailableToAllocate =0
				begin
					break
				end	

			declare @invoiceBalance decimal(18,2)
			declare @invoiceId bigint	
		 	 
			select  @invoiceBalance=CalculatedBalance,@invoiceId = InvoiceId   from @invoiceTransactions
			where [TransactionId] = @currentInvoiceTransactionId			
			if @amountAvailableToAllocate-@invoiceBalance >=0
			begin
				insert into billing.InvoiceAllocation ([TransactionId],[CreatedDate],[CreatedBy],[ModifiedBy],[ModifiedDate],[InvoiceId],[Amount],[IsDeleted]) 
				values(@createdTransactionid, GETDATE(),'sp_AllocatePaymentToDebitTransactions','sp_AllocatePaymentToDebitTransactions',GETDATE(),@invoiceId,@invoiceBalance,0 )
				-----update invoice status
					declare @updatedBalance decimal(18,2)=	(select  dbo.GetTransactionBalance(@currentInvoiceTransactionId))
					if @updatedBalance = 0
						begin
						--do auditing
						update billing.Invoice set InvoiceStatusId =1 where InvoiceId= @invoiceId
						end
						else
						begin 
						--do auditing
						update billing.Invoice set InvoiceStatusId =4 where InvoiceId= @invoiceId
						end
				-------end update invoice status


				--pay commission
				declare @policyId int =(select policyid from billing.invoice where invoiceid = @invoiceId )
				declare @commissionPercentage decimal(18,2)
				declare @adminfee decimal(18,2)				
				select @adminfee= [AdminPercentage],@commissionPercentage=[CommissionPercentage] from policy.policy where policyid =@policyId
					
						if @adminfee  > 0 or @commissionPercentage > 0
							begin
							insert into [commission].[InvoicePaymentAllocation] ([InvoiceId],[Amount],[TransactionDate],[TransactionTypeLinkId],[IsProcessed],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate])
							values (@invoiceId, @invoiceBalance,GETDATE(),2,0,0,'system@randmutual.co.za',GETDATE(),'system@randmutual.co.za',GETDATE())
							end		

					delete from @invoiceTransactions where [TransactionId] = @currentInvoiceTransactionId
					set	@currentInvoiceTransactionId = (select top 1 [TransactionId] from @invoiceTransactions)			
				set	@amountAvailableToAllocate = @amountAvailableToAllocate-@invoiceBalance

			end--@amountAvailableToAllocate-@invoiceBalance >=0
			else
				begin
				delete from @invoiceTransactions where [TransactionId] = @currentInvoiceTransactionId
				set	@currentInvoiceTransactionId = (select top 1 [TransactionId] from @invoiceTransactions)
					continue;
				end
		end--end while invoices loop
	COMMIT	TRAN trxAllocations

END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
		print ERROR_MESSAGE()
		print  ERROR_LINE()
            ROLLBACK TRAN trxAllocations
        END
    END CATCH

END