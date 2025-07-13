
CREATE   PROCEDURE [Load].[ConsolidatedFuneralDetailReport] (@startDate date, @endDate date)
AS BEGIN

	-- declare @startDate date = '2023-06-01'
	-- declare @endDate date = '2023-06-30'

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
		select -- c.WizardId,
			c.[Source],
			c.WizardName,
			-- c.FileIdentifier,
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
					where w.[WizardConfigurationId] = 113
						and w.[CreatedDate] between @startDate and dateadd(day, 1, @endDate)
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
					Rank() over (partition by ItemId order by CreatedDate desc) [Rank] -- [t0].[QlinkTransactionId], [t0].[QlinkTransactionTypeId], [t0].[ItemType], [t0].[ItemId], [t0].[Request], [t0].[Response], [t0].[StatusCode], [t0].[IsDeleted], [t0].[CreatedDate], [t0].[CreatedBy], [t0].[ModifiedDate], [t0].[ModifiedBy]
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

	select * from @lead
END