
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 2020/06/23
-- EXEC [billing].[RefundsReport] @StartDate='2020-01-01', @EndDate='2020-09-30'
-- =============================================
CREATE PROCEDURE [finance].[RefundsReport]
    @StartDate AS DATE,
	@EndDate AS DATE
	--,@ControlName AS VARCHAR(150)
AS
BEGIN  

	DECLARE @SearchTable TABLE (
	
		[Account Number] VARCHAR(250),
		[Debtor Name] VARCHAR(250),
		[Refund Number] VARCHAR(250),
		[Refund Date] Date,
		[Refund Amount] Decimal(18,2),
		[Refund Reason] VARCHAR(250),
		[UDR Year] INT,
		ProductCodeId INT,
		[Status] VARCHAR(250),
		BankReference VARCHAR(250),
		TransactionType VARCHAR(50)
	);

	INSERT INTO @SearchTable
	SELECT DISTINCT
	   P.AccountNo		AS [Account Number]
	  --,F.FinPayeNumber	AS [Debtor Name]
	  ,R.DisplayName	AS [Debtor Name]
	  ,H.Reference		AS [Refund Number] 
	  ,H.CreatedDate	AS [Refund Date]
	  ,H.HeaderTotalAmount AS [Refund Amount]	
	  ,H.Reason				AS [Refund Reason]
	  ,YEAR(H.ModifiedDate) AS [UDR Year]
	  ,F.IndustryId			AS ProductCodeId 
	  ,case when S.Name in ('Paid','Reconciled') then 'Allocated' else 'Unallocated' end AS [Status]
	  ,T.BankReference		AS BankReference
	  ,PT.Name				AS TransactionType
  FROM [billing].[RefundHeader] H
  INNER JOIN [client].[FinPayee] F ON H.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
  INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
  INNER JOIN [billing].[Transactions] T ON H.RolePlayerId = T.RolePlayerId
  INNER JOIN [billing].[invoice] I ON T.InvoiceId = I.InvoiceId 
  INNER JOIN [policy].[policy]  POL ON I.PolicyId = POL.PolicyId
  INNER JOIN [payment].[Payment] P ON POL.PolicyId = P.PolicyId
  INNER JOIN [common].[PaymentStatus] S ON P.PaymentStatusId = S.Id
  INNER JOIN common.paymenttype PT ON P.PaymentTypeId = PT.ID 

	
	BEGIN
		SELECT DISTINCT 
				[Account Number]          ,
				[Debtor Name]		      ,
				[Refund Number]           ,
				[Refund Date]			  ,
				[Refund Amount]		   ,
				[Refund Reason]           ,
				[UDR Year]       ,
				ProductCodeId          ,  
				[Status]            ,
				BankReference,
				TransactionType
			FROM @SearchTable
			WHERE ([Refund Date] BETWEEN @StartDate AND @EndDate)
			

	END
  
END