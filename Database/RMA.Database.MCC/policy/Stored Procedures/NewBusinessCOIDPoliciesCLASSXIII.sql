CREATE PROCEDURE [policy].[NewBusinessCOIDPoliciesCLASSXIII]
AS
BEGIN

	
	IF(OBJECT_ID('tempdb..#TempNewBusinesCOIDPoliciesCLASSXIII') Is Not Null)
		BEGIN
			DROP TABLE #TempNewBusinesCOIDPoliciesCLASSXIII
		END

	DECLARE @MAX INT = 0;
	
	SELECT number as value, DATENAME(MONTH, '2012-' + CAST(number as varchar(2)) + '-1') Month INTO #TempNewBusinesCOIDPoliciesCLASSXIII
	FROM master..spt_values
	WHERE Type = 'P' AND number BETWEEN 1 AND DATEPART(MONTH, GETDATE())
	ORDER BY Number

	SET @MAX = (SELECT COUNT(*) FROM #TempNewBusinesCOIDPoliciesCLASSXIII);

	ALTER TABLE #TempNewBusinesCOIDPoliciesCLASSXIII
	 ADD NumberOfPolicies INT,
		 NumberOfLives INT,
		 InvoicedRaised DECIMAL(18,2),
		 Payments DECIMAL(18,2),
		 NumberOfPoliciesCancelled INT,
		 NumberOfLivesCancelled INT,
		 CancelledAmount DECIMAL(18,2);

    DECLARE @Month NVARCHAR(15);
	DECLARE @NumberofPolicies INT = 0;
	DECLARE @NumberOfLives INT = 0;
	DECLARE @InvoicedRaised DECIMAL(18,2) = 0;
	DECLARE @Payments DECIMAL(18,2) = 0;
	DECLARE @NumberOfPoliciesCancelled INT = 0;
	DECLARE @NumberOfLivesCancelled INT = 0;
	DECLARE @CancelledAmount DECIMAL(18,2) = 0;
	DECLARE @COUNT INT = 1;

	WHILE @COUNT <= @MAX
	BEGIN
SELECT @Month = DATENAME(month, PP.CreatedDate),
			   @NumberofPolicies = ISNULL( COUNT(*),0) ,
			   @NumberOfLives = ISNULL (SUM(PIL.NumberOfLives),0), 
			   @InvoicedRaised = ISNULL (SUM(Inv.TotalInvoiceAmount),0) ,
			   @Payments = ISNULL (SUM(InvPaid.TotalInvoiceAmount),0)    
   FROM [policy].[Policy] PP INNER JOIN 
        [client].[RolePlayer] CP ON PP.[PolicyOwnerId] = CP.RolePlayerId INNER JOIN
        [client].[Company] CC ON CC.RolePlayerId = CP.RolePlayerId INNER JOIN
		[Product].[ProductOption] PPO ON PP.ProductOptionId = PPO.Id INNER JOIN 
		[Product].[Product] PPR ON PPO.ProductId = PPR.ID INNER JOIN
		(SELECT [Policy].PolicyId,
			COUNT([InsuredLives].RolePlayerId) AS NumberOfLives
			FROM policy.Policy [Policy]
			INNER JOIN policy.PolicyInsuredLives [InsuredLives] ON [Policy].PolicyId = [InsuredLives].PolicyId
			group by [Policy].PolicyId) as PIL on PIL.PolicyId = PP.PolicyId LEFT JOIN
		(SELECT [Policy].PolicyId,
			SUM(BIN.TotalInvoiceAmount) AS TotalInvoiceAmount
			FROM policy.Policy [Policy]
			INNER JOIN [billing].[Invoice] BIN ON [Policy].PolicyId = BIN.PolicyId
			group by [Policy].PolicyId) as Inv on Inv.PolicyId = PP.PolicyId LEFT JOIN
		(SELECT [Policy].PolicyId,
			SUM(BINPaid.TotalInvoiceAmount) AS TotalInvoiceAmount
			FROM policy.Policy [Policy]
			INNER JOIN [billing].[Invoice] BINPaid ON [Policy].PolicyId = BINPaid.PolicyId
			Where BINPaid.InvoiceStatusId = 1
			group by [Policy].PolicyId) as InvPaid on InvPaid.PolicyId = PP.PolicyId 
	WHERE PP.CreatedDate between DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0) and GETDATE()
	AND CC.IndustryClassId = 13 and DATEPART(MONTH, PP.CreatedDate) = @COUNT
	GROUP BY DATENAME(month,PP .CreatedDate)

	
			UPDATE #TempNewBusinesCOIDPoliciesCLASSXIII 
			SET NumberofPolicies = @NumberofPolicies,
			    NumberOfLives = @NumberOfLives,
				InvoicedRaised = @InvoicedRaised,
				Payments = @Payments
			WHERE [Value] = @COUNT

			SET @COUNT = @COUNT + 1

		
	END

	
	SET @COUNT = 1;


	WHILE @COUNT <= @MAX
	BEGIN
	SELECT @NumberOfPoliciesCancelled = ISNULL(COUNT(*),0) ,
		   @Month =  DATENAME(month,[policy].[Policy].CancellationDate),
		   @NumberOfLivesCancelled = ISNULL(COUNT([policy].[PolicyInsuredLives].RolePlayerId),0),
		   @CancelledAmount = ISNULL(SUM([billing].[Invoice].TotalInvoiceAmount),0 ) 
	FROM [policy].[Policy] INNER JOIN
		 [client].[RolePlayer] ON [policy].[Policy] .[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
         [client].[Company] ON [client].[Company].RolePlayerId = [client].[RolePlayer].RolePlayerId LEFT JOIN
		 [policy].[PolicyInsuredLives] ON [Policy].[PolicyId] = [policy].[PolicyInsuredLives].[PolicyId] LEFT JOIN
		 [billing].[Invoice] ON [billing].[Invoice].[PolicyId] = [policy].[Policy].[PolicyId]
	WHERE [policy].[Policy].CancellationDate IS NOT NULL 
    AND [policy].[Policy].CreatedDate between DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0) and GETDATE()
	AND [client].[Company].IndustryClassId = 4 and DATEPART(MONTH, [policy].[Policy].CancellationDate) = @COUNT
	GROUP BY DATENAME(month,[policy].[Policy].CancellationDate)

	
	
			UPDATE #TempNewBusinesCOIDPoliciesCLASSXIII
			SET NumberOfPoliciesCancelled = @NumberOfPoliciesCancelled,
			    NumberOfLivesCancelled = @NumberOfLivesCancelled,
				CancelledAmount = @CancelledAmount
			WHERE [Value] = @COUNT

			SET @COUNT = @COUNT + 1

	  
	END


	

	SELECT Month,
		NumberOfPolicies ,
		 NumberOfLives ,
		 InvoicedRaised,
		 Payments,
		 NumberOfPoliciesCancelled ,
		 NumberOfLivesCancelled ,
		 CancelledAmount FROM #TempNewBusinesCOIDPoliciesCLASSXIII

END