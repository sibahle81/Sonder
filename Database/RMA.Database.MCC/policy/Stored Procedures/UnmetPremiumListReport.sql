CREATE PROCEDURE policy.UnmetPremiumListReport
    @month AS INT = 0,
	@year AS INT = 0,
	@productName AS VarChar(100) = NULL
AS
BEGIN
SELECT 
	DATENAME(MONTH,I.CollectionDate) AS [Month],
	PR.Name AS ProductName,
	P.PolicyNumber,
	BR.Name AS Intermediary,
	R.DisplayName,
	I.TotalInvoiceAmount,
    CONVERT(varchar, I.CollectionDate, 103) AS CollectionDate,
	'No Payment Allocated' AS Reason
	FROM policy.[Policy] P INNER JOIN [product].[ProductOption] PO 
	ON P.ProductOptionId = PO.Id INNER JOIN [product].[Product] PR
	ON PO.ProductId = PR.Id INNER JOIN [broker].[Brokerage] BR
	ON P.BrokerageId = BR.Id INNER JOIN [client].[RolePlayer] R
	ON P.PolicyOwnerId = R.RolePlayerId INNER JOIN [billing].[Invoice] I
	ON P.PolicyId = I.PolicyId

WHERE 
	(@Month = 0 OR MONTH(I.CollectionDate) = @Month) AND
	(@Year = 0 OR YEAR(I.CollectionDate) = @Year) AND
	I.InvoiceStatusId = 2
END