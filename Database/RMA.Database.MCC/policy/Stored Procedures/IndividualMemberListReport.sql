
CREATE PROCEDURE [policy].[IndividualMemberListReport]
    @year AS INT,
	@month AS INT
AS
BEGIN
SELECT 
	@month AS [Month],
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName AS [AgentName],
	[AGENT].Code AS [AgentCode],
	[BROKERAGE].Name AS [Intemediary],
	[BROKERAGE].Code AS [IntemediaryCode],
	[POLICY].PolicyNumber,
	[PRODUCT].Name AS [ProductOption],
	[PERSON].Surname,
	[PERSON].FirstName,
	[PERSON].IdNumber AS [IDNumber],
	[PERSON].DateOfBirth,
	'X' AS [Gender],
	[POLICY].PolicyInceptionDate AS [CommenceDate],
	[POLICY].PolicyInceptionDate AS [ApplicationDate],
	[ADDRESS].[AddressLine1] AS [PostAddress1],
	[ADDRESS].[AddressLine2] AS [PostAddress2],
	[ADDRESS].[PostalCode],
	[ADDRESS].[AddressLine1] AS [ResAddress1],
	[ADDRESS].[AddressLine2] AS [ResAddress2],
	[Policy].[InstallmentPremium] AS [Premium]
FROM 
	[broker].[Representative] [AGENT] 
	INNER JOIN policy.[Policy] [POLICY] ON [POLICY].RepresentativeId = [AGENT].Id
	INNER JOIN client.[RolePlayer] [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [POLICY].PolicyOwnerId
	INNER JOIN [broker].Brokerage [BROKERAGE] ON [BROKERAGE].Id = [POLICY].BrokerageId
	INNER JOIN [product].[ProductOption] [PRODUCT] ON [POLICY].ProductOptionId = [PRODUCT].Id
	INNER JOIN [client].[Person] [PERSON] ON [ROLEPLAYER].RolePlayerId = [PERSON].RolePlayerId
	INNER JOIN [client].[RolePlayerAddress] [ADDRESS] ON [ROLEPLAYER].RolePlayerId = [ADDRESS].RolePlayerId
WHERE 
	MONTH([POLICY].PolicyInceptionDate) = @month AND
	YEAR([POLICY].PolicyInceptionDate) = @year
END