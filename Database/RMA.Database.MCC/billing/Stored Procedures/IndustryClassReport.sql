---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/03/10
---- EXEC [policy].[IndustryClassReport]
---- =============================================
CREATE   PROCEDURE [Billing].[IndustryClassReport]

AS
BEGIN
WITH Industry_CTE( [IndustryClassID]) AS(
 SELECT 
    0 AS [IndustryClassID]
   UNION
		SELECT DISTINCT
		cic.[Id] AS [IndustryClassID]
FROM [common].[IndustryClass] cic)
SELECT [IndustryClassID] from Industry_CTE

END
GO
