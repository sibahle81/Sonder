CREATE PROCEDURE policy.PolicyProcessTurnaroundReport @startDate date, @endDate datetime
AS BEGIN

	set @endDate = dateadd(day, 1, cast(@endDate as date))
	set @endDate = dateadd(minute, -1, @endDate)

	select * from (
	select case w.WizardConfigurationId
			when  22 then 'New Individual Policy'
			when  23 then 'New Scheme Policy'
			when  24 then 'Scheme Onboarding'
			when  25 then 'Manage Individual Policy'
			when  26 then 'Cancel Policy'
			when  33 then 'Reinstate Policy'
			when  34 then 'Continue Policy'
			when  44 then 'Manage Scheme Policy'
			when  71 then 'Lapse Policy'
			when 113 then 'CF Onboarding'
		end [Task],
		w.[Name] [WizardName],
		ws.[Name] [Status],
		w.CreatedDate [CreatedDate],
		w.CreatedDate [CreatedTime],
		isnull(cu.[DisplayName], w.CreatedBy) [CreatedBy],
		w.ModifiedDate [ApprovedDate],
		w.ModifiedDate [ApprovedTime],
		isnull(mu.[DisplayName], w.CreatedBy) [ApprovedBy],
		w.EndDateAndTime [CompletedDate],
		w.EndDateAndTime [CompletedTime],
		[bpm].[CalculateUserSLATimeElapsed](w.StartDateAndTime, w.EndDateAndTime) [TimeElapsed]
	from bpm.Wizard w (nolock)
		inner join common.WizardStatus ws (nolock) on ws.Id = w.WizardStatusId
		left join [security].[User] cu (nolock) on cu.Email = w.CreatedBy
		left join [security].[User] mu (nolock) on mu.Email = w.ModifiedBy
	where w.WizardConfigurationId in (22, 23, 24, 25, 26, 33, 34, 44, 71, 113)
	  and w.CreatedDate between @startDate and @endDate
	) t
	order by t.Task, t.CreatedDate

END
