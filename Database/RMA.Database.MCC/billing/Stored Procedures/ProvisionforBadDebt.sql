


CREATE   PROCEDURE [billing].[ProvisionforBadDebt]

as
begin

                declare @ageTypeId int = 0                  -- 0=all 1=current 2=30 days 3=60 days 4=90 days 5=120 days 6=120+ days
                declare @industryId int = 0                 -- 0=all, rest read from common.IndustryClass
                declare @endDate datetime = GETDATE()
                declare @includeInterest bit = 1


                set nocount on

                declare @transactions table ([TransactionId] int,
                                [AccountId] int,
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
								[DebtorStatus] varchar(50),
								[CancelationReason] varchar(100), 
								[IndustryProduct] varchar(10),
                                [RowNumber] int,
                                index tidx_clientTypeId ([ClientTypeId]),
                                index tidx_statusId ([StatusId]),
                                index tidx_industryClassId ([IndustryClassId])
                )

                insert into @transactions ([TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId],[IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance],[DebtorStatus],[CancelationReason], [IndustryProduct], [RowNumber])
                                select distinct 
                                                bt.[TransactionId],
                                    rp.[RolePlayerId] [AccountId],
                                                fp.[FinPayeNumber] [AccountNumber],
                                                rp.[DisplayName] [ClientName],
                                                case isnull(c.[RolePlayerId], 0) when 0 then 1 else (case right(isnull(c.[ReferenceNumber], '99'), 2) when '99' then 2 else 3 end) end [ClientTypeId],
                                                isnull(ind.[IndustryClassId], 0) [IndustryClassId],
                                                isnull(tp.[PolicyStatusId], 0) [StatusId],
                                                year(bt.[TransactionDate]) [Year],
                                                month(bt.[TransactionDate]) [Month],
                                                bt.[TransactionDate],
                                                month(bt.[TransactionDate]) [Period],
                                                (case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
                                                (case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) [Interest],
                                                bt.CreatedDate,
                                                --(dbo.GetTransactionBalance(TransactionId)),
                                                CASE WHEN ttl.IsDebit = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance,
												cds.[Name] as DebtorStatus,
												tp.[Name] as CancelationReason, 
												case when prod.UnderwriterId = 1 then 'Coid' else 'Non-Coid' end as IndustryProduct,
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
                                                                                [ProductOptionId],
																				[cpcr].[Name],
                                                                                count(*) [Policies]
                                                                from [policy].[Policy]
																left join [common].[PolicyCancelReason] cpcr on PolicyCancelReasonId = cpcr.Id                                                                
                                                                group by [PolicyId],         
                                                                                [PolicyOwnerId],
                                                                                [PolicyNumber],
                                                                                [PolicyStatusId],
                                                                                [ProductOptionId],
																				[cpcr].[Name]
                                                                having count(*) = 1
                                                ) tp on tp.[PolicyOwnerId] = rp.[RolePlayerId]
                                                left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
                                                left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
												left join common.debtorstatus cds on fp.DebtorStatusId = cds.Id
                                where bt.[CreatedDate] <= @endDate
                                                and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
                                                --and EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= bt.TransactionDate and p.[Status] != 'Future')
                                                and isnull(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, isnull(ind.[IndustryClassId], 0))
                                                -- Exclude claims transactions
                                                and bt.[TransactionTypeId] not in (14, 15, 16)
                                                and bt.[TransactionTypeId] = 6 --Invoice
												and prod.[Id] not in (1,2)                                                                                                                                                                                               
												and bt.IsDeleted =0
                                order by bt.[TransactionDate]
                    

    insert into @transactions ([TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId],[IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance],[DebtorStatus],[CancelationReason],[IndustryProduct], [RowNumber])
        select distinct 
                                bt.[TransactionId],
                                rp.[RolePlayerId] [AccountId],
                                fp.[FinPayeNumber] [AccountNumber],
                                rp.[DisplayName] [ClientName],
                                case isnull(c.[RolePlayerId], 0) when 0 then 1 else (case right(isnull(c.[ReferenceNumber], '99'), 2) when '99' then 2 else 3 end) end [ClientTypeId],
                                isnull(ind.[IndustryClassId], 0) [IndustryClassId],
                                isnull(tp.[PolicyStatusId], 0) [StatusId],
                                year(bt.[TransactionDate]) [Year],
                                month(bt.[TransactionDate]) [Month],
                                bt.[TransactionDate],--bt.[CreatedDate],
                                month(bt.[TransactionDate]) [Period],
                                (case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
                                (case when prod.Id not in (1,2) then 
										(case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) 
										else 0 end )[Interest],
                                bt.CreatedDate,
                                --(dbo.GetTransactionBalance(TransactionId)),
                                CASE WHEN ttl.IsDebit = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance,
								cds.[Name] as DebtorStatus,tp.[Name] as CancelationReason,
								case when prod.UnderwriterId = 1 then 'Coid' else 'Non-Coid' end as IndustryProduct,
                                ROW_NUMBER() OVER (PARTITION BY bt.TransactionId ORDER BY bt.TransactionId)
                                from [client].[RolePlayer] rp
                                                inner join [client].[FinPayee] fp on fp.[RolePlayerId] = rp.[RolePlayerId]
                                                inner join [billing].[Transactions] bt on bt.[RolePlayerId] = rp.[RolePlayerId]
                                                inner join [billing].[TransactionTypeLink] ttl on ttl.[Id] = bt.[TransactionTypeLinkId]
                                                left join [client].[Company] c on c.[RolePlayerId] = rp.[RolePlayerId]
                                                left join [common].[Industry] ind on ind.[Id] = fp.[IndustryId]
                                                left join (
                                                                select [PolicyId],
                                                                                [PolicyOwnerId],
                                                                                [PolicyNumber],
                                                                                [PolicyStatusId],
                                                                                [ProductOptionId],
																				[cpcr].[Name],
                                                                                count(*) [Policies]
                                                                from [policy].[Policy]
																left join [common].[PolicyCancelReason] cpcr on PolicyCancelReasonId = cpcr.Id
                                                                group by [PolicyId],         
                                                                                [PolicyOwnerId],
                                                                                [PolicyNumber],
                                                                                [PolicyStatusId],
                                                                                [ProductOptionId],
																				[cpcr].[Name]
                                                                having count(*) = 1
                                                ) tp on tp.[PolicyOwnerId] = rp.[RolePlayerId]
                                                left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
                                                left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
												left join common.debtorstatus cds on fp.DebtorStatusId = cds.Id
                                where bt.[CreatedDate] <= @endDate
                                                and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
												and bt.[TransactionId] not in (Select distinct LinkedTransactionId from billing.transactions
																				Where TransactionTypeId =17) 
                                                --and NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
                                                and isnull(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, isnull(ind.[IndustryClassId], 0))
                                                ---- Exclude claims transactions
                                                and bt.[TransactionTypeId] not in (14, 15, 16)
                                                and bt.[TransactionTypeId] != 6
												and prod.[Id] not in (1,2)  
                                                and bt.IsDeleted =0
                                order by bt.[CreatedDate]


    delete t from @transactions t where t.RowNumber <> 1

                declare @analysis table (
                                [AccountId] int,
                                [AccountNumber] varchar(32),
                                [ClientName] varchar(128),
                                [ClientType] varchar(64),
                                [Industry] varchar(64),
                                [Status] varchar(16),
                                [Balance] float,
                                [Interest] float,
                                [Current] float,
                                [30Days] float,
                                [60Days] float,
                                [90Days] float,
                                [120Days] float,
                                [120PlusDays] float,
								[DebtorStatus] varchar(50),
								[CancelationReason] varchar(100), 
								[IndustryProduct] varchar(10),
                                [FilterAmount] float,
                                index tidx_filterAmount ([FilterAmount])
                )

                update @transactions set [StatusId] = 1 where [StatusId] NOT IN (2, 4, 5,7, 8, 11, 13)

                insert into @analysis ([AccountId], [AccountNumber], [ClientName], [ClientType], [Industry], [Status], [Balance], [Interest], [Current], [30Days], [60Days], [90Days], [120Days], [120PlusDays],[DebtorStatus],[CancelationReason],[IndustryProduct],[FilterAmount])
                                select t.[AccountId],
                                t.[AccountNumber],
                                t.[ClientName],
                                case t.[ClientTypeId] when 1 then 'Individual' when 2 then 'Group' when 3 then 'Corporate' else 'Unknown' end [ClientType],
                                cit.[Name] [Industry],
                                case t.[StatusId] when 1 then 'Active' else 'Inactive' end [Status],
                                sum([Balance]) [Balance],
                                sum([Interest]) [Interest],
                                sum(case when DATEDIFF(day, [TransactionDate], getdate()) < 30  then [Balance] else 0.00 end) [Current],
                               sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 30 and DATEDIFF(day, [TransactionDate], getdate()) < 60 then [Balance] else 0.00 end) [30Days],
                                sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 60 and DATEDIFF(day, [TransactionDate], getdate()) < 90 then [Balance] else 0.00 end) [60Days],
                                sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 90 and DATEDIFF(day, [TransactionDate], getdate()) < 120 then [Balance] else 0.00 end) [90Days],
                                sum(case when DATEDIFF(day, [TransactionDate], getdate()) >= 120 and DATEDIFF(day, [TransactionDate], getdate()) < 150 then [Balance] else 0.00 end) [120Days],
                                sum(case when (DATEDIFF(day, [TransactionDate], getdate()) >= 150) then [Balance] else 0.00 end) [120PlusDays],
                                t.DebtorStatus,
								t.[CancelationReason],
								[IndustryProduct],
								0.00 [FilterAmount]
                from @transactions t
                    left join [common].[IndustryClass] cit on cit.[Id] = t.IndustryClassId
					where t.[ClientTypeId] <> 1
                group by t.[AccountId],
                                t.[AccountNumber],
                                t.[StatusId],
                                t.[ClientName],
                                t.[ClientTypeId],
                                cit.[Name],
								t.[DebtorStatus],t.[CancelationReason],
								t.[IndustryProduct]
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


                delete a1 from @analysis a1 where Exists (Select * From @analysis a2 where a2.AccountId = a1.AccountId and a2.[Status] = 'Active') and a1.[Status] = 'Inactive'

		  IF OBJECT_ID(N'TEMPDB..#status1', N'U') IS NOT NULL
				DROP TABLE #status1;

                select distinct 
                                a.[AccountId],
                                a.[AccountNumber],
                                a.[ClientName],
                                a.[ClientType],
                                a.[Industry],
                                a.[Status] [PolicyStatus],
								a.[CancelationReason],
                                a.[Balance],
                                a.[Interest],
                                a.[Current],
                                a.[30Days] [Balance30Days],
                                a.[60Days] [Balance60Days],
                                a.[90Days] [Balance90Days],
                                a.[120Days] [Balance120Days],
                                a.[120PlusDays] [Balance120PlusDays],
								(a.[30Days] + a.[60Days] + a.[90Days] + a.[120Days]) as [Balance30To120],
								case when a.[DebtorStatus] is null then 
										(case when a.[Balance] < 0 then 'Premium Creditor'
											  when (a.[120PlusDays] < 0) then 'Trade Debtors' 
										end)
								else a.[DebtorStatus]  end as [DebtorStatus],
								Datename(mm,(@endDate)) [ReportingMonth],
								[IndustryProduct]
				into #status1
                from @analysis a
                --order by [AccountNumber]

