
CREATE   PROCEDURE [Load].[ConsolidatedFuneralSummaryReport] (@startDate date, @endDate date)
AS BEGIN

	--declare @startDate date = '2023-06-01'
	--declare @endDate date = '2023-08-16'

	declare @lead table (
		[Source] varchar(32),
		[WizardName] varchar(128),
		[WizardStatus] varchar(32),
		[CreatedBy] varchar(128),
		[CreatedDate] datetime,
		[FirstName] varchar(64),
		[Surname] varchar(64),
		[IdNumber] varchar(32),
		[Affordable] varchar(32),
		[PolicyId] int,
		[PolicyNumber] varchar(32),
		[PolicyStatusId] int,
		[QADD] varchar(32)
	)

	insert into @lead
		select c.[Source],
			c.WizardName,
			c.WizardStatus,
			c.CreatedBy,
			c.CreatedDate,
			c.FirstName,
			c.Surname,
			c.IdNumber,
			case isnull(c.PolicyId, 0) when 0 then '' else c.Affordable end [Affordable],
			c.PolicyId,
			c.PolicyNumber,
			c.PolicyStatusId,
			case q.[StatusCode] when '200' then 'Passed' when '400' then 'Failed' else '' end QADD
		from (
			select distinct b.WizardId,
				b.[Source],
				b.WizardName,
				b.FileIdentifier,
				b.WizardStatus,
				b.CreatedBy,
				b.CreatedDate,
				b.FirstName,
				b.Surname,
				b.IdNumber,
				b.Affordable,
				case b.WizardStatus when 'Completed' then p.PolicyId else null end [PolicyId],
				case b.WizardStatus when 'Completed' then p.PolicyNumber else '' end [PolicyNumber],
				case b.WizardStatus when 'Completed' then p.PolicyStatusId else null end [PolicyStatusId]
			from (
				select a.WizardId,
					a.[Source],
					a.WizardName,
					a.FileIdentifier,
					a.WizardStatus,
					a.CreatedBy,
					a.CreatedDate,
					upper(cf.FirstName) [FirstName],
					upper(cf.Surname) [Surname],
					case len(cf.IdNumber) when 13 then cf.IdNumber else cast(cf.DateOfBirth as varchar(16)) end [IdNumber],
					cf.[AffordibilityChecked] [Affordable]
				from (
					select w.[Id] [WizardId],
						case right(w.[Name], 14) when 'CFP Tablet App' then 'Tablet' else 'Manual' end [Source],
						w.[Name] [WizardName],
						json_value(w.[Data], '$[0].fileIdentifier') [FileIdentifier],
						ws.[Name] [WizardStatus],
						case w.[CreatedBy] when 'BackendProcess' then 'Tablet User' else isnull(u.[DisplayName], w.[CreatedBy]) end [CreatedBy],
						w.[CreatedDate]
					from [bpm].[Wizard] w (nolock)
						inner join [common].[WizardStatus] ws (nolock) on ws.[Id] = w.[WizardStatusId]
						left join [security].[User] u (nolock) on u.[Email] = w.[CreatedBy]
					where w.WizardConfigurationId = 113
					  and w.CreatedDate >= @startDate 
					  and w.CreatedDate < dateadd(day, 1, @endDate)
				) a
				inner join Load.ConsolidatedFuneral cf (nolock) on cf.FileIdentifier = a.FileIdentifier and cf.ClientType = 'Main Member' and left(cf.ProductOption, 4) = 'Cons'
			) b
			left join [Load].[ConsolidatedFuneralMember] m (nolock) on m.[FileIdentifier] = b.[FileIdentifier] and m.[IdNumber] = b.[IdNumber] and m.[CoverMemberTypeId] = 1
			left join [policy].[Policy] p (nolock) on p.[PolicyId] = m.[PolicyId]
		) c
		left join (
			select [PolicyId],
				[StatusCode]
			from (
				select q.ItemId [PolicyId],
					q.StatusCode,
					Rank() over (partition by ItemId order by CreatedDate desc) [Rank]
				from [client].[QlinkTransaction] q (nolock)
				Where q.QlinkTransactionTypeId = 1  -- QADD Transaction
				  and q.ItemType = 'Policy'
			) t
			where [Rank] = 1
		) q on q.PolicyId = c.PolicyId

	-- TODO
	-- Add Commissions Due Column (Yes/No)

	-- Do not include cancelled wizards
	delete from @lead where [WizardStatus] = 'Cancelled'

	declare @report table (
		Source varchar(32) primary key,
		Leads int,
		InProgress int,
		AwaitingApproval int,
		Cancelled int,
		Rejected int,
		PoliciesCreated int,
		Affordable int,
		NotAffordable int,
		PoliciesCancelled int,
		QADDPassed int,
		QADDFailed int,
		CommissionDue int
	)

	insert into @report ([Source], [Leads], [InProgress], [AwaitingApproval], [Cancelled], [Rejected], [PoliciesCreated], [Affordable], [NotAffordable], [PoliciesCancelled], [QADDPassed], [QADDFailed], [CommissionDue])
		select [Source],
			count(*) [Leads],
			0 [InProgress],
			0 [AwaitingApproval],
			0 [Cancelled],
			0 [Rejected],
			sum(case isnull([PolicyId], 0) when 0 then 0 else 1 end) [PoliciesCreated],
			sum(case [Affordable] when 'Affordable' then 1 else 0 end) [Affordable],
			sum(case [Affordable] when 'Not Affordable' then 1 else 0 end) [NotAffordable],
			sum(case [PolicyStatusId] when 2 then 1 when 10 then 1 else 0 end) [PoliciesCancelled],
			sum(case [QADD] when 'Passed' then 1 else 0 end) [QADDPassed],
			sum(case [QADD] when 'Failed' then 1 else 0 end) [QADDFailed],
			cast(0 as int) [CommissionDue]
		from @lead
		group by [Source]

	update r set
		r.[InProgress] = t.[InProgress],
		r.[AwaitingApproval] = t.[AwaitingApproval],
		r.[Cancelled] = t.[Cancelled],
		r.[Rejected] = t.[Rejected]
	from (
		select [Source],
			sum(case [WizardStatus] when 'In Progress' then 1 else 0 end) [InProgress],
			sum(case [WizardStatus] when 'Awaiting Approval' then 1 else 0 end) [AwaitingApproval],
			sum(case [WizardStatus] when 'Cancelled' then 1 else 0 end) [Cancelled],
			sum(case [WizardStatus] when 'Rejected' then 1 else 0 end) [Rejected]
		from (
			select [Source], [WizardName], [WizardStatus], count(*) [Records] from @lead group by [Source], [WizardName], [WizardStatus]
		) t
		group by [Source]
	) t inner join @report r on r.[Source] = t.[Source]

	select [Source],
		[Leads],
		--[InProgress],
		[AwaitingApproval],
		--[Cancelled],
		[Rejected],
		[PoliciesCreated],
		[Affordable],
		[NotAffordable],
		[PoliciesCancelled],
		[QADDPassed],
		[QADDFailed],
		[CommissionDue]
	from @report 
	order by [Source]
END