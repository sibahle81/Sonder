CREATE PROCEDURE [billing].[BankStatementAnalysisReport]
       @StartDate AS DATE,
       @EndDate AS DATE,
       @BankAccountNumber AS VARCHAR(50)
AS


IF @BankAccountNumber = '-1'
       begin
        set @BankAccountNumber  = NULL
       end

BEGIN

       DECLARE @SearchTable TABLE (
              ControlNumber VARCHAR(250),
              ControlName VARCHAR(250),
              [Year] INT,
              Period INT,
              TransactionId INT,
              BankStatementEntryId INT,
              StatementNumber INT,
              StatementLineNumber INT,
              DebtorName VARCHAR(250),
              UserReference VARCHAR(250),
              TransactionDate Date,
              Amount Decimal(18,2),
              BankAccountNumber BIGINT,
              RMAReference VARCHAR(250),
              Allocated VARCHAR(25),
              BankCode VARCHAR(100),
              ErrorCode VARCHAR(25)
       );

       DECLARE @BankAccountNumberWithLeadingZeros varchar(17);

       SELECT @BankAccountNumber = @BankAccountNumber;
       SELECT @BankAccountNumberWithLeadingZeros = CONCAT('00000', @BankAccountNumber);

    INSERT INTO @SearchTable
       SELECT DISTINCT
         CASE WHEN (B.BankAccountNumber = '0000062679223942')  THEN --FUN
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
         WHEN (B.BankAccountNumber = '0000050510037788')  THEN 
         (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
         WHEN (B.BankAccountNumber = '0000062684073142') THEN --
         (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
         WHEN (B.BankAccountNumber = '0000062775460646') THEN 
         (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
         WHEN (B.BankAccountNumber = '0000062512854169') THEN --Metal
         (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE  Origin = 'RMA COID METALS')
		 END AS ControlNumber
         , CASE WHEN (B.BankAccountNumber = '0000062679223942') THEN
         (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
         WHEN (B.BankAccountNumber = '0000050510037788') THEN 
         (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1) 
         WHEN (B.BankAccountNumber = '0000062684073142') THEN 
         (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2) 
         WHEN (B.BankAccountNumber = '0000062775460646') THEN 
         (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
         WHEN (B.BankAccountNumber = '0000062512854169') THEN --Metal
         (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType]  WHERE  Origin = 'RMA COID METALS')      
		 END AS ControlName,
           YEAR(B.TransactionDate) [Year],
           (SELECT month(ISNULL(StartDate, B.TransactionDate)) FROM
          (SELECT TOP 1 p.StartDate FROM [common].[Period] p WHERE B.TransactionDate >= p.StartDate
          AND B.TransactionDate <= p.EndDate) as StartDate) Period,
              T.TransactionId,
			  B.BankStatementEntryId,
              B.StatementNumber,
              B.StatementLineNumber,
              ISNULL(F.FinPayeNumber,'UNKNOWN'),
              B.UserReference,
              B.TransactionDate,
              CASE WHEN B.DebitCredit = '-' THEN (-1 * ( CONVERT(DECIMAL(18,2),B.NettAmount)/100))
              ELSE CONVERT(DECIMAL(18,2),( CONVERT(DECIMAL(18,2),B.NettAmount)/100)) END,
              CAST(B.BankAccountNumber AS BIGINT) AS BankAccountNumber,
              ISNULL(T.RmaReference, ISNULL(T.BankReference, (SELECT CONCAT(B.StatementNumber, '/', B.StatementLineNumber, ' ', (SELECT FORMAT (b.TransactionDate, 'dd/MM/yyyy')))))),
              CASE
              WHEN (EXISTS (SELECT ia.TransactionId from [billing].[InvoiceAllocation] ia WHERE ia.TransactionId = T.TransactionId)
                    AND NOT EXISTS (SELECT LinkedTransactionId FROM [billing].[Transactions] 
									where LinkedTransactionId = T.TransactionId 
									AND TransactionTypeId in (1,2)) 
					AND CASE WHEN B.DebitCredit = '-' THEN (-1 * ( CONVERT(DECIMAL(18,2),B.NettAmount)/100))
					ELSE CONVERT(DECIMAL(18,2),( CONVERT(DECIMAL(18,2),B.NettAmount)/100)) END-T.Amount = 0 --OR
                       --(T.LinkedTransactionId IS NOT NULL)
					   )
              THEN 'Yes'
              WHEN B.DocumentType = 'PT'
              THEN 'Yes'
              WHEN T.TransactionId IS NULL THEN 'No'
              ELSE 'Partly'
              END AS Allocated,
              B.BankBranch,
              ''
	FROM [finance].[BankStatementEntry] B
	LEFT JOIN [billing].[Transactions] T ON B.BankStatementEntryId = T.BankStatementEntryId and T.IsDeleted = 0
	LEFT JOIN [client].[FinPayee] F ON T.RolePlayerId=F.RolePlayerId and F.IsDeleted = 0
	WHERE B.BankStatementEntryId > 0
	AND B.RecordID = '91'
	AND (@BankAccountNumber IS NULL OR B.BankAccountNumber = @BankAccountNumber OR B.BankAccountNumber = @BankAccountNumberWithLeadingZeros)
	AND (B.StatementDate BETWEEN @StartDate AND @EndDate)
	AND (B.DocumentType <> 'PT'
	OR (B.DocumentType = 'PT' AND T.BankStatementEntryId IS NOT NULL))

    SELECT  ControlNumber,
            ControlName,
            [Year],
            Period,
            TransactionId,
            BankStatementEntryId,
            StatementNumber,
            StatementLineNumber,
            DebtorName,
            UserReference,
            TransactionDate,
            Amount,
            BankAccountNumber,
            RMAReference,
            Allocated,
            BankCode,
            ErrorCode
    FROM @SearchTable
END