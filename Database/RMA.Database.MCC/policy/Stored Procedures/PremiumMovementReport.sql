
CREATE PROCEDURE [policy].[PremiumMovementReport]
	@StartDate DATETIME, 
	@EndDate DATETIME
AS

BEGIN
--DECLARE 
--		@StartDate DATETIME, 
--		@EndDate DATETIME
--	Set @StartDate		= '2021-04-01'
--	Set @EndDate		= '2021-08-02'


	IF OBJECT_ID(N'tempdb..#TempAuditLog', N'U') IS NOT NULL
              DROP TABLE #TempAuditLog;

	SELECT
	--PremiumOld, premiumNew, Date
			JSON_VALUE(OldItem,'$.PolicyId') AS PolicyId ,
			JSON_VALUE(OldItem,'$.PolicyNumber') AS PolicyNumber ,
			CAST(JSON_VALUE(OldItem,'$.InstallmentPremium') AS MONEY) AS OldPremium ,
			CAST(JSON_VALUE(NewItem,'$.InstallmentPremium') AS MONEY) AS NewPremium,
			[date] as ModifiedDate,
			username as ModifiedBy
	INTO #TempAuditLog
	FROM [audit].[AuditLog]
	WHERE ItemType = 'policy_Policy'
	--AND itemId = 63075
	AND [Date] between @StartDate AND @EndDate
	AND [Action] = 'Modified'
	AND CAST(JSON_VALUE(OldItem,'$.InstallmentPremium') AS MONEY) <> CAST(JSON_VALUE(NewItem,'$.InstallmentPremium') AS MONEY)
	-- 196.72 -- new premium
	-- 98.00 -- old premium
	AND [Username] NOT IN ('BackendProcess')
	order by [Date]

	SELECT distinct tmpa.*,tmpa.NewPremium - tmpa.OldPremium AS [Difference],
		cpn.FirstName  AS [Name],cpn.Surname AS [Surname],cpn.[IdNumber],
		[brokerage].[Name] AS [BrokerName],
        [parp].DisplayName AS [Schemename] --select count(*)
	FROM #TempAuditLog tmpa --108
	LEFT JOIN Policy.policy p ON tmpa.PolicyId =p.PolicyId
	LEFT JOIN [broker].Brokerage [brokerage] ON brokerage.Id = p.BrokerageId
	LEFT JOIN [policy].[Policy] papol ON p.policyid =papol.parentpolicyid
	LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = p.policyOwnerId
	LEFT JOIN [Client].Person cpn ON  parp.RolePlayerId = cpn.RolePlayerId


		
END