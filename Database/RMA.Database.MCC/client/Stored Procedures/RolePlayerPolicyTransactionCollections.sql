CREATE PROCEDURE [client].[RolePlayerPolicyTransactionCollections]
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

[TYPE].[Name] AS [Type], 
[CLIENT_TRANSACTION].DocumentNumber AS [Document Number], 

[CLIENT_TRANSACTION].TotalAmount AS [Amount Sent (Client)], 
[BILLING_INVOICE].TotalInvoiceAmount AS [Amount Received (Collections)],

[TRANSACTION_STATUS].[Name] AS [Status (Client)], 
[INVOICE_STATUS].[Name] AS [Status (Collections)],

[CLIENT_TRANSACTION].SentDate AS [Date Sent (Client)],
[BILLING_INVOICE].InvoiceDate AS [Invoice Date]

FROM [client].RolePlayerPolicyTransaction [CLIENT_TRANSACTION]
INNER JOIN [client].FinPayee AS [DEBTOR] ON [DEBTOR].RolePlayerId = [CLIENT_TRANSACTION].RolePlayerId
INNER JOIN [client].Company AS [COMPANY] ON [COMPANY].RolePlayerId = [DEBTOR].RolePlayerId
INNER JOIN [client].RolePlayer AS [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [CLIENT_TRANSACTION].RolePlayerId
INNER JOIN [policy].[Policy] [POLICY] ON [POLICY].PolicyId = [CLIENT_TRANSACTION].PolicyId
INNER JOIN [product].[ProductOption] [PRODUCTOPTION] ON [PRODUCTOPTION].Id = [POLICY].ProductOptionId
INNER JOIN [billing].Invoice [BILLING_INVOICE] ON [BILLING_INVOICE].InvoiceNumber = [CLIENT_TRANSACTION].DocumentNumber
INNER JOIN [common].TransactionType [TYPE] ON [TYPE].Id = [CLIENT_TRANSACTION].TransactionTypeId
INNER JOIN [common].RolePlayerPolicyTransactionStatus [TRANSACTION_STATUS] ON [TRANSACTION_STATUS].Id = [CLIENT_TRANSACTION].RolePlayerPolicyTransactionStatusId
INNER JOIN [common].InvoiceStatus [INVOICE_STATUS] ON [INVOICE_STATUS].Id = [BILLING_INVOICE].InvoiceStatusId
INNER JOIN [common].IndustryClass [INDUSTRYCLASS] ON [INDUSTRYCLASS].Id = [COMPANY].IndustryClassId


WHERE 
([CLIENT_TRANSACTION].SentDate >= @StartDate OR @StartDate IS NULL) AND
([CLIENT_TRANSACTION].SentDate <= @EndDate OR @EndDate IS NULL) AND
([COMPANY].IndustryClassId = @IndustryClassId OR @IndustryClassId IS NULL) AND
([DEBTOR].RolePlayerId = @RolePlayerId OR @RolePlayerId IS NULL)

ORDER BY [CLIENT_TRANSACTION].RolePlayerId, [CLIENT_TRANSACTION].EffectiveDate