
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 30/10/2019
-- =============================================
CREATE PROCEDURE [claim].[SearchPoliciesWithoutClaim]
	@FilterType INT = NULL,
	@Filter VARCHAR(50),
	@ShowActive bit = 1
AS
BEGIN
	--Stores entire result set
	DECLARE @SearchTable TABLE (
		PolicyId INT,
		PolicyNumber VARCHAR(50),
		ProductId INT,
		ProductName VARCHAR(250),
		ClaimId INT,
		ClaimReferenceNumber VARCHAR(50),
		Status VARCHAR(250),
		StatusReason VARCHAR(250),
		InsuredLifeId INT,
		IdNumber VARCHAR(250),
		PassportNumber VARCHAR(250),
		MemberFirstName VARCHAR(250),
		MemberLastName VARCHAR(250),
		BeneficiaryTypeId INT,
		MemberRole VARCHAR(50),
		IndustryClassId INT,
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),
		hasClaim BIT,
		hasClaimStr VARCHAR(50),
		hasWizard BIT,
		WizardURL VARCHAR(250)
	);

	--Stores entire result set
	DECLARE @ClaimTable TABLE (
		CaseId INT,
		PolicyId INT,
		ClaimId INT,
		ClaimUniqueReference VARCHAR(50),
		ClaimStatusId INT,
		ClaimStatus VARCHAR(250),
		ClaimStatusReason VARCHAR(250),
		InsuredLifeId INT,
		hasClaim BIT,
		hasClaimStr VARCHAR(50),
		hasWizard BIT,
		WizardURL VARCHAR(250)
	);


	--Filtered result set
	DECLARE @ResultTable TABLE (
		Id INT,
		PolicyNumber VARCHAR(50),
		ProductId INT,
		ProductName VARCHAR(250),
		ClaimId INT,
		ClaimReferenceNumber VARCHAR(50),
		Status VARCHAR(250),
		StatusReason VARCHAR(250),
		InsuredLifeId INT,
		IdNumber VARCHAR(250),
		PassportNumber VARCHAR(250),
		MemberFirstName VARCHAR(250),
		MemberLastName VARCHAR(250),
		BeneficiaryTypeId INT,
		MemberRole VARCHAR(50),
		IndustryClassId INT,
		IndustryNumber VARCHAR(50),
		EmployeeNumber VARCHAR(50),
		hasClaim BIT,
		hasClaimStr VARCHAR(50),
		hasWizard BIT,
		WizardURL VARCHAR(250)
	);
	--Remove the spaces
	SET @Filter = RTRIM(LTRIM(@Filter))

	--Get entire claim result set
	INSERT @ClaimTable
	SELECT
		[PersonEvent].PersonEventId,
		Claim.PolicyId,
		Claim.ClaimId,
		Claim.ClaimReferenceNumber,	
		Claim.ClaimStatusId,
		Status.Status,
		Status.Name StatusReason,
		[PersonEvent].InsuredLifeId,	
		CASE 
			WHEN Claim.ClaimReferenceNumber is NULL THEN
			0 
				ELSE 
			1
			END AS hasClaim, --hasClaim
		CASE 
			WHEN Claim.ClaimReferenceNumber is NULL THEN
			'No'
				ELSE 
			'Yes'
			END AS hasClaimStr,
		CASE 
			WHEN Wizard.Id is NULL THEN
			0 
				ELSE 
			1
		END AS hasWizard, --hasWizard
		Wizard.Name  --WizardURL -- select *
	FROM [claim].[PersonEvent] [PersonEvent] WITH (NOLOCK)
	LEFT JOIN  claim.Claim Claim WITH (NOLOCK) ON [PersonEvent].PersonEventId = Claim.PersonEventId
	LEFT JOIN  claim.ClaimStatus [Status] WITH (NOLOCK) ON [Status].ClaimStatusId = Claim.ClaimStatusId
	LEFT JOIN [bpm].[Wizard] Wizard WITH (NOLOCK) ON Claim.ClaimId = Wizard.LinkedItemId
	WHERE [PersonEvent].IsDeleted = 0 AND [Claim].IsDeleted = 0

	IF(@ShowActive = 1)
	BEGIN
