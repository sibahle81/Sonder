CREATE PROCEDURE [policy].[PolicyMaintenanceChangesDetail] @startDate date, @endDate date
AS BEGIN

	declare @end datetime = dateadd(second, -1, dateadd(day, 1, cast(@endDate as datetime)))

	select w.Id [WizardId],
		w.[Name] [WizardName],
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
GO

exec [policy].[PolicyMaintenanceChangesDetail] '2023-09-01', '2023-09-30'
go