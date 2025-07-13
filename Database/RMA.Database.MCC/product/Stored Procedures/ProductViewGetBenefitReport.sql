 --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- dbo.ProductViewGetBenefitReport 15
CREATE PROCEDURE [product].[ProductViewGetBenefitReport]
		@ProductId int = null,
		@BenefitID int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 
	 Select Ben.Id, Ben.Name as [BenefitName], Ben.Code as [BenefitCode], BenType.Name as BenefitType, CMT.Name as CMTName
	  from [product].[Benefit] Ben 
			inner join [product].[Product] P on P.Id = Ben.ProductID
			inner join [product].[ProductOptionBenefit] BO on BO.BenefitID = Ben.ID
			inner join common.BenefitType BenType on BenType.ID = Ben.BenefitTypeId
			inner join common.CoverMemberType CMT on CMT.ID = Ben.CoverMemberTypeId
	Where p.ID = ISNULL(@ProductId, p.ID)	
	AND BO.ProductOptionID = @BenefitID
     
		 
	 
END
