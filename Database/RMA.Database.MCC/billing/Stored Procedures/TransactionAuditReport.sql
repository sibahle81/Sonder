
------ =============================================
------ Author:Mbali Mkhize
------ Create date: 2021/06/01
------ EXEC  [billing].[TransactionAuditReport] '2016-03-01', '2017-12-10','Credit Note',0,'Gold Wage(M+S+C(Unlimited))'
------ =============================================
CREATE PROCEDURE [billing].[TransactionAuditReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@TransactionType VARCHAR(50),
	@IndustryId int,
	@ProductOptionId int
AS

BEGIN 

	IF @IndustryId = 0 BEGIN
		SELECT @IndustryId = NULL;
	END

	IF @ProductOptionId = 0 BEGIN
		SELECT @ProductOptionId = NULL;
	END

	CREATE TABLE #Temp_Audit (
		PolicyNumber varchar(50),
		[Action] varchar(50),
		[User] varchar(50),
		[Date] DATE,
		[Description] varchar(MAX)
	)

IF (@TransactionType ='Invoice')
   BEGIN 
		INSERT INTO #Temp_Audit
		SELECT
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSACTIONS].ModifiedBy as [User],
			[INVOICE].InvoiceDate as [Date],
			CASE
				WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate < GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + '). Payment was expected on or before (' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + '). Invoice status was set to (pending)'
				WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate >= GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + '). Payment is expected by ' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + ' . Invoice status was set to (pending)'
				ELSE [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ')'
			END AS [Description]

		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		INNER JOIN billing.Invoice [INVOICE] ON [TRANSACTIONS].InvoiceId = [INVOICE].InvoiceId 
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRANSACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
		INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
		INNER JOIN [policy].[Policy] [POLICY] ON [ROLEPLAYER].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id
		WHERE --[INVOICE].InvoiceNumber = 'INV:000782'
			 [INVOICE].InvoiceDate BETWEEN @StartDate AND @EndDate
			 AND [TYPE].Name ='Invoice'
			 AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
			 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
						WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
						AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))


	END

	IF (@TransactionType ='Payment Allocation')
	 BEGIN
		INSERT INTO #Temp_Audit
		SELECT DISTINCT 
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[ALLOCATION].ModifiedBy as [User],
			[INVOICE].InvoiceDate as [Date],
			CASE
				WHEN ([ALLOCATION].Amount >= [INVOICE].TotalInvoiceAmount) AND [ALLOCATION].ModifiedBy != 'BackendProcess' THEN '(R' + CONVERT(VARCHAR, [ALLOCATION].Amount) + ') was manually allocated on (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 108) + ') by (' + [ALLOCATION].ModifiedBy + '). Invoice status was set to (paid).'
				WHEN ([ALLOCATION].Amount < [INVOICE].TotalInvoiceAmount) AND [ALLOCATION].ModifiedBy != 'BackendProcess' THEN '(R' + CONVERT(VARCHAR, [ALLOCATION].Amount) + ') was manually allocated on (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 108) + ') by (' + [ALLOCATION].ModifiedBy + '). Invoice status was set to (partially paid).'
			END AS [Description]

		FROM billing.Invoice [INVOICE]
		INNER JOIN billing.InvoiceAllocation [ALLOCATION] ON [INVOICE].InvoiceId = [ALLOCATION].InvoiceId
		LEFT JOIN billing.Transactions [TRANSACTIONS] ON [INVOICE].InvoiceId = [TRANSACTIONS].InvoiceId
		LEFT JOIN [policy].[Policy] [POLICY] ON [TRANSACTIONS].RolePlayerId =[POLICY].PolicyOwnerId
		LEFT JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		LEFT JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id


		WHERE [INVOICE].InvoiceDate BETWEEN @StartDate AND @EndDate
		AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
		AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
					WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
					AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))

	END

