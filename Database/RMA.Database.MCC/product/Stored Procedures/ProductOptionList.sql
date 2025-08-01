-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- EXEC [product].[ProductOptionList] NULL
-- =============================================
CREATE     PROCEDURE [product].[ProductOptionList]
	@ProductName VARCHAR(250) = NULL
AS
BEGIN

	DECLARE @SearchTable TABLE (
	    ProductName VARCHAR(250),
		ProductCode VARCHAR(250),
		ProductStartDate Date,
		ProductStatus VARCHAR(250),
		BenefitName VARCHAR(250),
		BenefitCode VARCHAR(250),
		BenefitType VARCHAR(250),
		CoverType VARCHAR(250),
		BenefitAmount Decimal(18,2),
		BenefitStartDate Date,
		BenefitStatus VARCHAR(250),
		ProductOptionName VARCHAR(250),
		ProductOptionCode VARCHAR(250)
	);

    INSERT INTO @SearchTable
	SELECT P.Name,
		   P.Code,
		   P.StartDate,
		   'Active',
		   B.Name,
		   B.Code,
		   T.Name,
		   C.Name,
		   R.BenefitAmount,
		   B.StartDate,
		   'Active',
		   O.Name,
		   O.Code
	FROM [product].[Product] P INNER JOIN [product].[Benefit] B
	ON P.Id = B.ProductId INNER JOIN [product].[BenefitRate] R
	ON B.Id = R.BenefitId INNER JOIN [common].[BenefitType] T
	ON B.BenefitTypeId = T.Id INNER JOIN [common].[CoverMemberType] C
	ON B.CoverMemberTypeId = C.Id INNER JOIN [product].[ProductOption] O
	ON P.Id = O.ProductId 


      SELECT DISTINCT
			ProductName,
			ProductCode,
			ProductStartDate,
			ProductStatus,
			BenefitName,
			BenefitCode,
			BenefitType,
			CoverType,
			BenefitAmount,
			BenefitStartDate,
			BenefitStatus,
			ProductOptionName,
		    ProductOptionCode
	 FROM @SearchTable
	 WHERE (@ProductName IS NULL OR ProductName LIKE '%' + @ProductName + '%')
END
