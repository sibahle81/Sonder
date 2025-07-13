
CREATE PROCEDURE [client].[MemberLetterOfGoodStanding]
(
 @RolePlayerId INT, -- 137277
 @DeclarationYear INT, -- 2023
 @ProductOptionId INT -- 122
)
AS 
BEGIN 
	  SELECT TOP 1
	 [LOGS].IssueDate,
	 [LOGS].ExpiryDate,
	 [LOGS].CertificateNo,
	 [ROLEPLAYER].DisplayName,
	 [FINPAYEE].FinPayeNumber,
	 [COMPANY].NatureOfBusiness,
	 [INDUSTRY].[Name] AS Industry,
	 [INDUSTRYCLASS].[Name] AS IndustryClass,
	 [DECLARATION].DeclarationYear,
	 [PRODUCTOPTION].[Name] AS ProductOption,
	 SUM([DECLARATIONDETAIL].AverageNumberOfEmployees) AS NumberOfEmployees
	 FROM [client].[LetterOfGoodStanding] [LOGS]
	 INNER JOIN [client].RolePlayer [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [LOGS].RolePlayerId
	 INNER JOIN [client].FinPayee [FINPAYEE] ON [FINPAYEE].RolePlayerId = [LOGS].RolePlayerId
	 INNER JOIN [client].Company [COMPANY] ON [COMPANY].RolePlayerId = [LOGS].RolePlayerId
	 INNER JOIN [common].Industry [INDUSTRY] ON [INDUSTRY].Id = [COMPANY].IndustryId
	 INNER JOIN [client].RolePlayerPolicyDeclaration [DECLARATION] ON [DECLARATION].RolePlayerId = [LOGS].RolePlayerId
	 INNER JOIN [client].RolePlayerPolicyDeclarationDetail [DECLARATIONDETAIL] ON [DECLARATIONDETAIL].RolePlayerPolicyDeclarationId = [DECLARATION].RolePlayerPolicyDeclarationId
	 INNER JOIN [common].IndustryClass [INDUSTRYCLASS] ON [INDUSTRYCLASS].Id = [COMPANY].IndustryClassId
	 INNER JOIN [product].ProductOption [PRODUCTOPTION] ON [PRODUCTOPTION].Id = [DECLARATIONDETAIL].ProductOptionId 
	 WHERE 
	 [LOGS].RolePlayerId = @RolePlayerId AND
	 [DECLARATION].DeclarationYear = @DeclarationYear AND
	 [DECLARATION].RolePlayerPolicyDeclarationTypeId = 3 AND -- BUDGETED
	 [PRODUCTOPTION].Id = @ProductOptionId
	 GROUP BY 
	 [LOGS].IssueDate,
	 [LOGS].ExpiryDate,
	 [LOGS].CertificateNo,
	 [ROLEPLAYER].DisplayName,
	 [FINPAYEE].FinPayeNumber,
	 [COMPANY].NatureOfBusiness,
	 [INDUSTRY].[Name],
	 [INDUSTRYCLASS].[Name],
	 [DECLARATION].DeclarationYear,
	 [PRODUCTOPTION].[Name]
	 ORDER BY 1 DESC
END