IF (@TransactionType ='Credit Note')
   BEGIN 
		INSERT INTO #Temp_Audit
		SELECT
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSACTIONS].ModifiedBy as [User],
			[TRANSACTIONS].TransactionDate as [Date],
			CASE
				WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate < GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + '). Payment was expected on or before (' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + '). Invoice status was set to (pending)'
				WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate >= GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + '). Payment is expected by ' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + ' . Invoice status was set to (pending)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount <= 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was automatically allocated (' + [TRANSACTIONS].RmaReference + '). Invoice status was updated to (paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount > 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was automatically allocated. Invoice status was updated to (partially paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount <= 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRANSACTIONS].ModifiedBy + '). Invoice status was updated to (paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount > 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRANSACTIONS].ModifiedBy + '). Invoice status was updated to (partially paid)'
				ELSE [TYPE].Name + ' (' + ISNULL([TRANSACTIONS].BankReference,[TRANSACTIONS].RmaReference) +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') for (' + [TRANSACTIONS].Reason + ') by (' + [TRANSACTIONS].ModifiedBy + ')'
			END AS [Description]

		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		LEFT JOIN billing.Invoice [INVOICE] ON [TRANSACTIONS].InvoiceId = [INVOICE].InvoiceId 
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRANSACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
		LEFT JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
		LEFT JOIN [policy].[Policy] [POLICY] ON [ROLEPLAYER].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id

		WHERE [TRANSACTIONS].TransactionDate BETWEEN @StartDate AND @EndDate
			 AND [TYPE].Name in ('Credit Note')
			 AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
			 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
						WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
						AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))


	END

IF (@TransactionType ='Payment')
BEGIN
	INSERT INTO #Temp_Audit
	SELECT DISTINCT
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSACTIONS].ModifiedBy as [User],
			 CAST([TRANSACTIONS].CreatedDate AS DATE) as [Date],
			CASE
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount <= 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was automatically allocated (' + [TRANSACTIONS].RmaReference + '). Invoice status was updated to (paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount > 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was automatically allocated. Invoice status was updated to (partially paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount <= 0) THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRANSACTIONS].ModifiedBy + '). Invoice status was updated to (paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount > 0) THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRANSACTIONS].ModifiedBy + '). Invoice status was updated to (partially paid)'
				ELSE [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ')'
			END AS [Description]

		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		INNER JOIN billing.Invoice [INVOICE] ON [TRANSACTIONS].InvoiceId = [INVOICE].InvoiceId 
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRANSACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
		INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
		INNER JOIN [policy].[Policy] [POLICY] ON [ROLEPLAYER].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id

		WHERE CAST([TRANSACTIONS].CreatedDate AS DATE) BETWEEN @StartDate AND @EndDate 
			 AND [TYPE].Name ='Payment'
			 AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
			 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
						WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
						AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))

END

