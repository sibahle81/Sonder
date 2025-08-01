-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- EXEC [product].[MonthlyMembershipReport] NULL
-- =============================================
CREATE     PROCEDURE [product].[MonthlyMembershipReport]
	@ProductName VARCHAR(250) = NULL
AS
BEGIN

	DECLARE @SearchTable TABLE (
	    TreatyNumber VARCHAR(250),
		PolicyNumber VARCHAR(250),
		IDNumber VARCHAR(250),
		DateOfBirth Date,
		FirstName VARCHAR(250),
		LastName VARCHAR(250),
		MemberType VARCHAR(250),
		ProductOption VARCHAR(250),
		FaceAmount Decimal(18,2),
		RetainedFaceAmount Decimal(18,2),
		CededFaceAmount Decimal(18,2),
		DateLifeAssuredStartedCover Date,
		TotalRMAOfficePremium Decimal(18,2),
		ProductName VARCHAR(250)
	);

    INSERT INTO @SearchTable
	SELECT 'ZARMFR01A',
		   PO.PolicyNumber,
		   PE.IdNumber,
		   PE.DateOfBirth,
		   PE.FirstName,
		   PE.Surname,
		   C.Name,
		   P.Name,
		   PO.AnnualPremium,
		   (PO.AnnualPremium * 2),
		   PO.AnnualPremium,
		   PO.PolicyInceptionDate,
		   PO.AnnualPremium,
		   PR.Name
	FROM [policy].[Policy] PO INNER JOIN [product].[ProductOption] P
	ON PO.ProductOptionId = P.Id INNER JOIN [product].[Product] PR
	ON P.ProductId = PR.Id INNER JOIN [client].[RolePlayer] R
	ON PO.PolicyOwnerId = R.RolePlayerId INNER JOIN [client].[Person] PE
	ON R.RolePlayerId = PE.RolePlayerId INNER JOIN [product].[Benefit] B
	ON P.Id = B.ProductId INNER JOIN [product].[BenefitRate] BR
	ON B.Id = BR.BenefitId INNER JOIN [common].[BenefitType] T
	ON B.BenefitTypeId = T.Id INNER JOIN [common].[CoverMemberType] C
	ON B.CoverMemberTypeId = C.Id


      SELECT DISTINCT
			TreatyNumber,
			PolicyNumber,
			IDNumber,
			DateOfBirth,
			FirstName,
			LastName,
			MemberType,
			ProductOption,
			FaceAmount,
			RetainedFaceAmount,
			CededFaceAmount,
			DateLifeAssuredStartedCover,
			TotalRMAOfficePremium,
			ProductName
	 FROM @SearchTable
	 WHERE (@ProductName IS NULL OR ProductName LIKE '%' + @ProductName + '%')
END
