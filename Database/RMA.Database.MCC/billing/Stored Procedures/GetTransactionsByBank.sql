CREATE   PROCEDURE [billing].[GetTransactionsByBank]
/* =============================================
Name:			GetTransactionsByBank
Description:	Get Transactions By Bank
Author:			Sibahle Senda
Create Date:	2020-04-17
Change Date:	
Culprits:		
============================================= */
@accountNumber varchar(50),
@searchFilter varchar(50)
AS
BEGIN

declare @Transactions TABLE(
    [BankStatementEntryId]  [int] NOT NULL,
	[UnallocatedPaymentId] [int] NOT NULL,
	[BankAccountNumber] [varchar](17) NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[TransactionDate] [datetime] NOT NULL,
	[BillingReference] [varchar](100) NULL,
	[StatementReference] [varchar](100) NOT NULL)

insert @Transactions 
select up.[BankStatementEntryId],up.[UnallocatedPaymentId],s.[BankAccountNumber],up.UnallocatedAmount,s.[StatementDate],
       s.[UserReference],
	  (CONCAT(s.StatementNumber, '/', s.StatementLineNumber, ' ', (select convert(varchar, s.StatementDate, 103))))
from [finance].[BankStatementEntry] s
inner join [billing].[UnallocatedPayment] up on up.BankStatementEntryId = s.BankStatementEntryId
where up.AllocationProgressStatusId = 1 -- Unallocated
and up.UnallocatedAmount > 0
and s.BankAccountNumber = ('00000' + @accountNumber)
and ((s.UserReference like '%' + @searchFilter + '%') or
    ((CONCAT(s.StatementNumber, '/', s.StatementLineNumber, ' ', (select convert(varchar, s.StatementDate, 103)	))) like  '%' + @searchFilter + '%'))

SELECT [BankStatementEntryId]
      ,[UnallocatedPaymentId]
      ,[BankAccountNumber]
      ,[Amount]
      ,[TransactionDate]
      ,[BillingReference]
      ,[StatementReference]
FROM @Transactions
ORDER BY [TransactionDate] ASC
END