IF (@TransactionType ='Refund')
BEGIN
	INSERT INTO #Temp_Audit
	SELECT	DISTINCT
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSACTIONS].ModifiedBy as [User],
			CAST([TRANSACTIONS].CreatedDate AS DATE) as [Date],
			[TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and by (' + [TRANSACTIONS].ModifiedBy + ')' AS [Description] 
		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		--INNER JOIN billing.Invoice [INVOICE] ON [TRANSACTIONS].InvoiceId = [INVOICE].InvoiceId 
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRANSACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
		INNER JOIN [policy].[Policy] [POLICY] ON [ROLEPLAYER].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id

		WHERE CAST([TRANSACTIONS].CreatedDate AS DATE) BETWEEN @StartDate AND @EndDate 
		     AND [TYPE].Name ='Refund'
			 AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
			 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
						WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
						AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))

 END

 IF (@TransactionType ='Invoice Reversal')
 BEGIN
	INSERT INTO #Temp_Audit
	SELECT	DISTINCT 
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSACTIONS].ModifiedBy as [User],
			CAST([TRANSACTIONS].CreatedDate AS DATE) as [Date],
			[TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ') to reverse  Invoice Number ' + [INVOICE1].InvoiceNumber   AS [Description] 
		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRANSACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
		--INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
		INNER JOIN [policy].[Policy] [POLICY] ON [ROLEPLAYER].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN billing.Transactions bt ON  [TRANSACTIONS].LinkedTransactionId = bt.TransactionId
		INNER JOIN billing.Invoice [INVOICE1] ON bt.InvoiceId = [INVOICE1].InvoiceId 
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id

		WHERE [TYPE].Name ='Invoice Reversal'
		AND CAST([TRANSACTIONS].CreatedDate AS DATE) BETWEEN @StartDate AND @EndDate 
		AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
		AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
				WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
				AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))

 END

  IF (@TransactionType ='Payment Reversal')
 BEGIN
	INSERT INTO #Temp_Audit
	SELECT	DISTINCT 
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSACTIONS].ModifiedBy as [User],
			CAST([TRANSACTIONS].CreatedDate AS DATE) as [Date],
			[TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ') to reverse bank reference ' + [TRANSACTIONS].BankReference   AS [Description] 
		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		INNER JOIN client.RolePlayer [ROLEPLAYER] ON [TRANSACTIONS].RolePlayerId = [ROLEPLAYER].RolePlayerId
		--INNER JOIN common.[InvoiceStatus] [STATUS] ON [INVOICE].InvoiceStatusId = [STATUS].Id
		INNER JOIN [policy].[Policy] [POLICY] ON [ROLEPLAYER].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN billing.Transactions bt ON  [TRANSACTIONS].LinkedTransactionId = bt.TransactionId
		LEFT JOIN billing.Invoice [INVOICE1] ON bt.InvoiceId = [INVOICE1].InvoiceId 
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id

		WHERE [TYPE].Name ='Payment Reversal'
		AND CAST([TRANSACTIONS].CreatedDate AS DATE) BETWEEN @StartDate AND @EndDate 
		AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
		AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
				WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
				AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))

  END


  IF (@TransactionType ='Inter Debtor Transfer')
 BEGIN
	INSERT INTO #Temp_Audit
	
	  SELECT  DISTINCT 
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[TRANSFER].ModifiedBy as [User],
			CAST([TRANSFER].CreatedDate AS DATE) as [Date],
			CASE
				WHEN [STATUS].Name = 'InProgress' THEN 'An amount of (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') will be transferred from debtor account (' + [TRANSFER].FromDebtorNumber + ') into debtor account (' + [TRANSFER].ReceiverDebtorNumber + '). This transfer is (in progress).This transfer was triggered by (' + [TRANSFER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) + ')' 
				WHEN [STATUS].Name = 'UnAllocated' THEN 'An amount of (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') will be transferred from debtor account (' + [TRANSFER].FromDebtorNumber + ') into debtor account (' + [TRANSFER].ReceiverDebtorNumber + '). This transfer has been (de-allocated). This transfer was triggered by (' + [TRANSFER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) + ')'
				WHEN [STATUS].Name = 'Allocated' THEN 'An amount of (R' + CONVERT(VARCHAR, [TRANSFER].TransferAmount) + ') was transferred from debtor account (' + [TRANSFER].FromDebtorNumber + ') into debtor account (' + [TRANSFER].ReceiverDebtorNumber + '). This transfer has been (allocated). This transfer was triggered by (' + [TRANSFER].ModifiedBy + ') on (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSFER].ModifiedDate, 108) + ')'
			END AS [Description]
			FROM billing.InterDebtorTransfer [TRANSFER]
			INNER JOIN common.AllocationProgressStatus [STATUS] ON [STATUS].Id = [TRANSFER].AllocationProgressStatusId
			INNER JOIN Client.FinPayee [FINPAYEE] (NOLOCK) ON [TRANSFER].[ReceiverDebtorNumber] =[FINPAYEE].FinPayeNumber
			INNER JOIN policy.policy [POLICY]  (NOLOCK) ON [FINPAYEE].RolePlayerID =[POLICY].[PolicyOwnerId]
			INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
			LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
			LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
			LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id

			WHERE CAST([TRANSFER].CreatedDate AS DATE) BETWEEN @StartDate AND @EndDate 
			AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
			AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
					WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
					AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))


