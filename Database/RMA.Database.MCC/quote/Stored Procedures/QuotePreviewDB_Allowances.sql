
CREATE PROCEDURE [quote].[QuotePreviewDB_Allowances]
	@QuoteId INT 
	AS
BEGIN
	SELECT 
	[AllowanceType].[Name] AS [AllowanceType],
	[QuoteAllowance].Allowance AS [Allowance]
	FROM [Quote].QuoteAllowance [QuoteAllowance]
	INNER JOIN [common].AllowanceType [AllowanceType] ON [AllowanceType].Id = [QuoteAllowance].AllowanceTypeId
	WHERE QuoteId = @QuoteId
END