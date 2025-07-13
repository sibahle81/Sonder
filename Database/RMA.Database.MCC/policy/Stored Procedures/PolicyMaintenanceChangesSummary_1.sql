	--declare @today date = getdate()
	--declare @startDate date = dateadd(week, -1, dateadd(day, 2 - datepart(weekday, @today), @today))
	--declare @endDate date = dateadd(day, 6, @startDate)

CREATE   PROCEDURE [policy].[PolicyMaintenanceChangesSummary] @startDate date = null, @endDate date = null
AS BEGIN

	if @startDate is null begin
		declare @today date = getdate()
		set @startDate = dateadd(week, -1, dateadd(day, 2 - datepart(weekday, @today), @today))
		set @endDate = dateadd(day, 6, @startDate)
	end

	declare @wizard table (
		WizardName varchar(128),
		WizardStatus varchar(32),
		CreatedBy varchar(128),
		CreatedDate datetime,
		PolicyId int, 
		PolicyNumber varchar(32),
		PolicyInceptionDate date,
		PolicyStatus varchar(32),
		MemberName varchar(128),
		IdNumber varchar(16),
		DateOfBirth date,
		Members int,
		MembersAdded int,
		MembersRemoved int
	)

	insert into @wizard exec [policy].[PolicyMaintenanceChangesDetail] @startDate, @endDate

	select count(*) [MaintenanceCases],
		isnull(sum([Members]), 0) [ActiveMembers],
		isnull(sum([MembersAdded]), 0) [MembersAdded],
		isnull(sum([MembersRemoved]), 0) [MembersRemoved]
	from @wizard

END