END

  	IF (@TransactionType ='All')
	 BEGIN
		INSERT INTO #Temp_Audit
		SELECT DISTINCT 
			[POLICY].PolicyNumber PolicyNumber,
			'Modified' [Action],
			[ALLOCATION].ModifiedBy as [User],
			[TRANSACTIONS].TransactionDate as [Date],
			CASE
				WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate < GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + '). Payment was expected on or before (' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + '). Invoice status was set to (pending)'
				WHEN [TYPE].Name = 'Invoice' AND [INVOICE].CollectionDate >= GETDATE() THEN [TYPE].Name + ' (' + [INVOICE].InvoiceNumber + ') for (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was raised on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + '). Payment is expected by ' + CONVERT(VARCHAR, [INVOICE].CollectionDate, 7) + ' . Invoice status was set to (pending)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount <= 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was automatically allocated (' + [TRANSACTIONS].RmaReference + '). Invoice status was updated to (paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy = 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount > 0) THEN [TYPE].Name+ ' (' + [TRANSACTIONS].BankReference +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was automatically allocated. Invoice status was updated to (partially paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount <= 0) THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRANSACTIONS].ModifiedBy + '). Invoice status was updated to (paid)'
				WHEN [TYPE].Name = 'Payment' AND [TRANSACTIONS].ModifiedBy != 'BackendProcess' AND ([INVOICE].TotalInvoiceAmount - [TRANSACTIONS].Amount > 0) THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was received on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and was allocated by (' + [TRANSACTIONS].ModifiedBy + '). Invoice status was updated to (partially paid)'
				WHEN ([ALLOCATION].Amount >= [INVOICE].TotalInvoiceAmount) AND [ALLOCATION].ModifiedBy != 'BackendProcess' THEN '(R' + CONVERT(VARCHAR, [ALLOCATION].Amount) + ') was manually allocated on (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 108) + ') by (' + [ALLOCATION].ModifiedBy + '). Invoice status was set to (paid).'
				WHEN ([ALLOCATION].Amount < [INVOICE].TotalInvoiceAmount) AND [ALLOCATION].ModifiedBy != 'BackendProcess' THEN '(R' + CONVERT(VARCHAR, [ALLOCATION].Amount) + ') was manually allocated on (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [ALLOCATION].CreatedDate, 108) + ') by (' + [ALLOCATION].ModifiedBy + '). Invoice status was set to (partially paid).'
				WHEN [TYPE].Name ='Payment Reversal' THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ') to reverse bank reference ' + [TRANSACTIONS].BankReference
				WHEN [TYPE].Name ='Invoice Reversal' THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ') to reverse  Invoice Number ' + [INVOICE].InvoiceNumber
				WHEN [TYPE].Name ='Refund' THEN [TYPE].Name+ '  of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on ( ' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') and by (' + [TRANSACTIONS].ModifiedBy + ')' 
				ELSE [TYPE].Name+ ' (' + ISNULL([TRANSACTIONS].BankReference,[TRANSACTIONS].RmaReference) +') of (R' + CONVERT(VARCHAR, [TRANSACTIONS].Amount) + ') was processed on (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 107) + ') at (' + CONVERT(VARCHAR, [TRANSACTIONS].CreatedDate, 108) + ') by (' + [TRANSACTIONS].ModifiedBy + ')'
			END AS [Description]

		FROM billing.Transactions [TRANSACTIONS]
		INNER JOIN common.TransactionType [TYPE] ON [TRANSACTIONS].TransactionTypeId = [TYPE].Id
		INNER JOIN billing.Invoice [INVOICE] ON [TRANSACTIONS].InvoiceId = [INVOICE].InvoiceId 
		LEFT JOIN billing.InvoiceAllocation [ALLOCATION] ON [INVOICE].InvoiceId = [ALLOCATION].InvoiceId
		INNER JOIN [policy].[Policy] [POLICY] ON [TRANSACTIONS].RolePlayerId =[POLICY].PolicyOwnerId
		INNER JOIN [product].ProductOption ppo (NOLOCK) on [POLICY].ProductOptionId = ppo.Id
		INNER JOIN client.FinPayee [FINPAYEE] ON [TRANSACTIONS].RolePlayerId = [FINPAYEE].RolePlayerId
		LEFT JOIN  common.Industry ind on ind.Id = [FINPAYEE].IndustryId
	    LEFT JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
		LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id


		WHERE [TRANSACTIONS].TransactionDate BETWEEN @StartDate AND @EndDate
		AND (ppo.[Id] = @ProductOptionId OR @ProductOptionId IS NULL)
		AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
					WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
					AND ind.[Id] = ISNULL([FINPAYEE].IndustryId, ind.[Id]))

	END
		SELECT * FROM #Temp_Audit [TEMP]
		WHERE [TEMP].[Description] IS NOT NULL

		DROP TABLE #Temp_Audit

END