


CREATE PROCEDURE [claim].[FuneralClaimPaidBrokers]
@Product varchar(MAX)
AS
BEGIN
	IF @Product='All'
	BEGIN
	WITH Brokerage_CTE([Brokerage],ColumnNumber) AS(
		 SELECT 
         
	     'ALL' AS [Brokerage], 1 AS [ColumnNumber]
          UNION
		 SELECT DISTINCT
        brg.name  [Brokerage],  2 AS [ColumnNumber]		
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT JOIN [broker].[brokerage] (NOLOCK) brg ON brg.Id =pol.BrokerageId
		INNER JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId 
		INNER JOIN [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
		WHERE clm.ClaimStatusId IN (9,7,6,10)
	)
	   SELECT DISTINCT [Brokerage] FROM Brokerage_CTE		
	END
	ELSE 
	BEGIN
	WITH Brokerage_CTE([Brokerage],ColumnNumber) AS(
		 SELECT 
         
	     'ALL' AS [Brokerage], 1 AS [ColumnNumber]
          UNION
		 SELECT DISTINCT
        brg.name  [Brokerage],  2 AS [ColumnNumber]		
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT JOIN [broker].[brokerage] (NOLOCK) brg ON brg.Id =pol.BrokerageId
		INNER JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
		INNER JOIN [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
		 WHERE clm.ClaimStatusId IN (9,7,6,10)
		 AND ppr.[Name]  IN(select value from string_split( @Product,','))
		  )
   SELECT DISTINCT [Brokerage] FROM Brokerage_CTE			
		END
END