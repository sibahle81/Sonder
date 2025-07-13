-- =============================================
-- Author:		Ryan Maree
-- Create date: 2020-11-12
-- EXEC [policy].[AgentLapseRatio] 2020 , 10
-- =============================================
CREATE PROCEDURE [policy].[AgentLapseRatio]
    @year AS INT,
	@month AS INT
AS
BEGIN
SELECT 
	@month AS [Month],
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName AS [Agent Name],
	[AGENT].Code AS [Code],
	[BROKERAGE].Name AS [Intemediary Name],
	[BROKERAGE].Code AS [Intemediary Code],
	SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END) AS [Total Number Of Policies],
	SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END) AS [Number Of Active Policies],
	(CONVERT(DECIMAL(10,2),((CONVERT(DECIMAL(10,2),(SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))-(SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END)))/(SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))))*100 AS [Lapse Ratio %]
FROM 
	[broker].[Representative] [AGENT] 
	INNER JOIN policy.[Policy] [POLICY] ON [POLICY].RepresentativeId = [AGENT].Id
	INNER JOIN client.[RolePlayer] [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [POLICY].PolicyOwnerId
	INNER JOIN [broker].Brokerage [BROKERAGE] ON [BROKERAGE].Id = [POLICY].BrokerageId
WHERE 
	MONTH([POLICY].PolicyInceptionDate) = @month AND
	YEAR([POLICY].PolicyInceptionDate) = @year
GROUP BY
	[POLICY].LastLapsedDate,
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName,
	[AGENT].Code,
	[BROKERAGE].Name,
	[BROKERAGE].Code
END