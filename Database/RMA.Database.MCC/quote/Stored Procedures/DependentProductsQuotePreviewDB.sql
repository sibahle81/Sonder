
CREATE PROCEDURE [quote].[DependentProductsQuotePreviewDB]
	@QuoteId INT 
	AS
BEGIN
	SELECT 
		[Lead].DisplayName AS [Display Name],
		[QUOTE].QuoteNumber AS [Quote Number],
		[Category].Name AS [Category Insured],
		[Quote].AverageEmployeeCount AS [Number Of Employees],
		[Quote].Rate AS [Rate],
		[Quote].AverageEarnings AS [Earnings],
		[Quote].Premium AS [Premium],
		[Quote].ParentQuoteId AS [parentQuotId],
		[Quote].QuoteId AS [quoteId],
		[Product].Name AS [Product Name],
		[ProductOption].[Name] AS [ProductOption Name]
	FROM [quote].[Quote] [Quote]
		JOIN [common].CategoryInsured [Category] ON [Category].Id = [Quote].CategoryInsuredId
		JOIN [lead].[LeadProduct] [LeadProduct] ON [LeadProduct].QuoteId = [Quote].QuoteId
		JOIN [product].[Product] [Product] ON [Product].Id = [LeadProduct].ProductId
		JOIN [product].[ProductOption] [ProductOption] ON [LeadProduct].ProductOptionId = [ProductOption].id
		JOIN [lead].[Lead] [Lead] ON [Lead].LeadId = [LeadProduct].LeadId
	WHERE [Quote].ParentQuoteId = @QuoteId or [Quote].QuoteId = @QuoteId 
END