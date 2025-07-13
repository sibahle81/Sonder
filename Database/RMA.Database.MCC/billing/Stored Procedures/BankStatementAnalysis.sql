-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- EXEC [billing].[GetAllocatedPayments]
-- =============================================
CREATE PROCEDURE [billing].[BankStatementAnalysis]
AS
    

	DECLARE @SearchTable TABLE (
	    ControlNumber VARCHAR(250),
		ControlName VARCHAR(250),
		[Year] INT,
		Period INT,
		DebtorPaymentId INT,
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
		BankCode VARCHAR(100)
	);

    INSERT INTO @SearchTable
	SELECT 
	      CASE WHEN R.RolePlayerIdentificationTypeId = 1 THEN
	  (SELECT TOP 1 Level2 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'Individual')
	  WHEN R.RolePlayerIdentificationTypeId = 2 THEN 
	  (SELECT TOP 1 Level2 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'Group Mining Funeral') END AS ControlNumber
	  , CASE WHEN R.RolePlayerIdentificationTypeId = 1 THEN
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'Individual')
	  WHEN R.RolePlayerIdentificationTypeId = 2 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'Group Mining Funeral') END AS ControlName,
	    YEAR(B.TransactionDate) [Year],
	    MONTH(B.TransactionDate) Period,
		D.DebtorPaymentId,
	    D.BankStatementEntryId,
		B.StatementNumber,
		CAST(B.StatementAndLineNumber AS INT) AS StatementAndLineNumber,
		R.DisplayName,
		B.UserReference,
		B.TransactionDate,
		D.Amount,
		CAST(B.BankAccountNumber AS BIGINT) AS BankAccountNumber,
		D.Reference,
		CASE WHEN D.DebtorPaymentStatusId = 1 THEN 'No' 
		WHEN D.DebtorPaymentStatusId = 2 THEN 'Partial'
		WHEN D.DebtorPaymentStatusId = 3 THEN 'Yes'
		END AS Allocated,
		B.BankBranch
	FROM [billing].[DebtorPayment] D INNER JOIN [finance].[BankStatementEntry] B
	ON D.BankStatementEntryId = B.BankStatementEntryId 
	INNER JOIN [billing].[Transactions] T ON D.TransactionId = T.TransactionId
	INNER JOIN [billing].[Invoice] I ON T.InvoiceId = I.InvoiceId
	INNER JOIN [policy].[Policy] P ON P.PolicyId = I.PolicyId
	INNER JOIN [client].[RolePlayer] R ON P.PolicyOwnerId = R.RolePlayerId
	WHERE D.TransactionId > 0


      SELECT DISTINCT   ControlNumber,
		ControlName,
		[Year],
		Period,
		DebtorPaymentId,
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
		BankCode
	 FROM @SearchTable