--------------------------------------------------------------------------- Active Policies + Claims --------------------------------------------------
		INSERT @SearchTable
		SELECT
			Policy.PolicyId,
			Policy.PolicyNumber,
			0 ProductId,
			'' ProductName,
			--InsuredLifePolicyProduct.ProductId,
			--Product.[Name] ProductName,
			Claim.ClaimId ClaimId,
			ISNULL(Claim.ClaimUniqueReference,''),
			ISNULL(Claim.ClaimStatus, '') Status,
			ISNULL(Claim.ClaimStatusReason, '') StatusReason,
			InsuredLifePolicyProduct.InsuredLifeId,
			InsuredLife.IdNumber,
			InsuredLife.PassportNumber,
			InsuredLife.Name, --MemberFirstName
			InsuredLife.Surname, -- MemberLastName
			InsuredLife.BeneficiaryTypeId,
			BeneficiaryType.[Name], --Role,
			Client.IndustryClassId,
			'' IndustryNumber, -- IndustryClass.Code IndustryNumber,
			InsuredLife.ReferenceNumber, --EmployeeNumber,
			ISNULL(Claim.hasClaim,0),
			ISNULL(Claim.hasClaimStr,''),
			ISNULL(Claim.hasWizard,0),
			Claim.WizardURL --WizardURL
		FROM policy.Policy Policy WITH (NOLOCK)	
		INNER JOIN client.Client Client WITH (NOLOCK) ON Client.Id = Policy.ClientId	
		LEFT JOIN  policy.InsuredLifePolicyProduct InsuredLifePolicyProduct WITH (NOLOCK) ON InsuredLifePolicyProduct.PolicyId = Policy.PolicyId
		INNER JOIN policy.InsuredLife InsuredLife WITH (NOLOCK) ON InsuredLifePolicyProduct.InsuredLifeId = InsuredLife.Id
		LEFT JOIN common.BeneficiaryType BeneficiaryType WITH (NOLOCK) ON BeneficiaryType.Id = InsuredLife.BeneficiaryTypeId
		-- INNER JOIN product.Product Product WITH (NOLOCK) ON Product.Id = InsuredLifePolicyProduct.ProductId		
		LEFT JOIN @ClaimTable Claim ON Claim.PolicyId = Policy.PolicyId AND InsuredLifePolicyProduct.InsuredLifeId = Claim.InsuredLifeId
		WHERE Policy.IsActive = 1 AND Client.IsActive = 1 AND InsuredLifePolicyProduct.IsActive = 1 AND InsuredLife.IsActive = 1
	END
	ELSE
	BEGIN
	--------------------------------------------------------------------------- Inactive Policies + Claims --------------------------------------------------
		INSERT @SearchTable
		SELECT	
			Policy.PolicyId,
			Policy.PolicyNumber,		
			0 ProductId,
			'' ProductName,
			Claim.ClaimId ClaimId,
			ISNULL(Claim.ClaimUniqueReference,'') ClaimReferenceNumber, 
			ISNULL(Claim.ClaimStatus, '') Status,
			ISNULL(Claim.ClaimStatusReason, '') StatusReason,
			Claim.InsuredLifeId InsuredLifeId,
			InsuredLife.IdNumber IdNumber,
			InsuredLife.PassportNumber PassportNumber,
			InsuredLife.Name MemberFirstName,
			InsuredLife.Surname MemberLastName, 
			InsuredLife.BeneficiaryTypeId,
			BeneficiaryType.[Name] MemberRole, --Role,
			0 IndustryClassId,
			'' IndustryNumber,
			InsuredLife.ReferenceNumber EmployeeNumber,
			ISNULL(Claim.hasClaim,0),
			ISNULL(Claim.hasClaimStr,''),
			ISNULL(Claim.hasWizard,0),
			Claim.WizardURL --WizardURL
		FROM @ClaimTable Claim
			INNER JOIN policy.Policy Policy WITH (NOLOCK) ON Policy.PolicyId = Claim.PolicyId
			INNER JOIN  policy.InsuredLifePolicyProduct InsuredLifePolicyProduct WITH (NOLOCK) ON InsuredLifePolicyProduct.InsuredLifeId = Claim.InsuredLifeId
			INNER JOIN policy.InsuredLife InsuredLife WITH (NOLOCK) ON InsuredLife.Id = Claim.InsuredLifeId		
			LEFT JOIN common.BeneficiaryType BeneficiaryType WITH (NOLOCK) ON BeneficiaryType.Id = InsuredLife.BeneficiaryTypeId
		WHERE (Policy.IsActive = 0 OR InsuredLife.IsActive = 0 OR InsuredLifePolicyProduct.IsActive = 0)
	END

	--IF (@FilterType = 1) --Policy Number
	BEGIN
		INSERT @ResultTable
		SELECT
			PolicyId,
			PolicyNumber,
			ProductId,
			ProductName,
			ClaimId,
			ClaimReferenceNumber,
			[Status],
			StatusReason,
			InsuredLifeId,
			IdNumber,
			PassportNumber,
			MemberFirstName,
			MemberLastName,
			BeneficiaryTypeId,
			MemberRole,
			IndustryClassId,
			IndustryNumber,
			EmployeeNumber,
			hasClaim,
			hasClaimStr,
			hasWizard,
			WizardURL
		FROM @SearchTable
		WHERE hasClaim = 0 AND 
			  (@Filter IS NULL OR 
			  PolicyNumber like '%' +@Filter + '%' OR
			  IdNumber like '%' +@Filter + '%' OR
			  PassportNumber like '%' +@Filter + '%' OR
			  EmployeeNumber like '%' +@Filter + '%' OR
			  ClaimReferenceNumber like '%' +@Filter + '%' OR
			  MemberFirstName like '%' +@Filter + '%' OR 
			  MemberLastName like '%' + @Filter + '%' OR 
			  MemberFirstName + ' ' + MemberLastName like '%' + @Filter + '%')
	END

	SELECT
		Id,
		PolicyNumber ,
		ProductName ,
		ClaimId,
		ClaimReferenceNumber ,
		Status,
		StatusReason,
		InsuredLifeId,
		MemberFirstName ,
		MemberLastName ,
		MemberRole ,
		IndustryNumber ,
		EmployeeNumber,
		hasClaim,
		hasClaimStr,
		hasWizard,
		WizardURL
	FROM @ResultTable	
	ORDER BY PolicyNumber, MemberFirstName, MemberLastName
END