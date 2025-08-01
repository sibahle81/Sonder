CREATE PROCEDURE [product].[ProductOptionListReport]
		@ProductId int = null,
		@PoID int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 

	select  ISNULL(JSON_VALUE(Replace(Replace(RuleConfiguration,'[',''),']',''), '$.fieldName'), R.Name)   AS [Name],
		 ISNULL(JSON_VALUE(Replace(Replace(RuleConfiguration,'[',''),']',''), '$.fieldValue'), 'Yes')  AS [Value] 
	from product.ProductOption PO 
	inner join [product].[ProductOptionRule]  POR on POR.ProductOptionId = PO.ID
	inner join [rules].[Rule] R on R.ID = POR.RuleId
	Where ProductID = ISNULL(@ProductId, ProductId)
	AND PO.ID = @PoID
	
		 
END
