CREATE PROCEDURE [policy].[GroupSchemesReport]
    @Year AS INT,
	@Month AS INT
AS
BEGIN
SELECT 
	@Month AS [Month],
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName AS [BrokerConsultant],
	[AGENT].Code AS [BrokerConsultantCode],
	[BROKERAGE].Name AS [Intermediary],
	[BROKERAGE].Code AS [IntemediaryCode],
	[POLICY].PolicyInceptionDate,
	[ROLEPLAYER].DisplayName AS [GroupName],
	[POLICY].InstallmentPremium AS [AnnualPremium],
	[POLICY].AnnualPremium AS [AnnualisedPremium],
	(SELECT COUNT(*) FROM [policy].[PolicyInsuredLives] WHERE PolicyId = [POLICY].PolicyId) AS [NoInsuredLived],
	(SELECT COUNT(*) FROM [policy].[PolicyInsuredLives] WHERE PolicyId = [POLICY].PolicyId AND RolePlayerTypeId = 10) AS [PayingInsuredLives],
	[PRODUCT].Name AS [ProductOption]
FROM 
	[broker].[Representative] [AGENT] 
	INNER JOIN policy.[Policy] [POLICY] ON [POLICY].RepresentativeId = [AGENT].Id
	INNER JOIN client.[RolePlayer] [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [POLICY].PolicyOwnerId
	INNER JOIN [broker].Brokerage [BROKERAGE] ON [BROKERAGE].Id = [POLICY].BrokerageId
	INNER JOIN [product].[ProductOption] [PRODUCT] ON [POLICY].ProductOptionId = [PRODUCT].Id
WHERE 
	MONTH([POLICY].PolicyInceptionDate) = @Month AND
	YEAR([POLICY].PolicyInceptionDate) = @Year AND
	[ROLEPLAYER].RolePlayerIdentificationTypeId = 2
GROUP BY
	[POLICY].LastLapsedDate,
	[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName,
	[AGENT].Code,
	[BROKERAGE].Name,
	[BROKERAGE].Code,
	[POLICY].PolicyInceptionDate,
	[ROLEPLAYER].DisplayName,
	[POLICY].InstallmentPremium,
	[POLICY].AnnualPremium,
	[POLICY].PolicyId,
	[PRODUCT].Name
END