CREATE PROCEDURE [client].[RolePlayerPolicyTransactionBundleRaise]
    @StartDate DATE = NULL,
	@EndDate DATE = NULL,
	@IndustryClassId INT = NULL,
	@RolePlayerId INT = NULL
AS
SELECT 
[DEBTOR].FinPayeNumber AS [Debtor],
[ROLEPLAYER].DisplayName AS [Debtor Name],
[INDUSTRYCLASS].[Name] AS [Industy Class],
[CLIENT_TRANSACTION].CoverPeriod AS [Cover Period],
[POLICY].PolicyNumber AS [Policy Number],
[PRODUCTOPTION].[Name] + ' (' + [PRODUCTOPTION].[Code] + ')' AS [Product Option],
[CLIENT_TRANSACTION].EffectiveDate AS [Effective Date],
[TYPE].[Name] AS [Type], 
[CLIENT_TRANSACTION].DocumentNumber AS [Document Number], 
[CLIENT_TRANSACTION].TotalAmount AS [Amount], 
[TRANSACTION_STATUS].[Name] AS [Status]

FROM [client].RolePlayerPolicyTransaction [CLIENT_TRANSACTION]
INNER JOIN [client].FinPayee AS [DEBTOR] ON [DEBTOR].RolePlayerId = [CLIENT_TRANSACTION].RolePlayerId
INNER JOIN [client].RolePlayer AS [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [CLIENT_TRANSACTION].RolePlayerId
INNER JOIN [client].Company AS [COMPANY] ON [COMPANY].RolePlayerId = [CLIENT_TRANSACTION].RolePlayerId
INNER JOIN [policy].[Policy] [POLICY] ON [POLICY].PolicyId = [CLIENT_TRANSACTION].PolicyId
INNER JOIN [product].[ProductOption] [PRODUCTOPTION] ON [PRODUCTOPTION].Id = [POLICY].ProductOptionId
INNER JOIN [common].TransactionType [TYPE] ON [TYPE].Id = [CLIENT_TRANSACTION].TransactionTypeId
INNER JOIN [common].RolePlayerPolicyTransactionStatus [TRANSACTION_STATUS] ON [TRANSACTION_STATUS].Id = [CLIENT_TRANSACTION].RolePlayerPolicyTransactionStatusId
INNER JOIN [common].IndustryClass [INDUSTRYCLASS] ON [INDUSTRYCLASS].Id = [COMPANY].IndustryClassId

WHERE 
([CLIENT_TRANSACTION].EffectiveDate >= @startDate OR @StartDate IS NULL)
AND ([CLIENT_TRANSACTION].EffectiveDate <= @EndDate OR @EndDate IS NULL)
AND [CLIENT_TRANSACTION].RolePlayerPolicyTransactionStatusId in (2,3) -- FUTURE OR QUEUED
AND([COMPANY].IndustryClassId = @IndustryClassId OR @IndustryClassId IS NULL)
AND([DEBTOR].RolePlayerId = @RolePlayerId OR @RolePlayerId IS NULL)
AND [CLIENT_TRANSACTION].isDeleted = 0

ORDER BY [CLIENT_TRANSACTION].RolePlayerId, [CLIENT_TRANSACTION].EffectiveDate