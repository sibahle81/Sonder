
CREATE PROCEDURE [quote].[StatutoryQuotePreviewDB]
	@QuoteId INT 
	AS
BEGIN
	SELECT 
		[Lead].DisplayName AS [Display Name],
		[Quote].QuoteNumber AS [Quote Number],
		[ProductOption].Name AS [ProductOption],
		[Category].Name AS [Category Insured],
		[Quote].AverageEmployeeCount AS [Number Of Employees],
		[Quote].Rate AS [Rate],
		[Quote].AverageEarnings AS [Earnings],
		[Quote].Premium AS [Premium]
	FROM [quote].[Quote] [Quote]
		JOIN [common].CategoryInsured [Category] ON [Category].Id = [Quote].CategoryInsuredId
		JOIN [lead].[LeadProduct] [LeadProduct] ON [LeadProduct].QuoteId = [Quote].QuoteId
		JOIN [product].[ProductOption] [ProductOption] ON [ProductOption].Id = [LeadProduct].ProductOptionId
		JOIN [lead].[Lead] [Lead] ON [Lead].LeadId = [LeadProduct].LeadId
	WHERE [Quote].QuoteId = @QuoteId
END