 
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- dbo.ProductBenefitListReport 16
CREATE PROCEDURE [product].ProductBenefitListReport
		@ProductId int = null,
		@BenefitID int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 

	Select
		 ISNULL(JSON_VALUE(Replace(Replace(RuleConfiguration,'[',''),']',''), '$.fieldName'), R.Name)   AS [Name],
		 ISNULL(JSON_VALUE(Replace(Replace(RuleConfiguration,'[',''),']',''), '$.fieldValue'), 'Yes')  AS [Value]
	From [product].[BenefitRule] BR 
			inner join product.Benefit B on B.Id = BR.BenefitId 
			inner join [rules].[Rule] R on R.ID = BR.RuleId
	Where ProductID = ISNULL(@ProductId, B.ProductId)	
	AND BR.BenefitID = 	@BenefitID 
END
