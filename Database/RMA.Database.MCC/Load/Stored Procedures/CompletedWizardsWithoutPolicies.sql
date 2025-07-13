CREATE PROCEDURE [Load].[CompletedWizardsWithoutPolicies] (@startDate date, @endDate date)
AS BEGIN

	--declare @startDate date = '2023-08-21'
	--declare @endDate date = '2023-08-28'

	select t.*,
		m.[MemberName],
		m.[IdNumber],
		m.[DateOfBirth],
		e.[ErrorCategory],
		e.[ErrorMessage]
	from (
		select w.[Id] [WizardId],
			w.[Name] [WizardName],
			ws.[Name] [WizardStatus],
			json_value([Data], '$[0].fileIdentifier') [FileIdentifier],
			w.CreatedBy,
			w.CreatedDate
		from bpm.Wizard w
			inner join common.WizardStatus ws on ws.Id = w.WizardStatusId
		where WizardConfigurationId = 113
		  and CreatedDate between @startDate and dateadd(day, 1, @endDate)
		  and WizardStatusId = 2
	) t 
		left join [Load].[ConsolidatedFuneralMember] m on m.[FileIdentifier] = t.[FileIdentifier] and m.[CoverMemberTypeId] = 1
		left join [Load].[ConsolidatedFuneralError] e on e.[FileIdentifier] = t.[FileIdentifier]
		left join [policy].[Policy] p on p.PolicyId = m.PolicyId
	where p.PolicyId is null
	order by t.CreatedDate

END
GO
