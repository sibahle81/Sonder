CREATE PROCEDURE [client].[NonCompliantRenewals]
	@StartDate DATE = NULL, 
	@EndDate DATE = NULL,
	@IndustryClassId INT = NULL,
	@RolePlayerId INT = NULL
AS 
BEGIN
WITH latestSubmissionForCoverPeriod AS (
	  SELECT [DECLARATION].*, ROW_NUMBER() OVER (PARTITION BY RolePlayerId, PolicyId ORDER BY DeclarationYear DESC) AS rn
	  FROM [client].[RolePlayerPolicyDeclaration] AS [DECLARATION]
	)
	SELECT 
		 [DEBTOR].FinPayeNumber AS [Debtor]
		,[COMPANY].[Name] AS [Display Name]
		,[INDUSTRYCLASS].[Name] AS [Industry Class]
		,[POLICY].[PolicyNumber] AS [Policy Number]
		,[PRODUCTOPTION].[Name] + ' (' + [PRODUCTOPTION].[Code] + ')' AS [Product Option]
		,[RATES].[RatingYear] AS [Cover Period]
		,[latestSubmissionForCoverPeriod].DeclarationYear AS [Latest Submitted]
	FROM [latestSubmissionForCoverPeriod] 
		LEFT JOIN [client].[FinPayee] [DEBTOR] ON [DEBTOR].RolePlayerId = [latestSubmissionForCoverPeriod].[RolePlayerId]
		LEFT JOIN [client].[Company] [COMPANY] ON [latestSubmissionForCoverPeriod].RolePlayerId = [COMPANY].[RolePlayerId]
		LEFT JOIN [policy].[Policy] [POLICY] ON [latestSubmissionForCoverPeriod].PolicyId = [POLICY].PolicyId
		LEFT JOIN [product].[ProductOption] [PRODUCTOPTION] ON [PRODUCTOPTION].Id = [POLICY].[ProductOptionId]
		LEFT JOIN [common].[IndustryClass] [INDUSTRYCLASS] ON [INDUSTRYCLASS].Id = [COMPANY].IndustryClassId
		LEFT JOIN [common].[RolePlayerPolicyDeclarationType] [TYPE] ON [TYPE].Id = [latestSubmissionForCoverPeriod].RolePlayerPolicyDeclarationTypeId

	    LEFT JOIN ( SELECT [LATESTCLIENTRATE].Product, MemberNo, Rate,RatingYear, ROW_NUMBER() OVER (PARTITION BY memberNo, Product ORDER BY ratingYear DESC) AS r
	    FROM [client].Rates AS [LATESTCLIENTRATE]) AS [RATES] ON [RATES].MemberNo = [DEBTOR].FinPayeNumber AND ([PRODUCTOPTION].[Name] = [RATES].Product)
	
	WHERE rn = 1 AND r = 1
	AND([COMPANY].[IndustryClassId] = @IndustryClassId OR @IndustryClassId IS NULL)
	AND([POLICY].[PolicyOwnerId] = @RolePlayerId OR @RolePlayerId IS NULL)
	AND ([latestSubmissionForCoverPeriod].[ModifiedDate] >= @StartDate OR @StartDate IS NULL)
	AND ([latestSubmissionForCoverPeriod].[ModifiedDate] <= @EndDate OR @EndDate IS NULL)
	AND ([RATES].[RatingYear] <> [latestSubmissionForCoverPeriod].DeclarationYear)
	ORDER BY [DEBTOR].FinPayeNumber, [latestSubmissionForCoverPeriod].DeclarationYear;
END