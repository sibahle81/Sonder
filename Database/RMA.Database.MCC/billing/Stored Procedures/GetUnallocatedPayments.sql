
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
--Culprits: Sibahle Senda
-- =============================================
CREATE     PROCEDURE [billing].[GetUnallocatedPayments]
	@DateType AS INT = 0,
	@DateFrom AS DATE = NULL, 
	@DateTo AS DATE = NULL,
	@Search AS NVARCHAR(50)= NULL,
	@BankAccNum AS VARCHAR(50) = NULL
   
AS
  BEGIN
    IF @BankAccNum = '' OR @BankAccNum = '0'
	BEGIN
	SET @BankAccNum = null; 
	END

    IF @BankAccNum is not NULL
	BEGIN
	SET @BankAccNum = '00000' + @BankAccNum;
	END       
	
	SELECT U.[UnallocatedPaymentId] AS [UnallocatedPaymentId],
	    U.[BankStatementEntryId] AS [BankStatementEntryId],
		B.[UserReference] AS [UserReference],
		B.[TransactionDate] AS [TransactionDate],
		B.[StatementDate] AS [TransactionDate],
	    B.[HyphenDateProcessed] AS [HyphenDateProcessed],
		B.[HyphenDateReceived] AS [HyphenDateReceived],
		U.[UnallocatedAmount] AS [Amount],
		A.[Name] AS [Status],
		TRIM(REPLACE(B.[BankAccountNumber], '00000', '')) AS [BankAccountNumber],
		B.[UserReference1] AS [UserReference1],
		B.[UserReference2] AS [UserReference2],
		B.[TransactionType] AS [TransactionType],
	    (SELECT CONCAT(B.[StatementNumber], '/', B.[StatementLineNumber], ' ', (SELECT FORMAT (B.[StatementDate], 'dd/MM/yyyy')))) AS [StatementReference],
		CASE WHEN B.DebitCredit = '-' THEN (-1 * ( CONVERT(DECIMAL(18,2),B.NettAmount)/100))
              ELSE CONVERT(DECIMAL(18,2),( CONVERT(DECIMAL(18,2),B.NettAmount)/100)) END AS [OriginalAmount]
	FROM [billing].[UnallocatedPayment] U INNER JOIN [finance].[BankStatementEntry] B
	ON U.[BankStatementEntryId] = B.[BankStatementEntryId]
	INNER JOIN [common].[AllocationProgressStatus] A ON U.[AllocationProgressStatusId] = A.Id
	WHERE U.[UnallocatedAmount] <> 0 and U.[AllocationProgressStatusId] <> 5 and U.isdeleted <>1 
	AND
	B.BankAccountNumber = isnull(@BankAccNum, B.BankAccountNumber)
	AND
	1 = CASE 
			WHEN @DateType = 1 THEN CASE WHEN B.[TransactionDate] BETWEEN @DateFrom AND @DateTo THEN 1 ELSE 0 END								  
			WHEN @DateType = 2 THEN CASE WHEN B.[HyphenDateProcessed] BETWEEN @DateFrom AND @DateTo THEN 1 ELSE 0 END
			WHEN @DateType = 3 THEN CASE WHEN B.[HyphenDateReceived] BETWEEN @DateFrom AND @DateTo THEN 1 ELSE 0 END
			ELSE 1
		END
	AND
	1 = CASE WHEN @Search IS NULL THEN 1 
		ELSE CASE WHEN  (REPLACE(B.[UserReference], ' ', '') LIKE '%'+REPLACE(@Search, ' ', '')+'%' 
						OR REPLACE(B.[UserReference2], ' ', '') LIKE '%'+REPLACE(@Search, ' ', '')+'%'
						OR REPLACE((SELECT CONCAT(B.[StatementNumber], '/', B.[StatementLineNumber], ' ', (SELECT FORMAT (B.[StatementDate], 'dd/MM/yyyy')))), ' ', '') LIKE '%'+REPLACE(@Search, ' ', '')+'%') 
			THEN 1 ELSE 0 
			END 
		END 
 END
GO