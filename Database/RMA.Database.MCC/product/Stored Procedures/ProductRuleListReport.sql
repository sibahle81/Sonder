Create PROCEDURE [product].[ProductRuleListReport]
		@ProductId int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 

	SELECT 
	 JSON_VALUE(Replace(Replace(RuleConfiguration,'[',''),']',''), '$.fieldName') AS [Name],
	 JSON_VALUE(Replace(Replace(RuleConfiguration,'[',''),']',''), '$.fieldValue') AS [Value]
	FROM [product].[ProductRule]
	Where ProductID = ISNULL(@ProductId, ProductId)
	
		 
END
