--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE procedure [billing].[AgeAnalysisReport]
    @clientTypeId int,
	@ageTypeId int,
	@balanceTypeId int,
	@includeZeroBalance bit,
	@endDate datetime
as
begin
	set nocount on

	-- Add this to the paramenter list at a later stage
	declare @includeNotes bit
	set @includeNotes = 1

	if (@ageTypeId > 0 or @balanceTypeId > 0) begin
		set @includeZeroBalance = 0
	end

	drop table if exists #AgeNotes
	drop table if exists #AgeAnalysis

	CREATE TABLE #AgeNotes (
		[PolicyId] [int] NOT NULL,
		[Rank] [int] NOT NULL,
		[Text] [varchar](max) NOT NULL,
		[CreatedDate] [datetime] NOT NULL,
		[CreatedBy] [varchar](50) NOT NULL,
		PRIMARY KEY ([PolicyId], [Rank])
	)
	create index idx_temp_agenotes on #AgeNotes([PolicyId])
		if (@includeNotes = 1) begin
			insert into #AgeNotes
			select * from (
				select [ItemId] [PolicyId],
					RANK() OVER (PARTITION BY [ItemType], [ItemId] ORDER BY [Id] desc) [Rank],
					[Text],
					[CreatedDate],
					[CreatedBy]
				from [policy].[Note]
				where [ItemType] = 'Policy'
				and [IsActive] = 1
			) n
			where n.[Rank] <= 3
		end

	CREATE TABLE #AgeAnalysis(
		[Id] [int] IDENTITY PRIMARY KEY NOT NULL,
		[ClientId] [int] NOT NULL,
		[ClientNo] [varchar](50) NOT NULL,
		[ClientName] [varchar](50) NOT NULL,
		[PolicyId] [int] NOT NULL,
		[PolicyNo] [varchar](50) NOT NULL,
		[CollectionAgent] [varchar](100) NULL,
		[DebtorClerk] [varchar](100) NULL,
		[Balance] [float] NOT NULL,
		[BalanceInterest] [float] NOT NULL,
		[BalanceCurrent] [float] NOT NULL,
		[Balance30days] [float] NOT NULL,
		[Balance60days] [float] NOT NULL,
		[Balance90days] [float] NOT NULL,
		[Balance120days] [float] NOT NULL,
		[Balance120plus] [float] NOT NULL,
		[InterestCharged] [bit] NOT NULL,
		[Status] [varchar](50) NULL,
		[Notes] [int] NULL DEFAULT 0,
		[Note1] [varchar](max) NULL,
		[User1] [varchar](50) NULL,
		[Date1] [datetime] NULL,
		[Note2] [varchar](max) NULL,
		[User2] [varchar](50) NULL,
		[Date2] [datetime] NULL,
		[Note3] [varchar](max) NULL,
		[User3] [varchar](50) NULL,
		[Date3] [datetime] NULL,
		[IsActive] [bit] NOT NULL,
		[IsDeleted] [bit] NOT NULL,
		[CreatedBy] [varchar](50) NOT NULL,
		[CreatedDate] [datetime] NOT NULL,
		[ModifiedBy] [varchar](50) NOT NULL,
		[ModifiedDate] [datetime] NOT NULL
	)
	create index idx_temp_ageanalysis on #AgeAnalysis([PolicyId])
		insert into #AgeAnalysis ([ClientId], [ClientNo], [ClientName], [PolicyId], [PolicyNo], [Status], [CollectionAgent], [DebtorClerk], [Balance], [BalanceInterest], [BalanceCurrent], [Balance30days], [Balance60days], [Balance90days], [Balance120days], [Bal
