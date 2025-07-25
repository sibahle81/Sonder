-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [billing].[SalesDistributionReport]
    @StartDate AS DATE,
	@EndDate AS DATE,
	@ProductClassName AS VARCHAR(50)
AS 
BEGIN  

SELECT 
	Class.Name AS [Class],
	'('+Product.[Code]+') ' + Product.[Name] AS [Product],
	'('+ProductOption.[Code]+') '+ ProductOption.[Name] AS [Product Option],
	SUM(Policy.[AnnualPremium]) AS [Total Premium],
	(SUM(Policy.[AnnualPremium]))*12 AS [Annualised Premium],
	COUNT(InsuredLives.[RoleplayerId]) AS [Lives]
FROM [policy].[Policy] Policy
	INNER JOIN [product].[ProductOption] ProductOption ON Policy.[ProductOptionId] = ProductOption.[Id]
	INNER JOIN [product].[Product] Product ON Product.[Id] = ProductOption.[ProductId]
	JOIN [policy].[PolicyInsuredLives] InsuredLives ON InsuredLives.[PolicyId] = Policy.[PolicyId]
	JOIN [common].[ProductClass] Class ON Class.Id =Product.[ProductClassId]
	WHERE Policy.[PolicyInceptionDate] BETWEEN @StartDate AND @EndDate
	AND Class.Name = @ProductClassName
GROUP BY
Class.Name,
	Product.[Code],
	Product.[Name],
	ProductOption.[Code],
	ProductOption.[Name]
ORDER BY Product.[Code], ProductOption.[Code]
END  
