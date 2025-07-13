
CREATE PROCEDURE [policy].[ExpensedBasedPolicyScheduleDeclarationDB]
	@PolicyId INT 
	AS

--Declare @@PolicyId INT 
--Set @@PolicyId = 22492 

BEGIN
	SELECT  TOP(1) 
	  PRODUCTOPTION.[Name] as ProductOptionName
	, ci.[Name] as CategoryInsuredName
	, DECLARATION.AverageEmployeeCount
	, DECLARATION.AverageEarnings
	, DECLARATION.RATE
	, DECLARATION.PREMIUM
	FROM [POLICY].[POLICY] [POLICY]
	INNER JOIN [CLIENT].[ROLEPLAYER] ROLEPLAYER On ROLEPLAYER.RolePlayerId = [POLICY].PolicyOwnerId
	INNER JOIN [CLIENT].[DECLARATION] DECLARATION on DECLARATION.RolePlayerId = ROLEPLAYER.RolePlayerId
	INNER JOIN [PRODUCT].[PRODUCTOPTION] PRODUCTOPTION ON PRODUCTOPTION.ID = DECLARATION.PRODUCTOPTIONID
	INNER JOIN [PRODUCT].[PRODUCTOPTIONCATEGORYINSURED] ProductOptionCategoryInsured ON ProductOptionCategoryInsured.ProductOptionId = PRODUCTOPTION.id
	INNER JOIN [COMMON].CategoryInsured ci on ci.Id = ProductOptionCategoryInsured.CategoryInsuredId
	WHERE [POLICY].PolicyId = @PolicyId AND DECLARATION.ProductOptionId = [POLICY].ProductOptionId ORDER BY 1 DESC
END