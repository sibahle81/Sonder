---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/02/04
---- EXEC [policy].[BrokerageNamesReport]
---- =============================================
CREATE   PROCEDURE [policy].[BrokerageNamesReport]

AS
BEGIN
	SELECT DISTINCT
		[BROKERAGE].Name AS [Intemediary Name]
FROM [broker].Brokerage [BROKERAGE]
ORDER BY 1

END
GO