
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 2020/06/23
-- EXEC [billing].[RefundsReport] @StartDate='2020-01-01', @EndDate='2020-09-30'
-- =============================================
CREATE   PROCEDURE [billing].[RefundsReport]
    @StartDate AS DATE,
	@EndDate AS DATE,
	@ControlName AS VARCHAR(150)
AS
BEGIN  

	DECLARE @SearchTable TABLE (
	    ControlNumber VARCHAR(250),
		ControlName VARCHAR(250),
		[Year] INT,
		Period INT,
		AccountNumber VARCHAR(250),
		DebtorName VARCHAR(250),
		RefundNumber VARCHAR(250),
		RefundDate Date,
		RefundAmount Decimal(18,2),
		RefundReason VARCHAR(250),
		UnderwritingYear INT,
		ProductCodeId INT,
		StatusName VARCHAR(250)
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
	  ,YEAR(H.ModifiedDate)
	  ,MONTH(H.ModifiedDate)
	  ,F.FinPayeNumber
	  ,R.DisplayName
	  ,H.Reference
	  ,H.CreatedDate
	  ,H.HeaderTotalAmount
	  ,H.Reason
	  ,YEAR(H.ModifiedDate)
	  ,F.IndustryId
	  ,S.Name
  FROM [billing].[RefundHeader] H
  INNER JOIN [client].[FinPayee] F ON H.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
  INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
  INNER JOIN [payment].[Payment] P ON H.RefundHeaderId = P.RefundHeaderId
  INNER JOIN [common].[PaymentStatus] S ON P.PaymentStatusId = S.Id
   IF @ControlName IS NOT NULL
	 BEGIN
		SELECT DISTINCT ControlNumber,
				ControlName,
				[Year],
				Period,
				AccountNumber,
				DebtorName,
				RefundNumber,
				RefundDate,
				RefundAmount,
				RefundReason,
				UnderwritingYear,
				ProductCodeId,
				StatusName
			FROM @SearchTable
			WHERE (RefundDate BETWEEN @StartDate AND @EndDate)AND ControlName LIKE '%'+@ControlName+'%'
	END ELSE
	BEGIN
		SELECT DISTINCT ControlNumber,
				ControlName,
				[Year],
				Period,
				AccountNumber,
				DebtorName,
				RefundNumber,
				RefundDate,
				RefundAmount,
				RefundReason,
				UnderwritingYear,
				ProductCodeId,
				StatusName
			FROM @SearchTable
			WHERE (RefundDate BETWEEN @StartDate AND @EndDate)
	END
  
END
