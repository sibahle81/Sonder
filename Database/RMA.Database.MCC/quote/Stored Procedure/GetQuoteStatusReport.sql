CREATE PROCEDURE [lead].GetQuoteStatusReport
@QuoteStatusId INT = NULL, -- 1 - new , 2 - active , 3 - declined , 4 - followup          
@ClientTypeId INT = NULL, -- 1 indivual, 2 - AFFINITY, 3 - xcompany, 4 - group indvidual, 5 - gold wage, 6 - corporate , 7 - Group
@FilterDateType INT = NULL, -- daily, weekly, monthly and yearly,
@StartDate DATETIME, 
@EndDate DATETIME 

AS 
BEGIN
	
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
	
	
	SELECT  [Quote].[QuoteNumber], [Quote].[CreatedDate],[QuoteStatus].[Name] AS QuoteStatus, [Company].CompensationFundRegistrationNumber,[Company].[Name] AS Membername, [Contact].[Name] AS ContactPerson,[ClientType].[Name] AS ClientType, COUNT([LeadProduct].[LeadProductId]) AS ProductsInteresed 
	FROM [quote].[Quote][Quote] INNER JOIN
		   [lead].[LeadProduct][LeadProduct] ON [LeadProduct].[QuoteId]  = [Quote].[QuoteId] INNER JOIN
		   [common].[QuoteStatus][QuoteStatus] ON [QuoteStatus].[Id] = [Quote].[QuoteStatusId] INNER JOIN
           [lead].[Company][Company] ON [Company].[LeadId] = [LeadProduct].[LeadId] INNER JOIN
           [lead].[Contact][Contact] ON [Contact].[LeadId] = [LeadProduct].[LeadId] INNER JOIN
           [lead].[Lead][Lead] ON [Lead].LeadId =  [LeadProduct].[LeadId] INNER JOIN
           [common].[ClientType][ClientType] ON [Lead].ClientTypeId = [ClientType].[Id]
	WHERE(@QuoteStatusId IS NULL OR [Quote].[QuoteStatusId] = @QuoteStatusId OR @QuoteStatusId = 8  ) 
	AND (@ClientTypeId  IS NULL OR [ClientType].[Id] = @ClientTypeId OR @ClientTypeId = 8 )
	AND (@StartDate IS NULL OR [Quote].[CreatedDate]  >= @StartDate  AND [Quote].[CreatedDate] <= CONVERT(datetime2, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111))
	AND (@PeriodDate  IS NULL OR [Quote].[CreatedDate] >= @PeriodDate )
    GROUP BY  [Quote].[QuoteNumber], [Quote].[CreatedDate],[QuoteStatus].[Name], [Company].CompensationFundRegistrationNumber,[Company].[Name] , [Contact].[Name],[ClientType].[Name] 
	
END