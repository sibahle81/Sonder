CREATE  PROCEDURE [billing].[SummaryAgeAnalysisReport]

	@clientTypeId int,
	@ageTypeId int,
	@debtorStatus int,
	@assignedStatus int,
	@balanceTypeId int,
	@industryId int,
	@endDate datetime,
	@includeInterest bit,
	@includeNotes bit,
	@counter int,
	@ProductId int

AS
BEGIN

	--DECLARE @clientTypeId INT = 0               -- 0=all 1=individual 2=group 3=corporate
	--DECLARE @ageTypeId INT = 0                  -- 0=all 1=current 2=30 days 3=60 days 4=90 days 5=120 days 6=120+ days
	--DECLARE @debtorStatus INT = 0               -- 0=all 1=active 2=inactive
	--DECLARE @assignedStatus INT = 0             -- 0=all 1=assigned to debtors clerk 2=unassigned to clerk
	--DECLARE @balanceTypeId INT = 0              -- 0=all 1=all non-zero 2=greater than zero 3=less than zero
	--DECLARE @industryId INT = 0                 -- 0=all, rest read FROM common.IndustryClass
	--DECLARE @EndDate DATETIME =  DATEADD(yy, DATEDIFF(yy, 0, GETDATE()) + 1, -1)
	--DECLARE @includeINTerest bit = 0
	--DECLARE @Counter INT = 1
	--DECLARE @ProductId int =0

	SET NOCOUNT ON  
	
	IF @ProductId = 0
	 BEGIN
	   SELECT @ProductId = NULL;
	END  

	IF @ageTypeId > 0 BEGIN
		IF @balanceTypeId = 0 BEGIN
			SET @balanceTypeId = 1
		END
	END

	DECLARE @transactions TABLE ([ProductName] varchar(50),
		[TransactionId] INT,
		[AcCOUNTId] INT,
		[CollectionAgent] VARCHAR(128),
		[DebtorsClerk] VARCHAR(128),
		[StatusId] INT,
		[Year] INT,
		[Month] INT,
		[AccountNumber] VARCHAR(32),
		[ClientName] VARCHAR(128),
		[ClientTypeId] INT,
		[IndustryClassId] INT,
		[TransactionDate] DATE,
		[Period] INT,
		[Amount] FLOAT,
		[Interest] FLOAT,
		[CreatedDate] DATE,
		[Balance] FLOAT,
		[RowNumber] INT,
		INDEX tidx_clientTypeId ([ClientTypeId]),
		INDEX tidx_statusId ([StatusId]),
		INDEX tidx_industryClassId ([IndustryClassId]),
		INDEX tidx_collectionAgent ([CollectionAgent])
	)

	INSERT INTO @transactions ([ProductName],[TransactionId], [AcCOUNTId], [AcCOUNTNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [YEAR], [MONTH], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance], [RowNumber])
		SELECT DISTINCT 
			prod.[Name] as [ProductName],
			bt.[TransactionId],
		    rp.[RolePlayerId] [AcCOUNTId],
			fp.[FinPayeNumber] [AcCOUNTNumber],
			rp.[DisplayName] [ClientName],
			CASE ISNULL(c.[RolePlayerId], 0) WHEN 0 THEN 1 ELSE (CASE RIGHT(ISNULL(c.[ReferenceNumber], '99'), 2) WHEN '99' THEN 2 ELSE 3 END) END [ClientTypeId],
			ISNULL(aaa.[CollectionAgent], '') [CollectionAgent],
			ISNULL(aaa.[DebtorsClerk], '') [DebtorsClerk],
			ISNULL(ind.[IndustryClassId], 0) [IndustryClassId],
			ISNULL(tp.[PolicyStatusId], 0) [StatusId],
			YEAR(bt.[TransactionDate]) [Year],
			MONTH(bt.[TransactionDate]) [Month],
			bt.[TransactionDate],
			MONTH(bt.[TransactionDate]) [Period],
			(CASE bt.[TransactionTypeId] WHEN 7 THEN 0.00 ELSE CASE ttl.[IsDebit] WHEN 1 THEN ABS(bt.[Amount]) ELSE -ABS(bt.[Amount]) END END) [Amount],
			(CASE bt.[TransactionTypeId] WHEN 7 THEN CASE ttl.[IsDebit] WHEN 1 THEN ABS(bt.[Amount]) ELSE -ABS(bt.[Amount]) END ELSE 0.00 END) [Interest],
			bt.CreatedDate,
			--(dbo.GetTransactionBalance(TransactionId)),
			CASE WHEN ttl.IsDebit = 1 THEN bt.Amount ELSE - bt.Amount END AS [Balance],
			ROW_NUMBER() OVER (PARTITION BY bt.TransactionId ORDER BY bt.TransactionId)
		FROM [client].[RolePlayer] rp
			INNER JOIN [client].[FinPayee] fp ON fp.[RolePlayerId] = rp.[RolePlayerId]
			INNER JOIN [billing].[Transactions] bt ON bt.[RolePlayerId] = rp.[RolePlayerId]
			INNER JOIN [billing].[TransactionTypeLink] ttl ON ttl.[Id] = bt.[TransactionTypeLinkId]
			LEFT JOIN [billing].[AgeAnalysisAgent] aaa ON aaa.[RolePlayerId] = rp.[RolePlayerId]
			LEFT JOIN [client].[Company] c ON c.[RolePlayerId] = rp.[RolePlayerId]
			LEFT JOIN [common].[Industry] ind ON ind.[Id] = fp.[IndustryId]
			LEFT JOIN (
				SELECT [PolicyId],
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId],
					COUNT(*) [Policies],
					[ProductOptionId]
				FROM [policy].[Policy]
				GROUP BY [PolicyId],	
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId],
					[ProductOptionId]
				having COUNT(*) = 1
			) tp ON tp.[PolicyOwnerId] = rp.[RolePlayerId]
			left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
			left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
		WHERE bt.[CreatedDate] <= @EndDate
			AND bt.[TransactionTypeId] != CASE @includeInterest WHEN 1 THEN 99999 ELSE 7 END
			AND EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= bt.TransactionDate AND p.[Status] != 'Future')
			AND ISNULL(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, ISNULL(ind.[IndustryClassId], 0))
			-- Exclude claims transactions
			AND bt.[TransactionTypeId] not in (14, 15, 16)
			AND bt.[TransactionTypeId] = 6
			AND (prod.[Id] = @ProductId or @ProductId is null )
		ORDER BY bt.[TransactionDate]

    INSERT INTO @transactions ([ProductName],[TransactionId], [AcCOUNTId], [AcCOUNTNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [YEAR], [MONTH], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance], [RowNumber])
        SELECT DISTINCT 
			prod.[Name] as [ProductName],
			bt.[TransactionId],
			rp.[RolePlayerId] [AcCOUNTId],
			fp.[FinPayeNumber] [AcCOUNTNumber],
			rp.[DisplayName] [ClientName],
			CASE ISNULL(c.[RolePlayerId], 0) WHEN 0 THEN 1 ELSE (CASE right(ISNULL(c.[ReferenceNumber], '99'), 2) WHEN '99' THEN 2 ELSE 3 END) END [ClientTypeId],
			ISNULL(aaa.[CollectionAgent], '') [CollectionAgent],
			ISNULL(aaa.[DebtorsClerk], '') [DebtorsClerk],
			ISNULL(ind.[IndustryClassId], 0) [IndustryClassId],
			ISNULL(tp.[PolicyStatusId], 0) [StatusId],
			YEAR(bt.[TransactionDate]) [Year],
			MONTH(bt.[TransactionDate]) [Month],
			bt.[CreatedDate],
			MONTH(bt.[TransactionDate]) [Period],
			(CASE bt.[TransactionTypeId] WHEN 7 THEN 0.00 ELSE CASE ttl.[IsDebit] WHEN 1 THEN ABS(bt.[Amount]) ELSE -ABS(bt.[Amount]) END END) [Amount],
			(CASE bt.[TransactionTypeId] WHEN 7 THEN CASE ttl.[IsDebit] WHEN 1 THEN ABS(bt.[Amount]) ELSE -ABS(bt.[Amount]) END ELSE 0.00 END) [Interest],
			bt.CreatedDate,
			(dbo.GetTransactionBalance(TransactionId)),
			ROW_NUMBER() OVER (PARTITION BY bt.TransactionId ORDER BY bt.TransactionId)
		FROM [client].[RolePlayer] rp
			INNER JOIN [client].[FinPayee] fp ON fp.[RolePlayerId] = rp.[RolePlayerId]
			INNER JOIN [billing].[Transactions] bt ON bt.[RolePlayerId] = rp.[RolePlayerId]
			INNER JOIN [billing].[TransactionTypeLink] ttl ON ttl.[Id] = bt.[TransactionTypeLinkId]
			LEFT JOIN [billing].[AgeAnalysisAgent] aaa ON aaa.[RolePlayerId] = rp.[RolePlayerId]
			LEFT JOIN [client].[Company] c ON c.[RolePlayerId] = rp.[RolePlayerId]
			LEFT JOIN [common].[Industry] ind ON ind.[Id] = fp.[IndustryId]
			LEFT JOIN (
				SELECT [PolicyId],
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId],
					COUNT(*) [Policies],
					[ProductOptionId]
				FROM [policy].[Policy]
				GROUP BY [PolicyId],	
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId],
					[ProductOptionId]
				HAVING COUNT(*) = 1
			) tp ON tp.[PolicyOwnerId] = rp.[RolePlayerId]
			left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
			left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
		WHERE bt.[CreatedDate] <= @EndDate
			AND bt.[TransactionTypeId] != CASE @includeInterest WHEN 1 THEN 99999 ELSE 7 END
			AND NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate AND p.[Status] = 'Future') 
			AND ISNULL(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, ISNULL(ind.[IndustryClassId], 0))
			-- Exclude claims transactions
			AND bt.[TransactionTypeId] not in (14, 15, 16)
			AND bt.[TransactionTypeId] != 6
			AND (prod.[Id] = @ProductId or @ProductId is null )
		ORDER BY bt.[CreatedDate]

    DELETE t FROM @transactions t WHERE t.RowNumber <> 1

	if (@clientTypeId > 0) BEGIN
		DELETE FROM @transactions WHERE [ClientTypeId] != @clientTypeId
	END

	if @assignedStatus = 1 BEGIN
		 DELETE FROM @transactions WHERE [CollectionAgent] = ''
	END ELSE if @assignedStatus = 2 BEGIN
		DELETE FROM @transactions WHERE [CollectionAgent] != ''
	END

	DECLARE @analysis TABLE (
		[ProductName] varchar(50),
		[AcCOUNTId] INT,
		[AcCOUNTNumber] VARCHAR(32),
		[ClientName] VARCHAR(128),
		[ClientType] VARCHAR(64),
		[Industry] VARCHAR(64),
		[Status] VARCHAR(16),
		[CollectionAgent] VARCHAR(128),
		[DebtorsClerk] VARCHAR(128),
		[Balance] FLOAT,
		[Interest] FLOAT,
		[Current] FLOAT,
		[30Days] FLOAT,
		[60Days] FLOAT,
		[90Days] FLOAT,
		[120Days] FLOAT,
		[120PlusDays] FLOAT,
		[FilterAmount] FLOAT,
		INDEX tidx_filterAmount ([FilterAmount])
	)

	UPDATE @transactions set [StatusId] = 1 WHERE [StatusId] NOT IN (2, 4, 5, 8, 11, 13)

	if (@debtorStatus = 1) BEGIN
		DELETE FROM @transactions WHERE [StatusId] != 1
	END ELSE if (@debtorStatus = 2) BEGIN
		DELETE FROM @transactions WHERE [StatusId] = 1
	END

	INSERT INTO @analysis ([ProductName],[AcCOUNTId], [AcCOUNTNumber], [ClientName], [ClientType], [Industry], [Status], [CollectionAgent], [DebtorsClerk], [Balance], [Interest], [Current], [30Days], [60Days], [90Days], [120Days], [120PlusDays], [FilterAmount])
		SELECT 
		t.[ProductName],
		t.[AcCOUNTId],
		t.[AcCOUNTNumber],
		t.[ClientName],
		CASE t.[ClientTypeId] WHEN 1 THEN 'Individual' WHEN 2 THEN 'Group' WHEN 3 THEN 'Corporate' ELSE 'Unknown' END [ClientType],
		cit.[Name] [Industry],
		CASE t.[StatusId] WHEN 1 THEN 'Active' ELSE 'Inactive' END [Status],
		t.[CollectionAgent],
		t.[DebtorsClerk],
		SUM([Balance]) [Balance],
		SUM([Interest]) [Interest],
		SUM(CASE WHEN DATEDIFF(DAY, [TransactionDate], GETDATE()) < 30  THEN [Balance] ELSE 0.00 END) [Current],
		SUM(CASE WHEN DATEDIFF(DAY, [TransactionDate], GETDATE()) >= 30 AND DATEDIFF(DAY, [TransactionDate], GETDATE()) < 60 THEN [Balance] ELSE 0.00 END) [30Days],
		SUM(CASE WHEN DATEDIFF(DAY, [TransactionDate], GETDATE()) >= 60 AND DATEDIFF(DAY, [TransactionDate], GETDATE()) < 90 THEN [Balance] ELSE 0.00 END) [60Days],
		SUM(CASE WHEN DATEDIFF(DAY, [TransactionDate], GETDATE()) >= 90 AND DATEDIFF(DAY, [TransactionDate], GETDATE()) < 120 THEN [Balance] ELSE 0.00 END) [90Days],
		SUM(CASE WHEN DATEDIFF(DAY, [TransactionDate], GETDATE()) >= 120 AND DATEDIFF(DAY, [TransactionDate], GETDATE()) < 150 THEN [Balance] ELSE 0.00 END) [120Days],
		SUM(CASE WHEN (DATEDIFF(DAY, [TransactionDate], GETDATE()) >= 150) THEN [Balance] ELSE 0.00 END) [120PlusDays],
		0.00 [FilterAmount]
	FROM @transactions t
	    LEFT JOIN [common].[IndustryClass] cit ON cit.[Id] = t.IndustryClassId
	GROUP BY t.[AcCOUNTId],
		t.[AcCOUNTNumber],
		t.[StatusId],
		t.[CollectionAgent],
		t.[DebtorsClerk],
		t.[ClientName],
		t.[ClientTypeId],
		cit.[Name],
		t.[ProductName]

	IF @ageTypeId = 0 BEGIN
		UPDATE @analysis set [FilterAmount] = [Balance]
	END ELSE if @ageTypeId = 1 BEGIN
		UPDATE @analysis set [FilterAmount] = [Current]
	END ELSE if @ageTypeId = 2 BEGIN
		UPDATE @analysis set [FilterAmount] = [30Days]
	END ELSE if @ageTypeId = 3 BEGIN
		UPDATE @analysis set [FilterAmount] = [60Days]
	END ELSE if @ageTypeId = 4 BEGIN
		UPDATE @analysis set [FilterAmount] = [90Days]
	END ELSE if @ageTypeId = 5 BEGIN
		UPDATE @analysis set [FilterAmount] = [120Days]
	END ELSE if @ageTypeId = 6 BEGIN
		UPDATE @analysis set [FilterAmount] = [120PlusDays]
	END

	IF @balanceTypeId = 1 BEGIN	         -- All non-zero
		DELETE FROM @analysis WHERE ROUND([FilterAmount], 2) = 0.00
	END ELSE IF @balanceTypeId = 2 BEGIN -- Greater than zero
		DELETE FROM @analysis WHERE ROUND([FilterAmount], 2) <= 0.00
	END ELSE IF @balanceTypeId = 3 BEGIN -- Less than zero
		DELETE FROM @analysis WHERE ROUND([FilterAmount], 2) >= 0.00
	END

	DELETE a1 FROM @analysis a1 WHERE EXISTS (SELECT * FROM @analysis a2 WHERE a2.AcCOUNTId = a1.AcCOUNTId AND a2.[Status] = 'Active') AND a1.[Status] = 'Inactive'

		SELECT  
			a.[Industry],
			a.[ProductName],			
			ISNULL(SUM(a.[Balance]),0) AS [Balance],
			ISNULL(SUM(a.[Interest]),0) AS [Interest],
			ISNULL(SUM(a.[Current]),0) AS [Current],
			ISNULL(SUM(a.[30Days]),0) AS [Balance30Days],
			ISNULL(SUM(a.[60Days]),0) AS  [Balance60Days],
			ISNULL(SUM(a.[90Days]),0) AS  [Balance90Days],
			ISNULL(SUM(a.[120Days]),0) AS  [Balance120Days],
			ISNULL(SUM(a.[120PlusDays]),0) AS  [Balance120PlusDays],
			'' AS [Branch],
			'' AS [ARCurrency],
			'' AS [RepCurrency],
			'' AS [ARAccount]
		FROM	 @analysis a
		GROUP BY a.[Industry],a.[ProductName]
		


END
GO




