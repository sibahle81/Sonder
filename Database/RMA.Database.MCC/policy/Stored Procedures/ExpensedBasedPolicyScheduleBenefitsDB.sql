
CREATE PROCEDURE [policy].[ExpensedBasedPolicyScheduleBenefitsDB]
	@PolicyId INT 
	AS

--Declare @@PolicyId INT 
--Set @@PolicyId = 22492 

BEGIN
	SELECT  TOP(1) 
	  benefit.[Name]
	, benefit.Code
	, benefit.StartDate
	, benefit.EndDate
	, benefitType.[name] as BenefitType
	, CoverMemberType.[name] as CoverMemberType

	FROM [POLICY].[POLICY] [POLICY]
	INNER JOIN [PRODUCT].[PRODUCTOPTION] PRODUCTOPTION ON PRODUCTOPTION.ID = [POLICY].PRODUCTOPTIONID
	INNER JOIN [PRODUCT].[ProductOptionBenefit] ProductOptionBenefit ON ProductOptionBenefit.ProductOptionId = PRODUCTOPTION.Id
	inner join [PRODUCT].[Benefit] benefit on benefit.Id = ProductOptionBenefit.BenefitId
	inner join [common].[BenefitType] benefitType on benefitType.Id = benefit.BenefitTypeId
	inner join [common].[CoverMemberType] CoverMemberType on CoverMemberType.Id = benefit.CoverMemberTypeId
	WHERE [POLICY].PolicyId = @PolicyId  ORDER BY 1 DESC
END