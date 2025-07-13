

---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/03/10
---- EXEC [policy].[IndustryClassReport]
---- =============================================
CREATE   PROCEDURE [billing].[IndustryClassReport]

AS
BEGIN
WITH Industry_CTE( [IndustryID]) AS(
 SELECT 
    0 AS [IndustryID]
   UNION
		SELECT DISTINCT
		cic.[Id] AS [IndustryID]
FROM [common].[IndustryClass] cic)
SELECT [IndustryID] from Industry_CTE

END