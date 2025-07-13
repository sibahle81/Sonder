CREATE PROCEDURE [quote].[RMAAssuranceQuoteDetails]
	@QuoteId INT
	AS
BEGIN

SELECT 
	[LEAD].DisplayName,
	[QUOTE].QuotationNumber,
	[PRODUCT].UnderwriterId,
	[PRODUCT].ProductClassId,
	[CATEGORYINSURED].[Id] AS CategoryInsuredId,
	[PRODUCTOPTION].[Name] AS ProductOption,
	[CATEGORYINSURED].[Name] AS CategoryInsuredName,
	[QUOTEDETAIL].AverageNumberOfEmployees,
	[QUOTEDETAIL].AverageEmployeeEarnings,
	[QUOTEDETAIL].IndustryRate,
	[QUOTEDETAIL].Premium,
	[QUOTEDETAIL].LiveInAllowance,
	[QUOTE].CreatedDate,
	[QUOTEDETAIL].IsDeleted
FROM quote.Quote_V2 [QUOTE]
INNER JOIN quote.QuoteDetails_V2 [QUOTEDETAIL] ON [QUOTE].quoteId = [QUOTEDETAIL].QuoteId
INNER JOIN [lead].[Lead] [LEAD] ON [Lead].LeadId = [QUOTE].LeadId
INNER JOIN [product].ProductOption [PRODUCTOPTION] ON [QUOTEDETAIL].ProductOptionId = [PRODUCTOPTION].Id
INNER JOIN [product].Product [PRODUCT] ON [PRODUCTOPTION].ProductId = [PRODUCT].Id
INNER JOIN [common].CategoryInsured [CATEGORYINSURED] ON [QUOTEDETAIL].CategoryInsuredId = [CATEGORYINSURED].Id
WHERE [QUOTE].QuoteId = @QuoteId AND [QUOTEDETAIL].IsDeleted <> 1
END