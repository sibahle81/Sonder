


-- =============================================
-- Author:		Gram Letoaba
-- Create date: 2020/06/23
-- EXEC [billing].[ClawbackReport] 0,0,NULL,NULL,NULL
-- =============================================
CREATE   PROCEDURE [billing].[ClawbackReport]
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
		IntermediaryName VARCHAR(250),
		PolicyNumber VARCHAR(250),
		TransactionDate Date,
		CommissionAmount Decimal(18,2),
		ISFAmount Decimal(18,2)
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
	  ,YEAR(Pa.ModifiedDate)
	  ,MONTH(Pa.ModifiedDate)
	  ,D.RepName
	  ,D.PolicyNumber
	  ,Pa.ModifiedDate
	  ,D.CommissionAmount
	  ,D.AdminServiceFeeAmount
  FROM [payment].[Payment] Pa INNER JOIN [commission].[PaymentInstruction] I
  ON Pa.PaymentInstructionId = I.PaymentInstructionId 
  INNER JOIN [commission].[Header] H ON I.HeaderId = H.HeaderId
  INNER JOIN [commission].[Detail] D ON H.HeaderId = D.HeaderId
  INNER JOIN [policy].[Policy] P ON D.PolicyNumber = P.PolicyNumber
  INNER JOIN [client].[FinPayee] F ON P.PolicyOwnerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
  INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
  WHERE Pa.PaymentTypeId = 2

  	 IF @ControlName IS NOT NULL
	 BEGIN
	   SELECT DISTINCT ControlNumber,
		ControlName,
		[Year],
		Period,
	    IntermediaryName,
		PolicyNumber,
		TransactionDate,
		CommissionAmount,
		ISFAmount
	FROM @SearchTable
	WHERE (TransactionDate BETWEEN @StartDate AND @EndDate)AND ControlName LIKE '%'+@ControlName+'%'
	END ELSE
	BEGIN
	  SELECT DISTINCT ControlNumber,
		ControlName,
		[Year],
		Period,
	    IntermediaryName,
		PolicyNumber,
		TransactionDate,
		CommissionAmount,
		ISFAmount
	FROM @SearchTable
	WHERE (TransactionDate BETWEEN @StartDate AND @EndDate)
	END

END  
