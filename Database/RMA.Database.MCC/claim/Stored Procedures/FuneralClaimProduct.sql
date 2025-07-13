CREATE PROCEDURE [claim].[FuneralClaimProduct]
AS
BEGIN
	WITH Product_CTE([Product],ColumnNumber) AS(
      SELECT 
         'ALL' AS [Product],
	      1 AS [ColumnNumber]
          UNION
		  SELECT distinct [Name] as [Product],
		  2 AS [ColumnNumber]
         from product.Product 
		  )
SELECT [Product] from Product_CTE
		
END
GO


