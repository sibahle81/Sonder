-- =============================================
-- Author:		Ryan Maree
-- Create date: 2020-11-12
-- EXEC [billing].[AgentLapseRatio] 2020 , 10
-- =============================================
CREATE   PROCEDURE [billing].AgentLapseRatio
    @Year AS INT,
	@Month AS INT
AS
BEGIN
SELECT 
	[POLICY].LastLapsedDate AS [Month],
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName AS [Agent Name],
	[AGENT].Code AS [Code],
	SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END) AS [Total Number Of Policies],
	SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END) AS [Number Of Active Policies],
	(CONVERT(DECIMAL(10,2),((CONVERT(DECIMAL(10,2),(SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))-(SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END)))/(SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))))*100 AS [Lapse Ratio %]
FROM 
	[broker].[Representative] [AGENT]
	INNER JOIN policy.[Policy] [POLICY] ON [POLICY].RepresentativeId = [AGENT].Id
	INNER JOIN client.[RolePlayer] [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [POLICY].PolicyOwnerId
WHERE 
	MONTH([POLICY].PolicyInceptionDate) = @Month AND
	YEAR([POLICY].PolicyInceptionDate) = @Year
GROUP BY
	[POLICY].LastLapsedDate,
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName,
	[AGENT].Code
END