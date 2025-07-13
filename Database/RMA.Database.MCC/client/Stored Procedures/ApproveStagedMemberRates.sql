CREATE PROCEDURE [client].[ApproveStagedMemberRates]
	@IndustryClassId INT = NULL
AS 
BEGIN
	WITH LatestStagedRate AS (
	  SELECT [LATESTSTAGEDCLIENTRATE].*, ROW_NUMBER() OVER (PARTITION BY memberNo, Product, Category ORDER BY ratingYear DESC) AS rn
	    FROM [Load].Rates AS [LATESTSTAGEDCLIENTRATE]
	) 
INSERT INTO [client].[Rates] ([Product], [MemberNo], Category, Rate, RatingYear, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate) 
SELECT 
     LatestStagedRate.Product
     ,LatestStagedRate.MemberNo
	 ,[CATEGORY].[Id]
	,LatestStagedRate.Rate
	,LatestStagedRate.[RatingYear]
	,LatestStagedRate.IsDeleted
	,LatestStagedRate.CreatedBy
	,GETDATE()
	,LatestStagedRate.ModifiedBy
	,GETDATE()
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
	
	ORDER BY LatestStagedRate.MemberNo, LatestStagedRate.[RatingYear]
END;