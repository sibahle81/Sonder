
ALTER PROCEDURE [billing].[CreateCreditNoteForInvoice]
/* =============================================
Name:			CreateCreditNoteForInvoice
Description:	CreateCreditNoteForInvoice
Author:			Baldwin Khosa
Create Date:	2022-10-27
Change Date:	
Culprits:		
============================================= */
@policyId int,
@rolePlayerId int
AS
BEGIN
	BEGIN TRAN trxCreditNoteForInvoice
		BEGIN TRY
		
			DECLARE @createdTransactionid bigint
			DECLARE @createdInvoiceAllocationTransactionid bigint
			DECLARE @newItem varchar(max)
			
			DECLARE @invoiceTransactions table(
			[InvoiceId] bigint,
			[PolicyId] [int],
			[TotalInvoiceAmount] [decimal](18, 2),
			[CollectionDate] [datetime])
			
			INSERT INTO @invoiceTransactions
			SELECT i.InvoiceId, i.PolicyId, i.TotalInvoiceAmount, i.CollectionDate
			FROM billing.Invoice i
			INNER JOIN billing.InvoiceAllocation ia on ia.InvoiceAllocationId = i.InvoiceId
			WHERE i.PolicyId = @policyId
			
			DECLARE @currentInvoiceId bigint = (select top 1 [InvoiceId] from @invoiceTransactions)
							
			WHILE (SELECT COUNT(InvoiceId) from @invoiceTransactions) > 0
			BEGIN 
				 
				Declare  @creditNoteReferenceNumber varchar(500)
				SELECT @creditNoteReferenceNumber = 'CN' +  CONVERT(VARCHAR(12), GETDATE(), 112) + '0' +  CONVERT(VARCHAR(12), @rolePlayerId)

				INSERT INTO billing.Transactions(InvoiceId, RolePlayerId, TransactionTypeLinkId,Amount , TransactionDate, RmaReference,TransactionTypeId, Reason, CreatedDate , ModifiedDate, CreatedBy, ModifiedBy)
				SELECT InvoiceId, @rolePlayerId, 2, TotalInvoiceAmount, GETDATE(), @creditNoteReferenceNumber, 4, 'CancellationCreditNote', GETDATE(), GETDATE(), 'system@randmutual.co.za', 'system@randmutual.co.za'
				FROM @invoiceTransactions
				WHERE [InvoiceId] = @currentInvoiceId
				
				SET @createdTransactionid =(select SCOPE_IDENTITY())
				
				SELECT @newItem = (SELECT * FROM billing.Transactions 
                WHERE InvoiceId = @currentInvoiceId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

				INSERT [audit].[AuditLog] (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                SELECT @currentInvoiceId, 'billing_Transactions', 'Added',null,@newItem,GETDATE(),'CreateCreditNoteForInvoice',''
								
				INSERT INTO billing.InvoiceAllocation(TransactionId , CreatedDate, CreatedBy,  ModifiedBy, ModifiedDate, InvoiceId , Amount , IsDeleted)
				SELECT @createdTransactionid, GETDATE(),'system@randmutual.co.za', 'system@randmutual.co.za', GETDATE(), InvoiceId,  TotalInvoiceAmount, 0 
				FROM @invoiceTransactions
				WHERE [InvoiceId] = @currentInvoiceId
				
				SET @createdInvoiceAllocationTransactionid =(select SCOPE_IDENTITY())
				
				select @newItem = (SELECT * FROM billing.InvoiceAllocation 
                where [InvoiceId] = @currentInvoiceId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

                INSERT [audit].[AuditLog](ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                SELECT @createdInvoiceAllocationTransactionid, 'billing_InvoiceAllocation', 'Added',null,@newItem,GETDATE(),'CreateCreditNoteForInvoice',''
							
				DELETE FROM @invoiceTransactions where [InvoiceId] = @currentInvoiceId
				SET	@currentInvoiceId = (select top 1 [InvoiceId] from @invoiceTransactions)
							
			END
		COMMIT	TRAN trxCreditNoteForInvoice
	END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
		print ERROR_MESSAGE()
		print  ERROR_LINE()
            ROLLBACK TRAN trxCreditNoteForInvoice
        END
    END CATCH	
END