CREATE PROCEDURE [client].[StagedMemberRates]
	@IndustryClassId INT = NULL,
	@RolePlayerId INT = NULL
AS 
BEGIN
	WITH LatestStagedRate AS (
	  SELECT [LATESTSTAGEDCLIENTRATE].*, ROW_NUMBER() OVER (PARTITION BY memberNo, Product, Category ORDER BY ratingYear DESC) AS rn
	    FROM [Load].Rates AS [LATESTSTAGEDCLIENTRATE]
	) 
	SELECT 
     LatestStagedRate.MemberNo AS [Debtor]
	,[COMPANY].[Name] AS [Display Name]
	,[INDUSTRYCLASS].[Name] AS [Industry Class]
	,LatestStagedRate.Product + ' (' + [PRODUCTOPTION].[Code] + ')' AS [Product Option]
	,LatestStagedRate.[RatingYear] AS [Cover Period]
	,[CATEGORY].[Name] AS [Category]
	,LatestStagedRate.Rate
	FROM LatestStagedRate 	
		JOIN [client].[FinPayee] [DEBTOR] ON [DEBTOR].FinPayeNumber = LatestStagedRate.MemberNo
		JOIN [client].[Company] [COMPANY] ON [DEBTOR].RolePlayerId = [COMPANY].[RolePlayerId]
		JOIN [common].[IndustryClass] [INDUSTRYCLASS] ON [INDUSTRYCLASS].Id = [COMPANY].IndustryClassId
		JOIN [product].[ProductOption] [PRODUCTOPTION] ON [PRODUCTOPTION].[Name] = LatestStagedRate.Product
		JOIN [common].[CategoryInsured] [CATEGORY] ON [CATEGORY].Id = LatestStagedRate.Category

		LEFT JOIN (SELECT [LATESTCLIENTRATE].*, ROW_NUMBER() OVER (PARTITION BY memberNo, Product ORDER BY ratingYear DESC) AS r
	    FROM [client].Rates AS [LATESTCLIENTRATE]) AS [RATES] ON [RATES].MemberNo = LatestStagedRate.MemberNo AND [RATES].RatingYear = LatestStagedRate.RatingYear 
		AND([LatestStagedRate].Product = [RATES].Product)

	WHERE  rn = 1 AND (r is null)
	AND([COMPANY].[IndustryClassId] = @IndustryClassId OR @IndustryClassId IS NULL)
	AND([DEBTOR].RolePlayerId = @RolePlayerId OR @RolePlayerId IS NULL)
	
	ORDER BY LatestStagedRate.MemberNo, LatestStagedRate.[RatingYear]
END;