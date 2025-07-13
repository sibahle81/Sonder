CREATE PROCEDURE [billing].[RemoveDuplicateAllocation]
/* =============================================
Name:           RemoveDuplicateAllocation
Description:    
Author:         Bongani Makelane
Create Date:    2022-08-02
Change Date:    
Culprits:       
============================================= */
AS
BEGIN
declare @year int;

declare @transactions table ( TransactionId int,
        RolePlayerId int,
        BankStatementEntryId int,
        TransactionTypeLinkId int,
        Amount decimal(18,2),row_num int);

    WITH data AS (
    SELECT
	TransactionId,
        RolePlayerId,
        BankStatementEntryId,
        TransactionTypeLinkId,
        Amount,
        ROW_NUMBER() OVER (
            PARTITION BY
                RolePlayerId,
                BankStatementEntryId,
                TransactionTypeLinkId,
                Amount
            ORDER BY
            BankStatementEntryId,
                RolePlayerId,
                TransactionTypeLinkId,
                Amount
        ) row_num
     FROM billing.Transactions
     where BankStatementEntryId in (select BankStatementEntryId from billing.Transactions
     where TransactionTypeId = 3 and IsDeleted <> 1 and CreatedDate >= concat('1 jan ', @year)  and createdby ='BackendProcess' and BankStatementEntryId in (166925,167001)
     group by BankStatementEntryId
     having count(BankStatementEntryId) > 1)
    ) 
	
	insert into @transactions
	select *
    from data

	--select * from @transactions

	declare @currentBankstatementId int = (select top 1 BankStatementEntryId from @transactions)

	while (select  Count(BankStatementEntryId)  from @transactions)  > 0
		begin --try determining if the entries are due to a large amount being broken down
			declare @sumIntransactions decimal(18,2)
			declare @sumInBankstatementEntry decimal(18,2)
			set	@sumInBankstatementEntry=(select sum(NettAmount)/cast(100 as decimal(18,2)) from finance.BankStatementEntry b
			where b.BankStatementEntryId = @currentBankstatementId)
			select	@sumIntransactions =(select sum (amount) from billing.Transactions where BankStatementEntryId =  @currentBankstatementId)
			
			if @sumIntransactions > @sumInBankstatementEntry
				begin
				declare @currentTransactionId int = (select top 1 TransactionId from @transactions where row_num > 1  and BankStatementEntryId= @currentBankstatementId)
					while (select count(TransactionId) from @transactions where row_num > 1  and BankStatementEntryId= @currentBankstatementId) > 0										
					begin --inner loop							
					DECLARE @oldItem varchar(max), @newItem varchar(max)

					select @oldItem = (SELECT * FROM billing.Transactions 
                     where TransactionId = @currentTransactionId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
						
						UPDATE billing.Transactions 
						SET IsDeleted = 1, ModifiedBy = 'Sp_Billing_RemoveDuplicateAllocation', modifieddate = getdate(), DeletedReasonId = 1
						WHERE TransactionId in (@currentTransactionId) 
    					
						select @newItem = (SELECT * FROM billing.Transactions 
                     where TransactionId in (@currentTransactionId)  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

					  insert [audit].[AuditLog]
                  (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                     select @currentTransactionId, 'billing_Transactions', 'Modified',@oldItem,@newItem,GETDATE(),'Sp_Billing_RemoveDuplicateAllocation',''


					 select @oldItem = (SELECT * FROM billing.AbilityTransactionsAudit
                     where TransactionId = @currentTransactionId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
						
						UPDATE billing.AbilityTransactionsAudit
						SET IsDeleted = 1,IsActive=0, ModifiedBy = 'Sp_Billing_RemoveDuplicateAllocation', modifieddate = getdate()
						WHERE TransactionId in (@currentTransactionId)
						  
						  select @newItem = (SELECT * FROM billing.AbilityTransactionsAudit 
                     where TransactionId = @currentTransactionId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
					 
					 insert [audit].[AuditLog]
                     (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                     select @currentTransactionId, 'billing_AbilityTransactionsAudit', 'Modified',@oldItem,@newItem,GETDATE(),'Sp_Billing_RemoveDuplicateAllocation',''

					
						UPDATE billing.invoiceallocation SET IsDeleted = 1, ModifiedBy = 'Sp_Billing_RemoveDuplicateAllocation', modifieddate = getdate() 
						WHERE TransactionId in (@currentTransactionId)
						
					 	delete from @transactions where TransactionId =@currentTransactionId
					set	@currentTransactionId  = (select top 1 TransactionId from @transactions where row_num > 1  and BankStatementEntryId= @currentBankstatementId)
					end --inner loop
				end 

				delete from @transactions where BankStatementEntryId =@currentBankstatementId

			set	@currentBankstatementId  = (select top 1 BankStatementEntryId from @transactions)
		end  
      
	End