CREATE   PROCEDURE [billing].[GetAgeAnalysisReconReport]
	@clientTypeId int,
	@ageTypeId int,
	@debtorStatus int,
	@assignedStatus int,
	@balanceTypeId int,
	@industryId int,
	--@endDate datetime,
	@endDate datetime,
	@includeInterest bit,
	@includeNotes bit,
	@counter int
as
begin

	--declare @clientTypeId int = 0               -- 0=all 1=individual 2=group 3=corporate
	--declare @ageTypeId int = 0                  -- 0=all 1=current 2=30 days 3=60 days 4=90 days 5=120 days 6=120+ days
	--declare @debtorStatus int = 0               -- 0=all 1=active 2=inactive
	--declare @assignedStatus int = 0             -- 0=all 1=assigned to debtors clerk 2=unassigned to clerk
	--declare @balanceTypeId int = 0              -- 0=all 1=all non-zero 2=greater than zero 3=less than zero
	--declare @industryId int = 1                 -- 0=all, rest read from common.IndustryClass
	--declare @endDate datetime = '2020-09-30'
	--declare @includeInterest bit = 0
	--declare @includeNotes bit = 0
	--declare @counter int = 1

	set nocount on

	if @ageTypeId > 0 begin
		if @balanceTypeId = 0 begin
			set @balanceTypeId = 1
		end
	end

	declare @transactions table (
		[TransactionId] int,
		[AccountId] int,
		[CollectionAgent] varchar(128),
		[DebtorsClerk] varchar(128),
		[StatusId] int,
		[Year] int,
		[Month] int,
		[AccountNumber] varchar(32),
		[ClientName] varchar(128),
		[ClientTypeId] int,
		[IndustryClassId] int,
		[TransactionDate] date,
		[Period] int,
		[Amount] float,
		[Interest] float,
		[CreatedDate] date,
		[Balance] float,
		[RowNumber] int,
		index tidx_clientTypeId ([ClientTypeId]),
		index tidx_statusId ([StatusId]),
		index tidx_industryClassId ([IndustryClassId]),
		index tidx_collectionAgent ([CollectionAgent])
	)

	insert into @transactions ([TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance], [RowNumber])
		select distinct bt.[TransactionId],
		    rp.[RolePlayerId] [AccountId],
			fp.[FinPayeNumber] [AccountNumber],
			rp.[DisplayName] [ClientName],
			case isnull(c.[RolePlayerId], 0) when 0 then 1 else (case right(isnull(c.[ReferenceNumber], '99'), 2) when '99' then 2 else 3 end) end [ClientTypeId],
			isnull(aaa.[CollectionAgent], '') [CollectionAgent],
			isnull(aaa.[DebtorsClerk], '') [DebtorsClerk],
			isnull(ind.[IndustryClassId], 0) [IndustryClassId],
			isnull(tp.[PolicyStatusId], 0) [StatusId],
			year(bt.[TransactionDate]) [Year],
			month(bt.[TransactionDate]) [Month],
			bt.[TransactionDate],
			month(bt.[TransactionDate]) [Period],
			(case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
			(case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) [Interest],
			bt.CreatedDate,
			(dbo.GetTransactionBalance(TransactionId)),
			ROW_NUMBER() OVER (PARTITION BY bt.TransactionId ORDER BY bt.TransactionId)
		from [client].[RolePlayer] rp
			inner join [client].[FinPayee] fp on fp.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[Transactions] bt on bt.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[TransactionTypeLink] ttl on ttl.[Id] = bt.[TransactionTypeLinkId]
			left join [billing].[AgeAnalysisAgent] aaa on aaa.[RolePlayerId] = rp.[RolePlayerId]
			left join [client].[Company] c on c.[RolePlayerId] = rp.[RolePlayerId]
			left join [common].[Industry] ind on ind.[Id] = fp.[IndustryId]
			left join (
				select [PolicyId],
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId],
					count(*) [Policies]
				from [policy].[Policy]
				group by [PolicyId],	
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId]
				having count(*) = 1
			) tp on tp.[PolicyOwnerId] = rp.[RolePlayerId]
		where bt.[CreatedDate] <= @endDate
			and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
			and EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= bt.TransactionDate and p.[Status] != 'Future')
			and isnull(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, isnull(ind.[IndustryClassId], 0))
			-- Exclude claims transactions
			and bt.[TransactionTypeId] not in (14, 15, 16)
			and bt.[TransactionTypeId] = 6
		order by bt.[TransactionDate]

    insert into @transactions ([TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance], [RowNumber])
        select distinct bt.[TransactionId],
			rp.[RolePlayerId] [AccountId],
			fp.[FinPayeNumber] [AccountNumber],
			rp.[DisplayName] [ClientName],
			case isnull(c.[RolePlayerId], 0) when 0 then 1 else (case right(isnull(c.[ReferenceNumber], '99'), 2) when '99' then 2 else 3 end) end [ClientTypeId],
			isnull(aaa.[CollectionAgent], '') [CollectionAgent],
			isnull(aaa.[DebtorsClerk], '') [DebtorsClerk],
			isnull(ind.[IndustryClassId], 0) [IndustryClassId],
			isnull(tp.[PolicyStatusId], 0) [StatusId],
			year(bt.[TransactionDate]) [Year],
			month(bt.[TransactionDate]) [Month],
			bt.[CreatedDate],
			month(bt.[TransactionDate]) [Period],
			(case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
			(case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) [Interest],
			bt.CreatedDate,
			(dbo.GetTransactionBalance(TransactionId)),
			ROW_NUMBER() OVER (PARTITION BY bt.TransactionId ORDER BY bt.TransactionId)
		from [client].[RolePlayer] rp
			inner join [client].[FinPayee] fp on fp.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[Transactions] bt on bt.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[TransactionTypeLink] ttl on ttl.[Id] = bt.[TransactionTypeLinkId]
			left join [billing].[AgeAnalysisAgent] aaa on aaa.[RolePlayerId] = rp.[RolePlayerId]
			left join [client].[Company] c on c.[RolePlayerId] = rp.[RolePlayerId]
			left join [common].[Industry] ind on ind.[Id] = fp.[IndustryId]
			left join (
				select [PolicyId],
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId],
					count(*) [Policies]
				from [policy].[Policy]
				group by [PolicyId],	
					[PolicyOwnerId],
					[PolicyNumber],
					[PolicyStatusId]
				having count(*) = 1
			) tp on tp.[PolicyOwnerId] = rp.[RolePlayerId]
		where bt.[CreatedDate] <= @endDate
			and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
			and NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
			and isnull(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, isnull(ind.[IndustryClassId], 0))
			-- Exclude claims transactions
			and bt.[TransactionTypeId] not in (14, 15, 16)
			and bt.[TransactionTypeId] != 6
		order by bt.[CreatedDate]

    delete t from @transactions t where t.RowNumber <> 1

	if (@clientTypeId > 0) begin
		delete from @transactions where [ClientTypeId] != @clientTypeId
	end

	if @assignedStatus = 1 begin
		 delete from @transactions where [CollectionAgent] = ''
	end else if @assignedStatus = 2 begin
		delete from @transactions where [CollectionAgent] != ''
	end

	declare @analysis table (
		[AccountId] int,
		[AccountNumber] varchar(32),
		[ClientName] varchar(128),
		[ClientType] varchar(64),
		[Industry] varchar(64),
		[Status] varchar(16),
		[CollectionAgent] varchar(128),
		[DebtorsClerk] varchar(128),
		[Balance] float,
		[Interest] float,
		[Current] float,
		[30Days] float,
		[60Days] float,
		[90Days] float,
		[120Days] float,
		[120PlusDays] float,
		[FilterAmount] float,
		index tidx_filterAmount ([FilterAmount])
	)

	update @transactions set [StatusId] = 1 where [StatusId] NOT IN (2, 4, 5, 8, 11, 13)

	if (@debtorStatus = 1) begin
		delete from @transactions where [StatusId] != 1
	end else if (@debtorStatus = 2) begin
		delete from @transactions where [StatusId] = 1
	end

	insert into @analysis ([AccountId], [AccountNumber], [ClientName], [ClientType], [Industry], [Status], [CollectionAgent], [DebtorsClerk], [Balance], [Interest], [Current], [30Days], [60Days], [90Days], [120Days], [120PlusDays], [FilterAmount])
		select t.[AccountId],
		t.[AccountNumber],
		t.[ClientName],
		case t.[ClientTypeId] when 1 then 'Individual' when 2 then 'Group' when 3 then 'Corporate' else 'Unknown' end [ClientType],
		cit.[Name] [Industry],
		case t.[StatusId] when 1 then 'Active' else 'Inactive' end [Status],
		t.[CollectionAgent],
		t.[DebtorsClerk],
		sum([Balance]) [Balance],
		sum([Interest]) [Interest],
		sum(case when DATEDIFF(day, [TransactionDate], getdate()) < 30  then [Balance] else 0.00 end) [Current],
		sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 30 and DATEDIFF(day, [TransactionDate], getdate()) < 60 then [Balance] else 0.00 end) [30Days],
		sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 60 and DATEDIFF(day, [TransactionDate], getdate()) < 90 then [Balance] else 0.00 end) [60Days],
		sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 90 and DATEDIFF(day, [TransactionDate], getdate()) < 120 then [Balance] else 0.00 end) [90Days],
		sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 120 and DATEDIFF(day, [TransactionDate], getdate()) < 150 then [Balance] else 0.00 end) [120Days],
		sum(case when (DATEDIFF(day, [TransactionDate], getdate()) >= 150) then [Balance] else 0.00 end) [120PlusDays],
		0.00 [FilterAmount]
	from @transactions t
	    left join [common].[IndustryClass] cit on cit.[Id] = t.IndustryClassId
	group by t.[AccountId],
		t.[AccountNumber],
		t.[StatusId],
		t.[CollectionAgent],
		t.[DebtorsClerk],
		t.[ClientName],
		t.[ClientTypeId],
		cit.[Name]

	if @ageTypeId = 0 begin
		update @analysis set [FilterAmount] = [Balance]
	end else if @ageTypeId = 1 begin
		update @analysis set [FilterAmount] = [Current]
	end else if @ageTypeId = 2 begin
		update @analysis set [FilterAmount] = [30Days]
	end else if @ageTypeId = 3 begin
		update @analysis set [FilterAmount] = [60Days]
	end else if @ageTypeId = 4 begin
		update @analysis set [FilterAmount] = [90Days]
	end else if @ageTypeId = 5 begin
		update @analysis set [FilterAmount] = [120Days]
	end else if @ageTypeId = 6 begin
		update @analysis set [FilterAmount] = [120PlusDays]
	end

	if @balanceTypeId = 1 begin	         -- All non-zero
		delete from @analysis where round([FilterAmount], 2) = 0.00
	end else if @balanceTypeId = 2 begin -- Greater than zero
		delete from @analysis where round([FilterAmount], 2) <= 0.00
	end else if @balanceTypeId = 3 begin -- Less than zero
		delete from @analysis where round([FilterAmount], 2) >= 0.00
	end

	delete a1 from @analysis a1 where Exists (Select * From @analysis a2 where a2.AccountId = a1.AccountId and a2.[Status] = 'Active') and a1.[Status] = 'Inactive'

	if @includeNotes = 1 begin

		declare @notes table (
			RolePlayerId int,
			NoteId int,
			NoteUser varchar(128),
			NoteRank int,
			NoteDate datetime,
			NoteText varchar(max)
		)

		insert into @notes
		select * from (
			select n.[RolePlayerId],	
				n.[Id] [NoteId],
				n.[CreatedBy],
				RANK () OVER (PARTITION BY n.[RolePlayerId] ORDER BY n.[CreatedDate] desc) [NoteRank],
				n.[CreatedDate],
				n.[Text]
			from [billing].[AgeAnalysisNote] n
				inner join @analysis a on a.AccountId = n.[RolePlayerId]
			where n.[IsDeleted] = 0
		) n
		where n.[NoteRank] < 4
		order by n.[RolePlayerId],
			n.[NoteRank]

		select distinct a.[AccountId],
			a.[AccountNumber],
			a.[ClientName],
			a.[ClientType],
			a.[Industry],
			a.[Status] [PolicyStatus],
			a.[Balance],
			a.[Interest],
			a.[Current],
			Case when DATEDIFF(day, @endDate, getdate()) < 30  then a.[Current] 
			     when DATEDIFF(day, @endDate, getdate()) >= 30 and DATEDIFF(day, @endDate, getdate()) < 60 then a.[30Days]
				 when DATEDIFF(day, @endDate, getdate()) >= 60 and DATEDIFF(day, @endDate, getdate()) < 90 then a.[60Days]
				 when DATEDIFF(day, @endDate, getdate()) >= 90 and DATEDIFF(day, @endDate, getdate()) < 120 then a.[90Days] 
			     when DATEDIFF(day, @endDate, getdate()) >= 120 and DATEDIFF(day, @endDate, getdate()) < 150 then a.[120Days] 
			     when DATEDIFF(day, @endDate, getdate()) >= 150 then a.[120PlusDays] else a.[Balance] end [CurrentBalance],
			a.[30Days] [Balance30Days],
			a.[60Days] [Balance60Days],
			a.[90Days] [Balance90Days],
			a.[120Days] [Balance120Days],
			a.[120PlusDays] [Balance120PlusDays]
		from @analysis a
			left join @notes n1 on a.[AccountId] = n1.[RolePlayerId] and n1.[NoteRank] = 1
			left join @notes n2 on a.[AccountId] = n2.[RolePlayerId] and n2.[NoteRank] = 2
			left join @notes n3 on a.[AccountId] = n3.[RolePlayerId] and n3.[NoteRank] = 3
		order by [AccountNumber]
	end else begin
		select distinct a.[AccountId],
			a.[AccountNumber],
			a.[ClientName],
			a.[ClientType],
			a.[Industry],
			a.[Status] [PolicyStatus],
			a.[Balance],
			a.[Interest],
			a.[Current],
			Case when DATEDIFF(day, @endDate, getdate()) < 30  then a.[Current] 
			     when DATEDIFF(day, @endDate, getdate()) >= 30 and DATEDIFF(day, @endDate, getdate()) < 60 then a.[30Days]
				 when DATEDIFF(day, @endDate, getdate()) >= 60 and DATEDIFF(day, @endDate, getdate()) < 90 then a.[60Days]
				 when DATEDIFF(day, @endDate, getdate()) >= 90 and DATEDIFF(day, @endDate, getdate()) < 120 then a.[90Days] 
			     when DATEDIFF(day, @endDate, getdate()) >= 120 and DATEDIFF(day, @endDate, getdate()) < 150 then a.[120Days] 
			     when DATEDIFF(day, @endDate, getdate()) >= 150 then a.[120PlusDays] else a.[Balance] end [CurrentBalance],
			a.[30Days] [Balance30Days],
			a.[60Days] [Balance60Days],
			a.[90Days] [Balance90Days],
			a.[120Days] [Balance120Days],
			a.[120PlusDays] [Balance120PlusDays]
		from @analysis a
		order by [AccountNumber]
	end
end
GO

