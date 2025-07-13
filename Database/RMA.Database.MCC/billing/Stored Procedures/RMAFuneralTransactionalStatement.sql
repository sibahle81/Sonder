
---EXEC  [billing].[RMAFuneralTransactionalStatement]   547748, 0,null,'2023-01-01', '2023-09-01'
CREATE PROCEDURE [billing].[RMAFuneralTransactionalStatement] 
	@invoiceId int,
	@period int = 0,
	@year  AS DATE = NULL,
	@startDate AS DATE  = NULL,
	@endDate  AS DATE  = NULL
AS
BEGIN
DECLARE @SearchTable TABLE 
  ( 
     transactionId INT,
     transactiondate DATETIME, 
     transactiontype VARCHAR(50), 
     documentnumber  VARCHAR(50), 
     reference       VARCHAR(50), 
     [description]     VARCHAR(50), 
     debitamount     DECIMAL(18, 2), 
     creditamount    DECIMAL(18, 2), 
     balance         DECIMAL(18, 2), 
     amount          DECIMAL(18, 2),
     createddate DATETIME,
	 rowNumber INT
  ); 
DECLARE @ResultTable TABLE 
  ( 
     transactionId INT,
     transactiondate DATETIME, 
     transactiontype VARCHAR(50), 
     documentnumber  VARCHAR(50), 
     reference       VARCHAR(50), 
     [description]   VARCHAR(50), 
     debitamount     DECIMAL(18, 2), 
     creditamount    DECIMAL(18, 2), 
     amount          DECIMAL(18, 2), 
     balance         DECIMAL(18, 2),
	 [year]          INT,
	 [period]        INT,
     createddate DATETIME
  ); 

DECLARE @rolePlayerId int;
SELECT @rolePlayerId = policyOwnerId FROM [policy].[Policy]
WHERE PolicyId = @invoiceId

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                invoice.InvoiceDate, 
                transactiontype.NAME, 
                invoice.invoicenumber, 
                transactions.bankreference,
				CONCAT('Premium - ', 
                (SELECT DATENAME(month,invoice.InvoiceDate))) AS [description], 
                CASE 
                  WHEN transactiontypelink.isdebit = 1 THEN transactions.amount 
                  ELSE 0 
                END AS DebitAmount, 
                CASE 
                  WHEN transactiontypelink.isdebit = 0 THEN transactions.amount 
                  ELSE 0 
                END AS CreditAmount, 
				(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId)
FROM   [billing].[invoice] Invoice 
       INNER JOIN [billing].[transactions] Transactions 
               ON invoice.invoiceid = transactions.invoiceid 
       INNER JOIN [policy].[policy] Policy 
               ON invoice.policyid = policy.policyid 
       INNER JOIN [client].[roleplayer] RolePlayer 
               ON policy.policyownerid = roleplayer.roleplayerid 
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND Transactions.TransactionTypeId = 6 -- invoice
and Transactions.IsDeleted =0

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.transactiondate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
				CONCAT('Payment - ', 
                (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) )) AS [description],
                0 AS DebitAmount, 
                transactions.amount AS CreditAmount, 
                (select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				 ROW_NUMBER() OVER (ORDER BY transactions.TransactionId)
FROM   [billing].[transactions] Transactions 
        INNER JOIN [client].[roleplayer] RolePlayer 
               ON transactions.RolePlayerId = roleplayer.roleplayerid
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 0
AND Transactions.TransactionTypeId = 3 -- payments
and Transactions.IsDeleted =0

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.transactiondate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
				CONCAT('Credit Note - ', 
                 (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) )) AS [description],
                0 AS DebitAmount, 
                transactions.amount AS CreditAmount, 
                (select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId)
FROM   [billing].[transactions] Transactions 
        INNER JOIN [client].[roleplayer] RolePlayer 
               ON transactions.RolePlayerId = roleplayer.roleplayerid 
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 0
AND Transactions.TransactionTypeId = 4 -- credit notes
and Transactions.IsDeleted =0

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.transactiondate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
				CONCAT('Credit Reallocation - ', 
                 (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) )) AS [description],
                0 AS DebitAmount, 
                transactions.amount AS CreditAmount, 
                (select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId)
FROM   [billing].[transactions] Transactions 
        INNER JOIN [client].[roleplayer] RolePlayer 
               ON transactions.RolePlayerId = roleplayer.roleplayerid 
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 0
AND Transactions.TransactionTypeId = 19 -- credit reallocations
and Transactions.IsDeleted =0

INSERT INTO @SearchTable 
SELECT         transactions.TransactionId,
               transactions.transactiondate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END, 
				CONCAT('Invoice Reversal - ', 
                (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) )) AS [description],
                0 AS DebitAmount, 
                transactions.amount AS CreditAmount, 
                (select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId)
FROM   [billing].[transactions] Transactions 
        INNER JOIN [client].[roleplayer] RolePlayer 
               ON transactions.RolePlayerId = roleplayer.roleplayerid
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 0
AND Transactions.TransactionTypeId = 5 -- invoice reversal
and Transactions.IsDeleted =0

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.transactiondate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
			    CONCAT(transactiontype.[name], ' - ', 
                 (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) )) AS [description],
                transactions.amount AS DebitAmount, 
                0 AS CreditAmount, 
                (select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				Transactions.Amount,
                Transactions.CreatedDate,
				 ROW_NUMBER() OVER (ORDER BY transactions.TransactionId)
FROM   [billing].[transactions] Transactions 
        INNER JOIN [client].[roleplayer] RolePlayer 
               ON transactions.RolePlayerId = roleplayer.roleplayerid
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 1
AND Transactions.TransactionTypeId != 6



update @SearchTable SET creditamount = (creditamount * -1) WHERE creditamount > 0

INSERT INTO @ResultTable
SELECT transactionId,
       transactiondate, 
       transactiontype, 
       documentnumber, 
       reference, 
       [description], 
       debitamount, 
       creditamount, 
       amount, 
       balance,
	   YEAR(transactionDate),
	  (SELECT month(ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactiondate >= p.StartDate
				AND transactiondate <= p.EndDate), transactiondate))),
createddate
FROM   @SearchTable 


SELECT  TransactionDate, 
       TransactionType, 
       DocumentNumber, 
       Reference, 
       [Description], 
       DebitAmount, 
       CreditAmount, 
       Balance,
       Amount,
       [year],
      [period] 
FROM   @ResultTable 
where transactiontype not in ('Payment Allocation','Payment Allocation Reversal',
                              'Claim Recovery Invoice', 'Claim Recovery Payment', 'Claim Recovery Payment Reversal')
AND (@period = 0 OR @period IS NULL OR [period] = @period)
AND (@startDate IS NULL OR transactiondate >= @startDate)
AND (@endDate IS NULL OR transactiondate <= @endDate)
ORDER  BY transactiondate ASC
END