------copied sheet----

        IF OBJECT_ID(N'TEMPDB..#status2', N'U') IS NOT NULL
           DROP TABLE #status2;

            select [AccountId],
                [AccountNumber],
                [ClientName],
                [ClientType],
                [Industry],
                [PolicyStatus],
				[CancelationReason],
                [Balance],
                [Interest],
                [Current],
                [Balance30Days],
                [Balance60Days],
                [Balance90Days],
                [Balance120Days],
                [Balance120PlusDays],
				[DebtorStatus],
				[IndustryProduct]

            into #status2		
			from  #status1

			delete from #status1
			where [Balance120PlusDays] > 0 and [Balance30To120] < 0 and [DebtorStatus] is null

		    update #status1 
			set  [DebtorStatus] = 'Trade Debtors',[Balance120PlusDays] = 0
			where [Balance120PlusDays] > 0 and [DebtorStatus] is null

			update #status1 
			set  [DebtorStatus] = 'Other risk accounts (120 days trade debtors)',[Balance30Days] = 0, 
			[Balance60Days]  = 0, [Balance90Days] = 0,  [Balance120Days]  = 0
			where [Balance120PlusDays] > 0 and [Balance30To120] > 0 and [DebtorStatus] is null

			update #status1 
			set  [Balance] = ([Balance30Days] +[Balance60Days]  + [Balance90Days]+ [Balance120Days] + [Balance120PlusDays] + [Current])
			where [DebtorStatus] = 'Other risk accounts (120 days trade debtors)'

			update #status1 
			set [DebtorStatus] = 'Trade Debtors'
			where [Balance120PlusDays] = 0 and [DebtorStatus] is null and [Balance120Days] > 0

			delete from #status1
			where [DebtorStatus] is null

			select  * from #status1
			--select * from  #status2

end