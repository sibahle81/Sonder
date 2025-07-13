CREATE PROCEDURE bpm.GetManagerWizardCasesReport @startDate date, @endDate date
AS BEGIN

select cw.[Name] as 'Status',
	wc.[DisplayName],
	wc.Id,
	bw.LockedToUser,
	bw.[Name],
	bw.CreatedBy,
	bw.CreatedDate
from bpm.wizard bw
	left join  bpm.WizardConfiguration WC on WC.Id = bw.WizardConfigurationId
	left join common.wizardstatus cw on cw.id = bw.WizardStatusId
where wc.Id in (7,9,17,20,22,23,24,25,26,30,33,34,44,53,91,100,109,113,118)
    and bw.CreatedDate between @startDate and dateadd(day, 1, @endDate)
	and WizardStatusId in (1,4,5,6) 
order by bw.CreatedDate desc

END
GO
