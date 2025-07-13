CREATE PROCEDURE [claim].[FuneralClaimProductOption]
AS
BEGIN
	WITH Product_CTE([ProductOption],ColumnNumber) AS(
      SELECT 
         'ALL' AS [ProductOption],
	      1 AS [ColumnNumber]
          UNION
		  SELECT distinct [Name] as [ProductOption],
		  2 AS [ColumnNumber]
         from product.ProductOption 
		  )
SELECT [ProductOption] from Product_CTE
		
END