CREATE PROCEDURE [claim].[FuneralClaimCapturedBrokers]
@ProductOption varchar(MAX)
AS
BEGIN
	IF @ProductOption='All'
	BEGIN
	WITH Brokerage_CTE(ColumnNumber,[Brokerage]) AS(
		 SELECT 
         
	      1 AS [ColumnNumber],'ALL' AS [Brokerage]	
          UNION
		 SELECT DISTINCT
          2 AS [ColumnNumber]	, brg.name  [Brokerage]		
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT JOIN [broker].[brokerage] (NOLOCK) brg ON brg.Id =pol.BrokerageId
		LEFT JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId 
	)
	   SELECT DISTINCT [Brokerage] FROM Brokerage_CTE		
	END
	ELSE 
	BEGIN
	WITH Brokerage_CTE([Brokerage],ColumnNumber) AS(
		 SELECT 
         
	      1 AS [ColumnNumber],'ALL' AS [Brokerage]	
          UNION
		 SELECT DISTINCT
          2 AS [ColumnNumber]	,brg.name  [Brokerage]		
		FROM [claim].[Claim] (NOLOCK) clm 
		LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
		LEFT JOIN [broker].[brokerage] (NOLOCK) brg ON brg.Id =pol.BrokerageId
		LEFT JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
		 WHERE prod.[description]  IN(select value from string_split( @ProductOption,','))
		  )
   SELECT DISTINCT [Brokerage] FROM Brokerage_CTE			
		END
END