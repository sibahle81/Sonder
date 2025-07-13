
CREATE PROCEDURE [lead].[QuoteDashboardOverview]
@ClientTypeId INT = NULL, -- 1 indivual, 2 - AFFINITY, 3 - xcompany, 4 - group indvidual, 5 - gold wage, 6 - corporate , 7 - Group
@FilterDateType INT = NULL, -- daily, weekly, monthly and yearly,
@ProductId INT = NULL

AS
BEGIN

--Declare @ClientTypeId INT = NULL, -- 1 indivual, 2 - AFFINITY, 3 - xcompany, 4 - group indvidual, 5 - gold wage, 6 - corporate , 7 - Group
--		@FilterDateType INT = NULL, -- daily, weekly, monthly and yearly,
--		@ProductId INT = NULL
--Set @ClientTypeId = 1
--Set @FilterDateType = 4
--Set @ProductId = 5

	
	DECLARE @PeriodDate DATE = NULL;

	IF(@FilterDateType IS NOT NULL AND @FilterDateType <> 5)
	BEGIN
		SELECT @PeriodDate =
			CASE WHEN @FilterDateType = 1 THEN DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 WHEN @FilterDateType = 2 THEN DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 WHEN @FilterDateType = 3 THEN DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 WHEN @FilterDateType = 4 THEN DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		END
	END

	SELECT [common].[QuoteStatus].Name AS QuoteStatus, COUNT([quote].[Quote].QuoteId) AS NumberOfQuotes
	FROM [quote].[Quote]
		INNER JOIN [common].[QuoteStatus] ON [common].[QuoteStatus].Id = [quote].[Quote].QuoteStatusId
		FULL JOIN [lead].[LeadProduct][LeadProduct] ON [LeadProduct].[QuoteId]  = [Quote].[QuoteId] 
		FULL JOIN [lead].[Company][Company] ON [Company].[LeadId] = [LeadProduct].[LeadId] 
		FULL JOIN [lead].[Contact][Contact] ON [Contact].[LeadId] = [LeadProduct].[LeadId] 
		FULL JOIN [lead].[Lead][Lead] ON [Lead].LeadId =  [LeadProduct].[LeadId] 
		FULL JOIN [common].[ClientType][ClientType] ON [Lead].ClientTypeId = [ClientType].[Id]
		FULL JOIN [Product].[Product] PP on [LeadProduct].ProductId = PP.Id
	Where [common].[QuoteStatus].Name IS NOT NULL
		AND (@ClientTypeId  IS NULL OR [ClientType].[Id] = @ClientTypeId OR @ClientTypeId = 8 )
		AND (@PeriodDate  IS NULL OR [Quote].[CreatedDate] >= @PeriodDate )
		AND (@ProductId  IS NULL OR PP.Id = @ProductId OR @ProductId = 0 )
	GROUP BY [common].[QuoteStatus].Name

END