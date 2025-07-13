

CREATE PROCEDURE [billing].GetDebtorStatementHistory 
 @roleplayerId int,
 @startDate date = NULL,
 @endDate date = NULL,
 @policyIds varchar(max)  = NULL
AS
BEGIN
if @endDate is NUll 
begin
set @endDate  =(select getdate())
end

if @startDate is NUll or @startDate ='1 Jan 1900'
begin
set @startDate = (select min(transactiondate) from billing.transactions where roleplayerId = @roleplayerId)
end

    Declare @SearchTable TABLE
    (
        transactionId INT,
        transactiondate DATETIME,
        transactiontype VARCHAR(50),
        documentnumber VARCHAR(50),
        reference VARCHAR(150),
        [description] VARCHAR(50),
        debitamount DECIMAL(18, 2),
        creditamount DECIMAL(18, 2),
        balance DECIMAL(18, 2),
        amount DECIMAL(18, 2),
        createddate DATETIME,
        rowNumber INT,	TransactionTypeId int,
		policynumber varchar(100),
		policyid int
    );
    Declare @ResultTable TABLE
    (
        transactionId INT,
        transactiondate DATETIME,
        transactiontype VARCHAR(50),
        documentnumber VARCHAR(50),
        reference VARCHAR(150),
        [description] VARCHAR(50),
        debitamount DECIMAL(18, 2),
        creditamount DECIMAL(18, 2),
        amount DECIMAL(18, 2),
        balance DECIMAL(18, 2),
        [year] INT,
        [period] INT,
        createddate DATETIME,
		TransactionTypeId int,
		policynumber varchar(100),
		policyid int
    );

   
INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
				Case when Invoice.InvoiceDate > getdate() then Invoice.InvoiceDate else  invoice.CreatedDate end,
                transactiontype.NAME, 
                invoice.invoicenumber, 
				ISNULL(transactions.bankreference,Policy.PolicyNumber) bankreference,
				CONCAT('Premium - ', 
                (SELECT DATENAME(month,invoice.InvoiceDate))) AS [description], 
                CASE WHEN transactiontypelink.isdebit = 1 THEN transactions.amount ELSE 0 END AS DebitAmount, 
                CASE WHEN transactiontypelink.isdebit = 0 THEN transactions.amount ELSE 0 END AS CreditAmount, 
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				--(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId),
				  	TransactionTypeId,
		policynumber,
		policy.policyid
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
                transactions.CreatedDate, 
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
                --(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				 ROW_NUMBER() OVER (ORDER BY transactions.TransactionId),
				 TransactionTypeId,
				'' policynumber ,
				0 policyid
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
and Transactions.transactiondate between @startDate and @endDate

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.CreatedDate,
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
                --(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId),
				   TransactionTypeId,
				'' policynumber ,
				0 policyid
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
and Transactions.transactiondate between @startDate and @endDate

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.CreatedDate, 
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
                --(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId),
				   TransactionTypeId,
				'' policynumber ,
				0 policyid
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
and Transactions.transactiondate between @startDate and @endDate

INSERT INTO @SearchTable 
SELECT         transactions.TransactionId,
               transactions.CreatedDate, 
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
                --(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				 Transactions.Amount,
                 Transactions.CreatedDate,
				  ROW_NUMBER() OVER (ORDER BY transactions.TransactionId),
				   TransactionTypeId,
				'' policynumber ,
				0 policyid
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
and Transactions.transactiondate between @startDate and @endDate

INSERT INTO @SearchTable 
SELECT          transactions.TransactionId,
                transactions.CreatedDate, 
                transactiontype.NAME, 
                CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
				THEN transactions.RmaReference ELSE transactions.BankReference END,
                CASE WHEN Transactions.TransactionTypeId = 7 THEN Replace(transactions.Reason,'12:','')
				 ELSE
					(CASE WHEN (transactions.bankreference IS NULL OR transactions.BankReference = '')
					THEN transactions.RmaReference ELSE transactions.BankReference END)
				 END,
			    CASE WHEN Transactions.TransactionTypeId = 7 THEN 				 
					(CONCAT(transactiontype.[name], ' - ', 
					 (SELECT DATENAME(month,ISNULL(invoice.InvoiceDate, Transactions.CreatedDate)) )))
				ELSE  (CONCAT(transactiontype.[name], ' - ', 
                 (SELECT DATENAME(month,ISNULL((SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE transactions.CreatedDate >= p.StartDate
				AND transactions.CreatedDate <= p.EndDate), Transactions.CreatedDate)) ))) END AS [description],
                transactions.amount AS DebitAmount, 
                0 AS CreditAmount, 
                --(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				Transactions.Amount,
                Transactions.CreatedDate,
				 ROW_NUMBER() OVER (ORDER BY transactions.TransactionId),
				  TransactionTypeId,
				'' policynumber ,
				0 policyid
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
and Transactions.transactiondate between @startDate and @endDate

INSERT INTO @SearchTable 
SELECT          RH.RefundHeaderId,
                transactions.CreatedDate, 
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
                --(select dbo.getTransactionBalance(Transactions.TransactionId)) AS Balance,
				CASE WHEN TransactionTypeLink.IsDebit = 1 THEN Transactions.Amount ELSE - Transactions.Amount END AS Balance,
				RH.HeaderTotalAmount,
                transactions.CreatedDate,
				 ROW_NUMBER() OVER (
	             PARTITION BY RH.RefundHeaderId
				 ORDER BY RH.RefundHeaderId
                 ) row_num,
				  TransactionTypeId,
				'' policynumber ,
				0 policyid
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
and Transactions.transactiondate between @startDate and @endDate
--update @SearchTable SET creditamount = (creditamount * -1) WHERE creditamount > 0

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
createddate, TransactionTypeId,
				policynumber ,
				policyid
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
createddate, TransactionTypeId,
				policynumber ,
				policyid
FROM   @SearchTable WHERE rowNumber = 1 and transactiontype = 'Refund'


    -- Initialize variables for running balance calculation
    DECLARE @runningBalance DECIMAL(18, 2) = 0,
			@transactionDate DATETIME, 
			@debitAmount DECIMAL(18, 2), 
			@creditAmount DECIMAL(18, 2),
			@transactionId int



    -- Cursor to iterate through the result set and calculate running balance
    DECLARE @cursor CURSOR;
    SET @cursor = CURSOR FOR
    SELECT transactionId, transactiondate, debitamount, creditamount
    FROM @SearchTable
    ORDER BY transactiondate, rowNumber;


    OPEN @cursor;
    FETCH NEXT FROM @cursor INTO @transactionId, @transactionDate, @debitAmount, @creditAmount;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Update the running balance
        SET @runningBalance = @runningBalance + @debitAmount - @creditAmount;

        -- Update the balance column in @ResultTable
        UPDATE @ResultTable
        SET balance = @runningBalance
        WHERE transactionId = @transactionId;

        FETCH NEXT FROM @cursor INTO @transactionId, @transactionDate, @debitAmount, @creditAmount;
    END;

    CLOSE @cursor;
    DEALLOCATE @cursor;


	SELECT TransactionDate, 
       TransactionType, 
       DocumentNumber, 
       Reference, 
       [Description], 
	   DebitAmount DebitAmount, 
	   CreditAmount CreditAmount,
	   Balance Balance,
       Amount Amount,
       [year],
       [period],
	   TransactionTypeId,
		policynumber ,
		policyid

FROM   @ResultTable 
where transactiontype not in ('Payment Allocation','Payment Allocation Reversal',
                              'Claim Recovery Invoice', 'Claim Recovery Payment', 'Claim Recovery Payment Reversal')

ORDER  BY transactiondate ASC

END