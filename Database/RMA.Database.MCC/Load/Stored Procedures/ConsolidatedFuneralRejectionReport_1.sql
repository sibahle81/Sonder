
CREATE   PROCEDURE [Load].[ConsolidatedFuneralRejectionReport] (@startDate date, @endDate date)
AS BEGIN

	--declare @endDate date = cast(getdate() as date)
	--declare @startDate date = dateadd(day, -1, @endDate)

	select * from (
		select t.[WizardId],
			t.[WizardName],
			t.[WizardStatus],
			t.[FileIdentifier],
			case substring(t.[WizardName], charindex('-', t.[WizardName]) + 2, 100)
				when 'CFP Tablet App' then 'Tablet Lead Submission'
				when 'SA Government' then 'Manual Lead Submission'
				else t.[CreatedBy]
			end [CreatedBy],
			t.[CreatedDate],
			'Rejected' [ErrorCategory],
			e.[MainMemberName],
			e.[MainMemberIdNumber],
			e.[ErrorMessage] [SystemMessage],
			'' [UserMessage]
		from (
				select w.[Id] [WizardId],
					w.[Name] [WizardName],
					w.[WizardStatusId],
					ws.[Name] [WizardStatus],
					json_value(w.[Data], '$[0].fileIdentifier') [FileIdentifier],
					isnull(u.[DisplayName], w.[CreatedBy]) [CreatedBy],
					w.CreatedDate
				from bpm.Wizard w with (nolock)
					inner join [common].[WizardStatus] ws with (nolock) on ws.[Id] = w.[WizardStatusId]
					left join [security].[User] u with (nolock) on u.[Email] = w.[CreatedBy]
				where w.WizardConfigurationId = 113
				  and w.WizardStatusId in (1, 5, 6)
				  and w.CreatedDate >= @startDate 
				  and w.CreatedDate < dateadd(day, 1, @endDate)
			) t
			inner join [Load].[ConsolidatedFuneralError] e with (nolock) on e.[FileIdentifier] = t.[FileIdentifier]
		) t
	where t.[ErrorCategory] is not null
	union
	select w.Id,
		w.Name,
		ws.Name,
		json_value(w.[Data], '$[0].fileIdentifier'),
		case substring(w.[Name], charindex('-', w.[Name]) + 2, 100)
			when 'CFP Tablet App' then 'Tablet Lead Submission'
			when 'SA Government' then 'Manual Lead Submission'
			else isnull(u.[DisplayName], w.[CreatedBy])
		end [CreatedBy],
		w.CreatedDate,
		case w.WizardStatusId
			when 5 then 'Rejected'
			when 6 then 'Displuted'
		end [ErrorCategory],
		concat(cf.[FirstName], ' ', cf.[Surname]) [MainMemberName],
		cf.[IdNumber] [MainMemberIdNumber],
		e.[ErrorMessage] [SystemMessage],
		n.[Text]
	from bpm.Wizard w with (nolock)
		inner join [common].[WizardStatus] ws with (nolock) on ws.[Id] = w.[WizardStatusId]
		inner join [bpm].[Note] n with (nolock) on
			n.[ItemId] = w.[Id] and
			n.[Text] like concat('%', case w.WizardStatusId when 5 then 'rejected' else 'disputed' end, '%')
		left join [security].[User] u with (nolock) on u.[Email] = w.[CreatedBy]
		left join [Load].[ConsolidatedFuneral] cf with (nolock) on cf.FileIdentifier = json_value(w.[Data], '$[0].fileIdentifier') and cf.[ClientType] = 'Main Member'
		left join [Load].[ConsolidatedFuneralError] e with (nolock) on e.[FileIdentifier] = json_value(w.[Data], '$[0].fileIdentifier')
	where w.WizardConfigurationId = 113
		and w.WizardStatusId in (5, 6)
		and w.CreatedDate >= @startDate 
		and w.CreatedDate < dateadd(day, 1, @endDate)
		and n.[Text] is not null
	order by [WizardId],
		[ErrorCategory]

END