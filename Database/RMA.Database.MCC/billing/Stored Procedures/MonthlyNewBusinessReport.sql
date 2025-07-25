-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/14
-- =================================================================
CREATE PROCEDURE [billing].[MonthlyNewBusinessReport]
    @StartDate AS DATE,
	@EndDate AS DATE,
	@ProductName AS VARCHAR(50)
AS 
BEGIN  

SELECT 
    Policy.[PolicyNumber] AS [Policy Number],
	a1.DisplayName AS [Policy Owner],
	Policy.[PolicyInceptionDate] AS [Policy Inception Date],
	Product.[Name] AS [Product],
	ProductOption.[Name] AS [Product Option],
	Policy.[AnnualPremium] AS [Anual Premium],
	Policy.[AnnualPremium]/12 AS [Monthly Premium],
	Brokerage.Name AS [Brokerage],
    a2.FirstName+' '+a2.SurnameOrCompanyName AS [Juristic Representative],
    a3.FirstName+' '+a3.SurnameOrCompanyName AS [Representative]
FROM [policy].[Policy] Policy
	INNER JOIN [product].[ProductOption] ProductOption ON Policy.[ProductOptionId] = ProductOption.[Id]
	INNER JOIN [product].[Product] Product ON Product.[Id] = ProductOption.[ProductId]
	INNER JOIN [broker].[Brokerage] Brokerage ON Policy.BrokerageId = Brokerage.Id
    LEFT JOIN [client].[Roleplayer] a1 ON Policy.[PolicyOwnerId]=a1.RolePlayerId
    LEFT JOIN [broker].[Representative] a2 ON Policy.[JuristicRepresentativeId]=a2.Id
    LEFT JOIN [broker].[Representative] a3 ON Policy.[RepresentativeId]=a3.Id
	WHERE Policy.[PolicyInceptionDate] BETWEEN @StartDate AND @EndDate AND  Product.Name = @ProductName
END  
