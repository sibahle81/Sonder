

CREATE   PROCEDURE [finance].[RMAAgeAnalysis]
                @startDate datetime,
                @endDate datetime 
as
begin

                declare @transactions table (ProductName varchar(50),
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

                insert into @transactions ([ProductName],[TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance], [RowNumber])
                                select distinct 
                                                prod.[Name] as [ProductName],
                                                bt.[TransactionId],
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
                                                --(dbo.GetTransactionBalance(TransactionId)),
                                                CASE WHEN ttl.IsDebit = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance,
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
                                                                                count(*) [Policies]
                                                                from [policy].[Policy]
                                                                group by [PolicyId],         
                                                                                [PolicyOwnerId],
                                                                                [PolicyNumber],
                                                                                [PolicyStatusId],
                                                                                [ProductOptionId]
                                                                having count(*) = 1
                                                ) tp on tp.[PolicyOwnerId] = rp.[RolePlayerId]
                                                left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
                                                left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
                                where bt.[CreatedDate] between @startDate and @endDate
                                                --and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
                                                --and EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate >= bt.TransactionDate and p.[Status] != 'Future')
                                                --and isnull(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, isnull(ind.[IndustryClassId], 0))
                                                -- Exclude claims transactions
                                                and bt.[TransactionTypeId] not in (14, 15, 16)
                                                and bt.[TransactionTypeId] = 6 --Invoice
                                                                                                                                                                                                and bt.IsDeleted =0
                                                --and (prod.[Id] = @ProductId or @ProductId is null )
                                order by bt.[TransactionDate]
                    

    insert into @transactions ([ProductName],[TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance],  [RowNumber])
        select distinct 
                                                prod.[Name] as [ProductName],
                                                bt.[TransactionId],
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
                                                bt.[TransactionDate],--bt.[CreatedDate],
                                                month(bt.[TransactionDate]) [Period],
                                                (case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
                                                (case when prod.Id not in (1,2) then 
														(case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) 
														else 0 end )[Interest],
                                                bt.CreatedDate,
                                                --(dbo.GetTransactionBalance(TransactionId)),
                                                CASE WHEN ttl.IsDebit = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance,
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
                                                                                count(*) [Policies]
                                                                from [policy].[Policy]
                                                                group by [PolicyId],         
                                                                                [PolicyOwnerId],
                                                                                [PolicyNumber],
                                                                                [PolicyStatusId],
                                                                                [ProductOptionId]
                                                                having count(*) = 1
                                                ) tp on tp.[PolicyOwnerId] = rp.[RolePlayerId]
                                                left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
                                                left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
                                where bt.[CreatedDate] between @startDate and @endDate
                                               -- and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
												and bt.[TransactionId] not in (Select distinct LinkedTransactionId from billing.transactions
																				Where TransactionTypeId =17) 
                                                --and NOT EXISTS (SELECT p.* FROM [common].[Period] p WHERE p.StartDate <= bt.TransactionDate and p.[Status] = 'Future') 
                                                --and isnull(ind.[IndustryClassId], 0) = iif(@industryId > 0, @industryId, isnull(ind.[IndustryClassId], 0))
                                                ---- Exclude claims transactions
                                                and bt.[TransactionTypeId] not in (14, 15, 16)
                                                and bt.[TransactionTypeId] != 6
                                                                                                                                                                                                and bt.IsDeleted =0
                                               -- and (prod.[Id] = @ProductId or @ProductId is null )
                                order by bt.[CreatedDate]


    delete t from @transactions t where t.RowNumber <> 1   ---removing duplicates

               

                declare @analysis table (
                                [ProductName] varchar(50),
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

                update @transactions set [StatusId] = 1 where [StatusId] NOT IN (2, 4, 5,7, 8, 11, 13)



                insert into @analysis ([ProductName],[AccountId], [AccountNumber], [ClientName], [ClientType], [Industry], [Status], [CollectionAgent], [DebtorsClerk], [Balance], [Interest], [Current], [30Days], [60Days], [90Days], [120Days], [120PlusDays], [FilterAmount])
                                select t.[ProductName],
                                t.[AccountId],
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
                                cit.[Name],
                                t.[ProductName]

                

                delete a1 from @analysis a1 where Exists (Select * From @analysis a2 where a2.AccountId = a1.AccountId and a2.[Status] = 'Active') and a1.[Status] = 'Inactive'

                
                                select distinct 
                                                a.[ProductName],
                                                a.[AccountId],
                                                a.[AccountNumber],
                                                a.[ClientName],
                                                a.[ClientType],
                                                a.[Industry],
                                                a.[Status] [PolicyStatus],
                                                a.[Balance],
                                                a.[Interest],
                                                a.[Current],
                                                a.[30Days] [Balance30Days],
                                                a.[60Days] [Balance60Days],
                                                a.[90Days] [Balance90Days],
                                                a.[120Days] [Balance120Days],
                                                a.[120PlusDays] [Balance120PlusDays],
                                                a.[CollectionAgent],
                                                a.[DebtorsClerk],
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