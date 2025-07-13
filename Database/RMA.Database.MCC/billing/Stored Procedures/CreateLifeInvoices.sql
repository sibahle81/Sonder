-- =============================================
-- Author:		Bongani Makelane
-- Create date: 17-02-2023
-- Description: create invoices for funeral product
-- =============================================
Create PROCEDURE [billing].[CreateLifeInvoices]
AS
BEGIN
declare @unprocessedBacth table (batchId int) 

insert into @unprocessedBacth
select [BatchInvoiceId]  from [billing].[BatchInvoice] where IsDeleted =0 and [InvoicedItemTypeId]=1 and BatchStatusId=1
declare @currentBatchId int = (select top 1 batchid from @unprocessedBacth)

while (select count(batchid) from @unprocessedBacth) > 0
begin --level 0
	begin try
		begin tran trxInvoices

		declare @activeInvoiceDetails table(policyId int)
		declare @invoicedMonth int,@invoicedYear int
		declare @TranTypeLinkId int
		select @TranTypeLinkId = (select Id from [billing].[TransactionTypeLink] where [Name] = 'Debit')
		select @invoicedMonth = [Month], @invoicedYear =[year]  from [billing].[BatchInvoice] where BatchInvoiceId = @currentBatchId

		 insert into @activeInvoiceDetails
		 select PolicyId from [billing].[BatchInvoiceDetail] (nolock) where IsExcludedDueToStatus = 0

		 declare @currentPolicyId int= (select top 1 policyid from @activeInvoiceDetails)
		 declare @endOfCurrentMonthDate date = (select EOMONTH((select( DATEFROMPARTS(@invoicedYear,@invoicedMonth,1)))))
		 declare @endOfCurrentMonth int= (select (day(@endOfCurrentMonthDate)))
	while (select count(policyId) from @activeInvoiceDetails)> 0 
		begin--level1
		 declare @lineItems table (policyId int, policystatusId int, premium decimal(18,2)) 
			declare @insertedInvoiceId int
			declare @amount decimal(18,2) = (select Premium from [billing].[BatchInvoiceDetail] where PolicyId=@currentPolicyId)
			
			declare @installmentDay varchar(3) = case when @invoicedMonth <>12 then
			(select [RegularInstallmentDayOfMonth]  from [policy].[Policy] where PolicyId=@currentPolicyId)
			else
			(select [DecemberInstallmentDayOfMonth]  from [policy].[Policy]  where PolicyId=@currentPolicyId)
			end

			if @installmentDay > @endOfCurrentMonth
					begin
					set @installmentDay = @endOfCurrentMonth
					end

			declare @collectionDate date =(select(DATEFROMPARTS(year(getdate()),month(getdate()),@installmentDay)))

			declare @invoiceDate date =(select( DATEFROMPARTS(@invoicedYear,@invoicedMonth,1)))
		
			if @collectionDate is null
				begin
				set @collectionDate = @invoiceDate
				end 

				declare @isGroupPolicy bit = case when  (select count(ParentPolicyId) from [policy].[policy] where policyid = @currentPolicyId) >0
				then 1 else 0 end
				if (@isGroupPolicy = 1)
					begin --@isGroupPolicy = 1
						insert into billing.Invoice ([TenantId],[PolicyId],[CollectionDate],[TotalInvoiceAmount]
					  ,[InvoiceStatusId],[InvoiceDate],[IsDeleted],[CreatedBy]
					  ,[CreatedDate],[ModifiedBy],[ModifiedDate],InvoiceNumber) 
					  values (1,@currentPolicyId,@collectionDate,@amount,3,getdate(),0,'sp_CreateLifeInvoices',getdate(),'sp_CreateLifeInvoices',getdate(),'')

					  set @insertedInvoiceId  = (select scope_identity())
					  ---line items	 
					  insert into  @lineItems 
					  select policyid,PolicyStatusId,InstallmentPremium  from [policy].[policy] where parentpolicyid = @currentPolicyId

					  insert into [billing].[InvoiceLineItems] ([InvoiceId],[PolicyId],[Amount],[PolicyStatusId] 
					  ,[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[IsExcludedDueToStatus])
						select @insertedInvoiceId, policyId,premium,policystatusId,0,'sp_CreateLifeInvoices',GETDATE(),'sp_CreateLifeInvoices',GETDATE()
						,case when (EXISTS
						(SELECT id FROM [policy].[PolicyStatusActionsMatrix] WHERE [PolicyStatus] = policystatusId and [DoRaiseInstallementPremiums] =1) ) then 1 else 0 end 
						from  @lineItems 
					end--@isGroupPolicy = 1

		else 
			begin --@isGroupPolicy <> 1
				insert into billing.Invoice ([TenantId],[PolicyId],[CollectionDate],[TotalInvoiceAmount]
				,[InvoiceStatusId],[InvoiceDate],[IsDeleted],[CreatedBy]
				,[CreatedDate],[ModifiedBy],[ModifiedDate], InvoiceNumber)
	  			values (1,@currentPolicyId,@collectionDate,@amount,3,getdate(),0,'sp_CreateLifeInvoices',getdate(),'sp_CreateLifeInvoices',getdate(), '')

				set @insertedInvoiceId  = (select scope_identity())	  

			  insert into  @lineItems 
			  select policyid,PolicyStatusId,InstallmentPremium  from [policy].[policy] where parentpolicyid = @currentPolicyId

			   insert into [billing].[InvoiceLineItems] ([InvoiceId],[PolicyId],[Amount],[PolicyStatusId] 
			  ,[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[IsExcludedDueToStatus])
				select @insertedInvoiceId, policyId,premium,policystatusId,0,'sp_CreateLifeInvoices',GETDATE(),'sp_CreateLifeInvoices',GETDATE(),0
				from  @lineItems

				end--@isGroupPolicy <> 1
				declare @roleplayerId int, @policyNumber varchar(100), @transactionAmount decimal(18,2)
				select @roleplayerId =PolicyPayeeId,@policyNumber=PolicyNumber,@transactionAmount =InstallmentPremium from [policy].[policy] where PolicyId =@currentPolicyId

				delete  @activeInvoiceDetails where policyId =@currentPolicyId
				set @currentPolicyId = (select top 1 policyid from @activeInvoiceDetails)
				insert into [billing].[Transactions] (InvoiceId, RolePlayerId, TransactionTypeLinkId, Amount, TransactionDate, BankReference, TransactionTypeId, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate)
				select @insertedInvoiceId, @roleplayerId, @TranTypeLinkId, @transactionAmount, @invoiceDate, @policyNumber, '6','sp_CreateLifeInvoices', 'sp_CreateLifeInvoices', GETDATE(), GETDATE()

	end --level1
		commit tran trxInvoices
			delete @unprocessedBacth where batchId = @currentBatchId
			set	@currentBatchId =(select top 1 batchid from @unprocessedBacth)
	--set batch status and move to next batch
			update [billing].[BatchInvoice] set BatchStatusId = 3, ModifiedBy='sp_CreateLifeInvoices', ModifiedDate=getdate()
			where BatchInvoiceId = @currentBatchId
		continue
	end try
	begin catch
	declare @Error varchar(max)
		rollback tran trxInvoices
		select @Error = 'reateLifeInvoices - Error: ' + ERROR_MESSAGE()
			insert into [dbo].[Logs] ([Message], MessageTemplate, [Level], [TimeStamp])
		select @Error, @Error, 'Fatal', getdate()
		delete @unprocessedBacth where batchId = @currentBatchId
		set	@currentBatchId =(select top 1 batchid from @unprocessedBacth)
		--set batch status and move to next batch
		update [billing].[BatchInvoice] set BatchStatusId = 5, ModifiedBy='sp_CreateLifeInvoices', ModifiedDate=getdate()
		where BatchInvoiceId = @currentBatchId
			continue
	end catch

end --level 0
END