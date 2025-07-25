CREATE PROCEDURE [billing].[GetRecoveryAgeAnalysis]
	@clientTypeId int,
	@ageTypeId int,
	@debtorStatus int, 
	@assignedStatus int,
	@balanceTypeId int,
	@endDate datetime,
	@includeInterest bit,
	@includeNotes bit,
	@counter int
as
begin

	--declare @clientTypeId int = 0
	--declare @ageTypeId int = 0
	--declare @debtorStatus int = 0
	--declare @assignedStatus int = 0
	--declare @balanceTypeId int = 0
	--declare @endDate datetime = '2020-08-03'
	--declare @includeInterest bit = 1
	--declare @includeNotes bit = 0
	--declare @counter int = 1

	set nocount on

	if @ageTypeId > 0 begin
		if @balanceTypeId = 0 begin
			set @balanceTypeId = 1
		end
	end

	declare @transactions table (
		[AccountId] int,
		[PolicyNumber] varchar(64),
		[StatusId] int,
		[Year] int,
		[Month] int,
		[AccountNumber] varchar(32),
		[ClientName] varchar(128),
		[ClientTypeId] int,
		[TransactionDate] date,
		[Period] int,
		[Amount] float,
		[Interest] float
	)

	insert into @transactions ([AccountId], [AccountNumber], [ClientName], [ClientTypeId], [PolicyNumber], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest])
		select rp.[RolePlayerId] [AccountId],
			fp.[FinPayeNumber] [AccountNumber],
			rp.[DisplayName] [ClientName],
			0 [ClientTypeId],
			isnull(p.[PolicyNumber], isnull(tp.[PolicyNumber], '')) [PolicyNumber],
			i.[InvoiceStatusId] [StatusId],
			year(bt.[TransactionDate]) [Year],
			month(bt.[TransactionDate]) [Month],
			bt.[TransactionDate],
			month(bt.[TransactionDate]) [Period],
			sum(case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
			sum(case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) [Interest]
		from [client].[RolePlayer] rp
			inner join [client].[FinPayee] fp on fp.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[Transactions] bt on bt.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[TransactionTypeLink] ttl on ttl.[Id] = bt.[TransactionTypeLinkId]
			left join [client].[Company] c on c.[RolePlayerId] = rp.[RolePlayerId]
			inner join [billing].[ClaimRecoveryInvoice] i on i.[ClaimRecoveryInvoiceId] = bt.[ClaimRecoveryInvoiceId]
			inner join [claim].[claim] cl on cl.[ClaimId] = i.[ClaimId]
			inner join [policy].[Policy] p on p.[PolicyId] = cl.[PolicyId]
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
		where bt.[TransactionDate] <= @endDate and bt.ClaimRecoveryInvoiceId is not null
			and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
		group by rp.[RolePlayerId],
			fp.[FinPayeNumber],
			rp.[DisplayName],
			c.[RolePlayerId],
			c.[ReferenceNumber],
			p.[PolicyNumber],
			i.InvoiceStatusId,
			p.[PolicyStatusId],
			bt.[TransactionDate],
			tp.[PolicyNumber],
			tp.[PolicyStatusId]
		order by bt.[TransactionDate]
	if (@clientTypeId > 0) begin
		delete from @transactions where [ClientTypeId] != @clientTypeId
	end
	if (@debtorStatus = 1) begin
		delete from @transactions where [StatusId] != 1
	end else if (@debtorStatus = 2) begin
		delete from @transactions where [StatusId] = 1
	end

	declare @analysis table (
		[AccountId] int,
		[AccountNumber] varchar(32),
		[ClientName] varchar(128),
		[ClientType] varchar(64),
		[PolicyNumber] varchar(64),
		[Status] varchar(16),
		[Balance] float,
		[Interest] float,
		[Current] float,
		[30Days] float,
		[60Days] float,
		[90Days] float,
		[120Days] float,
		[120PlusDays] float,
		[FilterAmount] float
	)

	insert into @analysis ([AccountId], [AccountNumber], [ClientName], [ClientType], [PolicyNumber], [Status], [Balance], [Interest], [Current], [30Days], [60Days], [90Days], [120Days], [120PlusDays], [FilterAmount])
	select [AccountId],
		[AccountNumber],
		[ClientName],
		case [ClientTypeId] when 0 then 'Recovery Age Analysis' else 'Unknown' end [ClientType],
		[PolicyNumber],
		case [StatusId] when 1 then 'Paid' when 2 then 'Unpaid' when 3 then 'Pending' when 4 then 'Partially' end,
		sum([Amount] + [Interest]) [Balance],
		sum([Interest]) [Interest],
		sum(case DATEDIFF(month, [TransactionDate], getdate()) when 0 then [Amount] else 0.00 end) [Current],
		sum(case DATEDIFF(month, [TransactionDate], getdate()) when 1 then [Amount] else 0.00 end) [30Days],
		sum(case DATEDIFF(month, [TransactionDate], getdate()) when 2 then [Amount] else 0.00 end) [60Days],
		sum(case DATEDIFF(month, [TransactionDate], getdate()) when 3 then [Amount] else 0.00 end) [90Days],
		sum(case DATEDIFF(month, [TransactionDate], getdate()) when 4 then [Amount] else 0.00 end) [120Days],
		sum(case when (DATEDIFF(month, [TransactionDate], getdate()) > 4) then [Amount] else 0.00 end) [120PlusDays],
		0.00 [FilterAmount]
	from @transactions
	group by [AccountId],
		[AccountNumber],
		[PolicyNumber],
		[StatusId],
		[ClientName],
		[ClientTypeId]

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
			a.[PolicyNumber],
			a.[Status] [PolicyStatus],
			a.[Balance],
			a.[Interest],
			a.[Current],
			a.[30Days] [Balance30Days],
			a.[60Days] [Balance60Days],
			a.[90Days] [Balance90Days],
			a.[120Days] [Balance120Days],
			a.[120PlusDays] [Balance120PlusDays],
			aa.[CollectionAgent],
			aa.[DebtorsClerk],
			n1.[NoteId] [NoteId1],
			n1.[NoteUser] [User1],
			n1.[NoteDate] [Date1],
			n1.[NoteText] [Note1],
			n2.[NoteId] [NoteId2],
			n2.[NoteUser] [User2],
			n2.[NoteDate] [Date2],
			n2.[NoteText] [Note2],
			n3.[NoteId] [NoteId3],
			n3.[NoteUser] [User3],
			n3.[NoteDate] [Date3],
			n3.[NoteText] [Note3],
			cast(0 as bit) [Selected]
		from @analysis a
			left join [billing].[AgeAnalysisAgent] aa on 
				aa.[RolePlayerId] = a.[AccountId] and 
				iif(isnull(aa.[CollectionAgent], 'x') = '', 'x', isnull(aa.[CollectionAgent], 'x')) = case @assignedStatus when 0 then isnull(aa.[CollectionAgent], '') when 1 then aa.[CollectionAgent] else 'x' end
			left join @notes n1 on a.[AccountId] = n1.[RolePlayerId] and n1.[NoteRank] = 1
			left join @notes n2 on a.[AccountId] = n2.[RolePlayerId] and n2.[NoteRank] = 2
			left join @notes n3 on a.[AccountId] = n3.[RolePlayerId] and n3.[NoteRank] = 3
		order by [AccountNumber]
	end else begin
		select distinct a.[AccountId],
			a.[AccountNumber],
			a.[ClientName],
			a.[ClientType],
			a.[PolicyNumber],
			a.[Status] [PolicyStatus],
			a.[Balance],
			a.[Interest],
			a.[Current],
			a.[30Days] [Balance30Days],
			a.[60Days] [Balance60Days],
			a.[90Days] [Balance90Days],
			a.[120Days] [Balance120Days],
			a.[120PlusDays] [Balance120PlusDays],
			null [CollectionAgent],
			null [DebtorsClerk],
			null [Note1],
			null [User1],
			null [Date1],
			null [Note2],
			null [User2],
			null [Date2],
			null [Note3],
			null [User3],
			null [Date3],
			cast(0 as bit) [Selected]
		from @analysis a
		order by [AccountNumber]
	end
end
