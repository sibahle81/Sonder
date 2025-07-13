CREATE PROCEDURE [lead].[QuoteDashboard_AgeAnalysis]
AS
BEGIN
	declare @quoteAgeAnalysis table (QuoteStatus nvarchar(50), NumberOfQuotes int)
	insert into @quoteAgeAnalysis SELECT '0 To 30 Days', SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 0 AND 30  THEN 1 ELSE 0 END) FROM [quote].[Quote]
	Insert into @quoteAgeAnalysis SELECT '30 To 60 Days', SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 31 AND 60  THEN 1 ELSE 0 END) FROM [quote].[Quote]
	Insert into @quoteAgeAnalysis SELECT 'Over 60 Days', SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 61 AND 120 THEN 1 ELSE 0 END) FROM [quote].[Quote]

	select * from @quoteAgeAnalysis
END