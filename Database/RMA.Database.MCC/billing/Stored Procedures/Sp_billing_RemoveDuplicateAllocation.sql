USE [AZT-MCC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [billing].[Sp_billing_RemoveDuplicateAllocation]
/* =============================================
Name:			Sp_billing_RemoveDuplicateAllocation
Description:	
Author:			Baldwin Khosa
Create Date:	2022-08-02
Change Date:	
Culprits:		
============================================= */
select * from missing_bank_entries_2020Nov_aug2022

AS
BEGIN
	WITH data AS (
    SELECT
        TransactionId,
        InvoiceId,
        RolePlayerId,
        BankStatementEntryId,
        TransactionTypeLinkId,
        Amount,
        ROW_NUMBER() OVER (
            PARTITION BY
                InvoiceId,
                RolePlayerId,
                BankStatementEntryId,
                TransactionTypeLinkId,
                Amount
            ORDER BY
            BankStatementEntryId,
                InvoiceId,
                RolePlayerId,
                TransactionTypeLinkId,
                Amount
        ) row_num

     FROM billing.Transactions
     where BankStatementEntryId in (select BankStatementEntryId from billing.Transactions
     where TransactionTypeId = 3 
     group by BankStatementEntryId
     having count(BankStatementEntryId) > 1)
	)
	select * 
	into #MyTempTable 
	from data where row_num > 1
	
	UPDATE billing.Transactions 
	SET IsDeleted = 1, ModifiedBy = 'Sp_billing_RemoveDuplicateAllocation', Reason = 1, ModifiedDate = getdate() 
	WHERE TransactionId in (select TransactionId from #MyTempTable)
	
	UPDATE billing.AbilityTransactionsAudit
	SET IsDeleted = 1, ModifiedBy = 'Sp_billing_RemoveDuplicateAllocation', ModifiedDate = getdate() 
	WHERE TransactionId in (select TransactionId from #MyTempTable)
	
	UPDATE billing.InvoiceAllocation 
	SET IsDeleted = 1, ModifiedBy = 'Sp_billing_RemoveDuplicateAllocation', ModifiedDate = getdate() 
	WHERE TransactionId in (select TransactionId from #MyTempTable)
	
	Select * from #MyTempTable
	
	Drop Table #MyTempTable
END