ance120plus], [InterestCharged], [Notes], [IsActive], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		select c.[Id] [ClientId]
		,upper(c.[ReferenceNumber]) [ClientNo]
		,iif(trim(c.[Description]) = '', c.[Name], c.[Description]) [ClientName]
		,p.[Id] [PolicyId]
		,upper(p.[PolicyNumber]) [PolicyNo]
		,p.[Status]
		,p.[CollectionAgent]
		,p.[DebtorClerk]
		,isnull(sum(case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end), 0.00) [Balance]
		,isnull(sum(case pd.TransactionType when 7 then pd.Amount else 0.00 end), 0.00) [BalanceInterest]
		,isnull(sum(case DATEDIFF(month, pd.[PaymentDate], getdate()) when 0 then case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end else 0.0 end), 0.00) [BalanceCurrent]
		,isnull(sum(case DATEDIFF(month, pd.[PaymentDate], getdate()) when 1 then case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end else 0.0 end), 0.00) [Balance30days]
		,isnull(sum(case DATEDIFF(month, pd.[PaymentDate], getdate()) when 2 then case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end else 0.0 end), 0.00) [Balance60days]
		,isnull(sum(case DATEDIFF(month, pd.[PaymentDate], getdate()) when 3 then case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end else 0.0 end), 0.00) [Balance90days]
		,isnull(sum(case DATEDIFF(month, pd.[PaymentDate], getdate()) when 4 then case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end else 0.0 end), 0.00) [Balance120days]
		,isnull(sum(case when DATEDIFF(month, pd.[PaymentDate], getdate()) > 4 then case when pd.TransactionType in (1, 2, 6) then pd.Amount else -pd.Amount end else 0.0 end), 0.00) [Balance120plus]
		,iif(isnull(sum(case pd.TransactionType when 7 then 1 else 0 end), 0.00) > 0.00, 1, 0) [InterestCharged]
		,isnull(n.[NoteCount], 0) [Notes]
		,1 [IsActive]
		,0 [IsDeleted]
		,'system' [CreatedBy]
		,getdate() [CreatedDate]
		,'system' [ModifiedBy]
		,getdate() [ModifiedDate]
		from [client].[Client] c
		inner join [policy].[ClientCover] cc on cc.[ClientId] = c.[Id] and cc.[IsActive] = 1
		inner join [policy].[Policy] p on p.[PolicyId] = cc.[PolicyId] and p.[IsActive] = 1
		left join [billing].[Invoice] i on i.[ClientCoverId] = cc.[Id] and i.[IsActive] = 1
		left join [billing].[PaymentHeader] ph on ph.[InvoiceId] = i.[Id] and ph.[IsActive] = 1
		left join [billing].[PaymentHeaderDetail] pd on pd.[PaymentHeaderId] = ph.[Id] and pd.[IsActive] = 1 and pd.[PaymentDate] < @endDate
		left join (
			select [PolicyId], count(*) [NoteCount] from #AgeNotes group by [PolicyId]
		) n on n.[PolicyId] = p.[Id]
		where c.[ClientTypeId] = case @clientTypeId when 0 then c.[ClientTypeId] else @clientTypeId end
		group by 
			c.[Id],
			c.[ReferenceNumber],
			c.[Name],
			c.[Description],
			p.[Id],
			p.[PolicyNumber],
			p.[Status],
			p.[CollectionAgent],
			p.[DebtorClerk],
			n.[NoteCount]	

	if (@includeZeroBalance = 0) begin
		delete from #AgeAnalysis where [Balance] = 0.00
	end

	declare @sql varchar(max)
	if (@balanceTypeId in (1, 2, 3)) begin
		declare @field nvarchar(16)
		if (@ageTypeId = 0) begin 
			set @field = '[Balance]'
		end else if (@ageTypeId = 1) begin
			set @field = '[BalanceCurrent]'
		end else if (@ageTypeId = 2) begin
			set @field = '[Balance30days]'
		end else if (@ageTypeId = 3) begin
			set @field = '[Balance60days]'
		end else if (@ageTypeId = 4) begin
			set @field = '[Balance90days]'
		end else if (@ageTypeId = 5) begin
			set @field = '[Balance120days]'
		end else if (@ageTypeId = 6) begin
			set @field = '[Balance120plus]'
		end	
		set @sql = 'delete from #AgeAnalysis where '
		if (@balanceTypeId = 1) begin
			set @sql = @sql + @field + ' = 0.00'
		end else if (@balanceTypeId = 2) begin
			set @sql = @sql + @field + ' >= 0.00'
		end else if (@balanceTypeId = 3) begin
			set @sql = @sql + @field + ' <= 0.00'
		end
		exec sp_executesql @sql
	end

	if (@includeNotes = 1) begin
		update aa set
			aa.[Note1] = nt1.[Text],
			aa.[User1] = nt1.[CreatedBy],
			aa.[Date1] = nt1.[CreatedDate],
			aa.[Note2] = nt2.[Text],
			aa.[User2] = nt2.[CreatedBy],
			aa.[Date2] = nt2.[CreatedDate],
			aa.[Note3] = nt3.[Text],
			aa.[User3] = nt3.[CreatedBy],
			aa.[Date3] = nt3.[CreatedDate]
		from #AgeAnalysis aa
			left join #AgeNotes nt1 on nt1.[PolicyId] = aa.[PolicyId] and nt1.[Rank] = 1
			left join #AgeNotes nt2 on nt2.[PolicyId] = aa.[PolicyId] and nt2.[Rank] = 2
			left join #AgeNotes nt3 on nt3.[PolicyId] = aa.[PolicyId] and nt3.[Rank] = 3
	end
	select * from #AgeAnalysis order by [Id]
end
