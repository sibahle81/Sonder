

CREATE   PROCEDURE [debt].[StatemnetLineDetails_OpenBalance] 
	@invoiceId int
AS
BEGIN
    Declare @SearchTable TABLE
    (
        transactionId INT,
        transactiondate DATETIME,
        transactiontype VARCHAR(50),
        documentnumber VARCHAR(50),
        reference VARCHAR(50),
        [description] VARCHAR(50),
        debitamount DECIMAL(18, 2),
        creditamount DECIMAL(18, 2),
        balance DECIMAL(18, 2),
        amount DECIMAL(18, 2),
        createddate DATETIME,
        rowNumber INT
    );
    Declare @ResultTable TABLE
    (
        transactionId INT,
        transactiondate DATETIME,
        transactiontype VARCHAR(50),
        documentnumber VARCHAR(50),
        reference VARCHAR(50),
        [description] VARCHAR(50),
        debitamount DECIMAL(18, 2),
        creditamount DECIMAL(18, 2),
        amount DECIMAL(18, 2),
        balance DECIMAL(18, 2),
        [year] INT,
        [period] INT,
        createddate DATETIME
    );

    Declare @rolePlayerId int;
    SELECT @rolePlayerId = policyOwnerId FROM [policy].[Policy]
    WHERE PolicyId = @invoiceId

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                invoice.InvoiceDate, 
                transactiontype.NAME, 
                invoice.invoicenumber, 
				ISNULL(transactions.bankreference,Policy.PolicyNumber) bankreference,
				CONCAT('Premium - ', 
                (SELECT DATENAME(month,invoice.InvoiceDate))) AS [description], 
                CASE WHEN transactiontypelink.isdebit = 1 THEN transactions.amount ELSE 0 END AS DebitAmount, 
                CASE WHEN transactiontypelink.isdebit = 0 THEN transactions.amount ELSE 0 END AS CreditAmount, 
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
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
AND Transactions.TransactionTypeId = 6 
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
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
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
AND Transactions.TransactionTypeId = 3 
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
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
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
AND Transactions.TransactionTypeId = 4 
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
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
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
AND Transactions.TransactionTypeId = 19 
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
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
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
AND Transactions.TransactionTypeId = 5  
and Transactions.IsDeleted =0

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.transactiondate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
			    CASE WHEN Transactions.TransactionTypeId = 7 THEN 				 
					(CONCAT(transactiontype.[name], ' - ', 
					 (SELECT DATENAME(month,ISNULL(invoice.InvoiceDate, Transactions.TransactionDate)) )))
				ELSE  (CONCAT(transactiontype.[name], ' - ', 
                 (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) ))) END AS [description],
                transactions.amount AS DebitAmount, 
                0 AS CreditAmount, 
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
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
	   LEFT JOIN [billing].[invoice] Invoice 
               ON invoice.invoiceid = transactions.invoiceid 
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 1
AND Transactions.TransactionTypeId != 6 and Transactions.TransactionTypeId != 8
AND Transactions.IsDeleted =0
AND Transactions.TransactionId not in (Select distinct LinkedTransactionId from billing.transactions
										Where TransactionTypeId =17) 

INSERT INTO @SearchTable 
SELECT          RH.RefundHeaderId,
                transactions.transactiondate, 
                'Refund', 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
			    CONCAT('Refund', ' - ',
                 (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.transactiondate >= p.StartDate
				AND transactions.transactiondate <= p.EndDate), Transactions.TransactionDate)) )) AS [description],
                RH.HeaderTotalAmount AS DebitAmount, 
                0 AS CreditAmount, 
                CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				RH.HeaderTotalAmount,
                transactions.CreatedDate,
				 ROW_NUMBER() OVER (
	             PARTITION BY RH.RefundHeaderId
				 ORDER BY RH.RefundHeaderId
                 ) row_num
FROM   [billing].[RefundHeader] RH
	   INNER JOIN [billing].[RefundHeaderDetail] RHD
	           ON RHD.RefundHeaderId = RH.RefundHeaderId
	  INNER JOIN [billing].[Transactions] transactions ON transactions.LinkedTransactionId = RHD.TransactionId
        INNER JOIN [client].[roleplayer] RolePlayer 
               ON transactions.RolePlayerId = roleplayer.roleplayerid
       INNER JOIN [common].[transactiontype] TransactionType 
               ON transactions.transactiontypeid = transactiontype.id 
       INNER JOIN [billing].[transactiontypelink] TransactionTypeLink 
               ON transactions.transactiontypelinkid = transactiontypelink.id
WHERE  RolePlayer.RolePlayerId = @rolePlayerId
AND TransactionTypeLink.IsDebit = 1
AND Transactions.TransactionTypeId = 8 -- refund
and Transactions.IsDeleted =0

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
FROM   @SearchTable WHERE transactiontype <> 'Refund'

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
FROM   @SearchTable WHERE rowNumber = 1 and transactiontype = 'Refund'

    DECLARE @runningBalance DECIMAL(18, 2) = 0,
			@transactionDate DATETIME, 
			@debitAmount DECIMAL(18, 2), 
			@creditAmount DECIMAL(18, 2),
			@transactionId int


    DECLARE @cursor CURSOR;
    SET @cursor = CURSOR FOR
    SELECT transactionId, transactiondate, debitamount, creditamount
    FROM @SearchTable
    ORDER BY transactiondate, rowNumber;


    OPEN @cursor;
    FETCH NEXT FROM @cursor INTO @transactionId, @transactionDate, @debitAmount, @creditAmount;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @runningBalance = @runningBalance + @debitAmount - @creditAmount;

       UPDATE @ResultTable
        SET balance = @runningBalance
        WHERE transactionId = @transactionId;

        FETCH NEXT FROM @cursor INTO @transactionId, @transactionDate, @debitAmount, @creditAmount;
    END;

    CLOSE @cursor;
    DEALLOCATE @cursor;


	SELECT Top(1) 
	   DebitAmount DebitAmount
FROM   @ResultTable 
where transactiontype not in ('Payment Allocation','Payment Allocation Reversal',
                              'Claim Recovery Invoice', 'Claim Recovery Payment', 'Claim Recovery Payment Reversal')

ORDER  BY transactiondate ASC

END