--declare @startDate datetime = '2023-10-16'
--declare @endDate datetime = dateadd(second, -1, dateadd(week, 1, @startDate))

CREATE   PROCEDURE [policy].[PolicyMaintenanceChangesDetail] @startDate date = null, @endDate date = null
AS BEGIN

	if @startDate is null begin
		declare @today date = getdate()
		set @startDate = dateadd(week, -1, dateadd(day, 2 - datepart(weekday, @today), @today))
		set @endDate = dateadd(day, 6, @startDate)
	end

	declare @end datetime = dateadd(second, -1, dateadd(day, 1, cast(@endDate as datetime)))

	select w.[Name] [WizardName],
		ws.[Name] [WizardStatus],
		w.[CreatedBy],
		w.[CreatedDate],
		p.[PolicyId],
		p.[PolicyNumber],
		p.PolicyInceptionDate,
		ps.[Name] [PolicyStatus],
		upper(concat(per.FirstName, ' ', per.Surname)) [MemberName],
		per.IdNumber,
		per.DateOfBirth,
		sum(iif(pil.InsuredLifeStatusId = 1, 1, 0)) [Members],
		sum(iif(pil.InsuredLifeStatusId = 1 and pil.StartDate >= @startDate and pil.CreatedDate > w.CreatedDate, 1, 0)) [MembersAdded],
		sum(iif(pil.InsuredLifeStatusId = 2 and pil.ModifiedDate > w.CreatedDate, 1, 0)) [MembersRemoved]
	from bpm.Wizard w (nolock)
		inner join common.WizardStatus ws (nolock) on ws.Id = w.WizardStatusId
		inner join policy.Policy p (nolock) on p.PolicyId = w.LinkedItemId
		inner join common.PolicyStatus ps (nolock) on ps.Id = p.PolicyStatusId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		inner join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
	where w.WizardConfigurationId = 25
	  and w.CreatedDate between @startDate and @end
	  and w.WizardStatusId = 2
	group by w.Id,
		w.[Name],
		ws.[Name],
		w.[CreatedBy],
		w.[CreatedDate],
		p.[PolicyId],
		p.[PolicyNumber],
		p.PolicyInceptionDate,
		ps.[Name],
		per.FirstName,
		per.Surname,
		per.IdNumber,
		per.DateOfBirth
	order by w.Id

END