



---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/02/04
---- EXEC [policy].[BrokerageNamesReport]
---- =============================================
CREATE   PROCEDURE [policy].[BrokerageNamesReport]

AS
BEGIN
WITH Broker_CTE( [Intemediary Name],ColumnNumber) AS(
 SELECT 
    'ALL' AS [Intemediary Name],
	1 AS [ColumnNumber]
   UNION
		SELECT DISTINCT
		[BROKERAGE].Name AS [Intemediary Name],
		2 AS [ColumnNumber]
FROM [broker].Brokerage [BROKERAGE]
Where [BROKERAGE].Name <> '')
SELECT [Intemediary Name] from Broker_CTE

END