
---- =============================================
---- Author:Ryan Maree
---- Create date: 2021/08/30
---- =============================================
CREATE PROCEDURE [policy].[AmountInvoiced]
AS
BEGIN
DECLARE 
@COIDProductId INT

SET @COIDProductId = (SELECT [Value] from [common].[Settings] where [key] ='COIDProductId')

SELECT [ProductOption].Name,
COUNT(test.PolicyId) AS NumberOfPolicies,
SUM(test.NumberOfLives) AS NumberOfLives
FROM policy.Policy e
INNER JOIN [product].[ProductOption] ON [product].[ProductOption].Id = e.ProductOptionId 
INNER JOIN (SELECT [Policy].PolicyId,
            COUNT([InsuredLives].RolePlayerId) AS NumberOfLives
            FROM policy.Policy [Policy]
            INNER JOIN policy.PolicyInsuredLives [InsuredLives] ON [Policy].PolicyId = [InsuredLives].PolicyId
            group by [Policy].PolicyId) as test on test.PolicyId = e.PolicyId
WHERE [ProductOption].ProductId <> @COIDProductId
GROUP BY [ProductOption].Name
ORDER BY NumberOfPolicies
END