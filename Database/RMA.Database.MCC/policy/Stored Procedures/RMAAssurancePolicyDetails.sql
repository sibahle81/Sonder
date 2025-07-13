CREATE PROCEDURE [policy].[RMAAssurancePolicyDetails]
	@PolicyId INT
	AS
BEGIN

SELECT
	[Company].[Name],
	[Finpayee].FinPayeNumber,
	[Company].IdNumber AS [ReferenceNumber],
	[IndustryClass].[Name] AS [IndustryClass],
	 p.PolicyNumber,
	 p.PolicyInceptionDate,
	 p.ExpiryDate,
	 rp.DeclarationYear,
	[ProductOption].[Name] AS ProductOption,
	[CategoryInsured].[Name] AS CategoryInsuredName,
	rpd.AverageNumberOfEmployees,
	rpd.AverageEmployeeEarnings,
	rpd.Rate AS LiveInAllowance,
	rpd.Rate AS IndustryRate,
	rpd.Premium,
	(CASE 
		WHEN p.PaymentFrequencyId = 1 THEN 1 
		WHEN p.PaymentFrequencyId = 2 THEN 12 
		WHEN p.PaymentFrequencyId = 3 THEN 4 
		WHEN p.PaymentFrequencyId = 4 THEN 2 
		ELSE 1 
	END) AS Multiplier
FROM [policy].[Policy] p
INNER JOIN [client].[Company] [Company] ON [Company].RolePlayerId = p.PolicyOwnerId
INNER JOIN [client].[RolePlayerPolicyDeclaration] rp on p.PolicyId = rp.PolicyId
INNER JOIN [client].[RolePlayerPolicyDeclarationDetail] rpd on rpd.RolePlayerPolicyDeclarationId = rp.RolePlayerPolicyDeclarationId
INNER JOIN [common].IndustryClass [IndustryClass] ON [IndustryClass].Id = [Company].IndustryClassId
INNER JOIN [common].[CategoryInsured] [CategoryInsured] ON rpd.CategoryInsuredId = [CategoryInsured].Id
INNER JOIN [product].[ProductOption] [ProductOption] ON rpd.ProductOptionId = [ProductOption].Id
INNER JOIN [client].[FinPayee] [Finpayee] ON [Finpayee].RolePlayerId = p.PolicyOwnerId
 	WHERE rpd.IsDeleted <> 1 AND p.PolicyId = @PolicyId AND rp.RolePlayerPolicyDeclarationStatusId = 1
END