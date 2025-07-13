CREATE PROCEDURE [lead].[QuoteDashboard_QuoteList]
@StatusID INT
AS
BEGIN
	SELECT *
    FROM [quote].[Quote]
	WHERE QuoteStatusId = @StatusID
END