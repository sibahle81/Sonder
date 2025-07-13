

-- =============================================
-- Author:		Gram Letoaba
-- Culprits:  Sibahle Senda
-- Create date: 2020/06/23
-- EXEC [billing].[CreditNoteReport] 0, 0, NULL, NULL, NULL
-- =============================================
CREATE PROCEDURE [billing].[CreditNoteReport]
    @StartDate AS DATE,
	@EndDate AS DATE,
	@ControlName AS VARCHAR(150) = null
AS
BEGIN
	DECLARE @SearchTable TABLE (
	    ControlNumber VARCHAR(250),
		ControlName VARCHAR(250),
		[Year] INT,
		Period INT,
		AccountNumber VARCHAR(250),
		DebtorName VARCHAR(250),
		CreditNoteNumber VARCHAR(250),
		CreditNoteDate Date,
		CreditNoteAmount Decimal(18,2),
		UnderwritingYear INT,
		InvoiceNumber VARCHAR(250),
		InvoiceDate Date,
		InvoiceAmount Decimal(18,2),
		Reason VARCHAR(255)
	);

	INSERT INTO @SearchTable
	SELECT DISTINCT
	     CASE WHEN ICD.Id = 4 THEN
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
	  WHEN ICD.Id = 1  THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
	  WHEN ICD.Id = 2 THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
	  WHEN ICD.Id = 3 THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
	  END AS ControlNumber
	  , CASE WHEN ICD.Id = 4 THEN
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
	  WHEN ICD.Id = 1 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1) 
	  WHEN ICD.Id = 2 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2) 
	  WHEN ICD.Id = 3 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
	  END AS ControlName
	  ,YEAR(T.TransactionDate)
	  ,MONTH(T.TransactionDate)
	  ,F.FinPayeNumber
	  ,R.DisplayName
	  , (CASE WHEN (T.bankreference IS NULL OR T.BankReference = '')
				THEN T.RmaReference ELSE T.BankReference END)
	  ,T.TransactionDate
	  ,T.Amount
	  ,YEAR(T.TransactionDate)
	  ,I.InvoiceNumber
	  ,I.InvoiceDate
	  ,I.TotalInvoiceAmount
	  , isnull((case when t.Reason like '%Cancel%' then 'Cancellation Credit Note' 
	    when t.Reason like '%Lapse%' then 'Lapse Credit Note'
		when t.Reason like '%Adjust%' then 'Adjustment'
		when t.RmaReference like '%Cancel%' then 'Cancellation Credit Note'
		when t.RmaReference like '%Lapse%' then 'Lapse Credit Note'
		when t.RmaReference like '%Adjust%' then 'Adjustment'
		when i.InvoiceNumber like '%Lapse%' then 'Lapse Credit Note'
		when i.InvoiceNumber like '%Cancel%' then 'Cancellation Credit Note'
		when i.InvoiceNumber like '%Adjust%' then 'Adjustment' else t.Reason end), '')
  FROM [billing].[Transactions] T
  INNER JOIN [client].[FinPayee] F ON T.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [billing].[InvoiceAllocation] IA ON IA.TransactionId = T.TransactionId
  INNER JOIN [billing].[Invoice] I ON I.InvoiceId = IA.InvoiceId
  INNER JOIN [policy].[Policy] P ON P.PolicyId = I.PolicyId
   INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
  INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
  WHERE T.[TransactionTypeId] = 4 -- credit note

  INSERT INTO @SearchTable
	SELECT DISTINCT
	  CASE WHEN R.RolePlayerIdentificationTypeId = 1 THEN
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
	  WHEN R.RolePlayerIdentificationTypeId = 2 THEN 
	  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN') END AS ControlNumber
	  , CASE WHEN R.RolePlayerIdentificationTypeId = 1 THEN
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
	  WHEN R.RolePlayerIdentificationTypeId = 2 THEN 
	  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN') END AS ControlName
	  ,YEAR(T.TransactionDate)
	  ,MONTH(T.TransactionDate)
	  ,F.FinPayeNumber
	  ,R.DisplayName
	  ,T.BankReference
	  ,T.TransactionDate
	  ,T.Amount
	  ,YEAR(T.TransactionDate)
	  ,'' InvoiceNumber
	  ,NULL InvoiceDate
	  ,NULL TotalInvoiceAmount
	  , isnull((case when t.Reason like '%Cancellation%' then 'Cancellation Credit Note' else t.Reason end), '')
  FROM [billing].[Transactions] T 
  INNER JOIN [client].[FinPayee] F ON T.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  LEFT OUTER JOIN [billing].[InvoiceAllocation] IA ON IA.TransactionId = T.TransactionId
  WHERE T.[TransactionTypeId] = 4 -- credit note
  and IA.InvoiceAllocationId IS NULL

    	 IF @ControlName IS NOT NULL
	 BEGIN
  SELECT DISTINCT ControlNumber,
		ControlName,
		[Year],
		Period,
	    AccountNumber,
		DebtorName,
		CreditNoteNumber,
		CreditNoteDate,
		CreditNoteAmount,
		UnderwritingYear,
		InvoiceNumber,
		InvoiceDate,
		InvoiceAmount,
		Reason
	FROM @SearchTable
	WHERE (CreditNoteDate BETWEEN @StartDate AND @EndDate)AND ControlName LIKE '%'+@ControlName+'%'
	END ELSE
	BEGIN
  SELECT DISTINCT ControlNumber,
		ControlName,
		[Year],
		Period,
	    AccountNumber,
		DebtorName,
		CreditNoteNumber,
		CreditNoteDate,
		CreditNoteAmount,
		UnderwritingYear,
		InvoiceNumber,
		InvoiceDate,
		InvoiceAmount,
		Reason
	FROM @SearchTable
	WHERE (CreditNoteDate BETWEEN @StartDate AND @EndDate)
	END

END
