
CREATE   PROCEDURE [Load].[ConsolidatedFuneralSummaryReportSchedule]
AS BEGIN

	declare @endDate date = cast(getdate() as date)
	declare @startDate date = dateadd(week, -1, @endDate)
	
	exec [Load].[ConsolidatedFuneralSummaryReport] @startDate, @endDate
	
END