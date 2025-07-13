CREATE PROCEDURE [policy].[GroupSchemeLapseRatioReport]
    @Year AS INT,
	@Month AS INT
AS
BEGIN
SELECT 
	@Year + '-' + @Month AS [Month],
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName AS [BrokerConsultant],
	[AGENT].Code AS [BrokerConsultantCode],
	[BROKERAGE].Name AS [Intermediary],
	[BROKERAGE].Code AS [IntermediaryCode],
	SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END) AS [NoOfPolicies],
	SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END) AS [NoOfActivePolicies],
	(CONVERT(DECIMAL(10,2),((CONVERT(DECIMAL(10,2),(SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))-(SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END)))/(SUM(CASE WHEN [POLICY].RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))))*100 AS [LapseRatio]
FROM 
	[broker].[Representative] [AGENT] 
	INNER JOIN policy.[Policy] [POLICY] ON [POLICY].RepresentativeId = [AGENT].Id
	INNER JOIN client.[RolePlayer] [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [POLICY].PolicyOwnerId
	INNER JOIN [broker].Brokerage [BROKERAGE] ON [BROKERAGE].Id = [POLICY].BrokerageId
WHERE 
	MONTH([POLICY].PolicyInceptionDate) = @Month AND
	YEAR([POLICY].PolicyInceptionDate) = @Year AND
	[ROLEPLAYER].RolePlayerIdentificationTypeId = 2
GROUP BY
	[POLICY].LastLapsedDate,
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName,
	[AGENT].Code,
	[BROKERAGE].Name,
	[BROKERAGE].Code
END