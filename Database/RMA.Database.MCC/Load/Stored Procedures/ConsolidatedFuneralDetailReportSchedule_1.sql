
CREATE   PROCEDURE [Load].[ConsolidatedFuneralDetailReportSchedule]
AS BEGIN

	declare @endDate date = cast(getdate() as date)
	declare @startDate date = dateadd(week, -1, @endDate)
	
	exec [Load].[ConsolidatedFuneralDetailReport] @startDate, @endDate

END