CREATE   PROCEDURE [billing].[GetAgeAnalysis] 
                @clientTypeId int,
                @ageTypeId int,
                @debtorStatus int,
                @assignedStatus int,
                @balanceTypeId int,
                @industryId int,
                @endDate datetime,
                @includeInterest bit,
                @includeNotes bit,
                @counter int,
                @ProductId int
as
begin
   --set statistics io,time on
                --declare @clientTypeId int = 0               -- 0=all 1=individual 2=group 3=corporate
                --declare @ageTypeId int = 0                  -- 0=all 1=current 2=30 days 3=60 days 4=90 days 5=120 days 6=120+ days
                --declare @debtorStatus int = 0               -- 0=all 1=active 2=inactive
                --declare @assignedStatus int = 0             -- 0=all 1=assigned to debtors clerk 2=unassigned to clerk
                --declare @balanceTypeId int = 0              -- 0=all 1=all non-zero 2=greater than zero 3=less than zero
                --declare @industryId int = 1                -- 0=all, rest read from common.IndustryClass
                --declare @endDate datetime = GETDATE()
                --declare @includeInterest bit = 1
                --declare @includeNotes bit = 0
                --declare @counter int = 1
                --declare @ProductId int =0

                set nocount on

                if @ageTypeId > 0 begin
                                if @balanceTypeId = 0 begin
                                                set @balanceTypeId = 1
                                end
                end

                IF @ProductId = 0
                BEGIN
                   SELECT @ProductId = NULL;
                END

                IF OBJECT_ID(N'tempdb..#TempBillingTransactions', N'U') IS NOT NULL
                DROP TABLE #TempBillingTransactions;

                create table #TempBillingTransactions(  
                                        [TransactionId] [int] NOT NULL,
                                        [InvoiceId] [int] NULL,
                                        [RolePlayerId] [int] NOT NULL,
                                        [BankStatementEntryId] [int] NULL,
                                        [TransactionTypeLinkId] [int] NOT NULL,
                                        [Amount] [decimal](18, 2) NOT NULL,
                                        [TransactionDate] [datetime] NOT NULL,
                                        [BankReference] [varchar](50) NULL,
                                        [TransactionTypeId] [int] NOT NULL,
                                        [Reason] [varchar](255) NULL,
                                        [RmaReference] [varchar](100) NULL,
                                        [LinkedTransactionId] [int] NULL,
                                        [AdhocPaymentInstructionId] [int] NULL,
                                        [IsReAllocation] [bit] NULL,
                                        [Balance] [decimal](18, 2) NULL,
                                        [DeletedReasonId] [int] NULL,
                                        [IsDeleted] [bit] NOT NULL,
                                        [CreatedDate] [datetime] NOT NULL,
                                        [CreatedBy] [varchar](50) NOT NULL,
                                        [ModifiedBy] [varchar](50) NOT NULL,
                                        [ModifiedDate] [datetime] NOT NULL,
                                        [TransactionEffectiveDate] [datetime] NULL,
                                        [PeriodId] [int] NULL
            )

            --CREATE NONCLUSTERED INDEX IX_Transactions ON #TempBillingTransactions (TransactionId)
            --WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, 
            --DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY];


            CREATE NONCLUSTERED INDEX IX_Transactions ON #TempBillingTransactions ([RolePlayerId],[TransactionTypeId],[IsDeleted],[CreatedDate])
            INCLUDE ([TransactionId],[InvoiceId],[TransactionTypeLinkId],[Amount],[TransactionDate],[RmaReference])

                insert #TempBillingTransactions
                                SELECT [TransactionId] ,
                                        [InvoiceId],
                                        [RolePlayerId] ,
                                        [BankStatementEntryId],
                                        [TransactionTypeLinkId] ,
                                        [Amount] ,
                                        [TransactionDate],
                                        [BankReference] ,
                                        [TransactionTypeId] ,
                                        [Reason] ,
                                        [RmaReference] ,
                                        [LinkedTransactionId],
                                        [AdhocPaymentInstructionId],
                                        [IsReAllocation] ,
                                        [Balance],
                                        [DeletedReasonId],
                                        [IsDeleted] ,
                                        [CreatedDate],
                                        [CreatedBy] ,
                                        [ModifiedBy] ,
                                        [ModifiedDate] ,
                                        [TransactionEffectiveDate] ,
                                        [PeriodId]
                FROM billing.Transactions
                where IsDeleted =0               

                declare @transactions table (
                                [ControlNumber] varchar(250),
                                [ControlName] varchar(250),
                                [ProductName] varchar(50),
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
                                [TransactionTypeId] int,
                                                                                                                                [ProductId] int,
                                [RowNumber] int,
                                index tidx_clientTypeId ([ClientTypeId]),
                                index tidx_statusId ([StatusId]),
                                index tidx_industryClassId ([IndustryClassId]),
                                index tidx_collectionAgent ([CollectionAgent]),
                                index tidx_TransactionTypeId (TransactionTypeId),
                                --Primary Key Clustered (transactionId),
                                                                                                                                index tidx_ProductId ([ProductId])
                )



                insert into @transactions ([ControlNumber] ,[ControlName],[ProductName],[TransactionId], [AccountId], [AccountNumber], [ClientName], [ClientTypeId], [CollectionAgent], [DebtorsClerk], [IndustryClassId], [StatusId], [Year], [Month], [TransactionDate], [Period], [Amount], [Interest], [CreatedDate], [Balance],[TransactionTypeId],[ProductId],[RowNumber])
                select distinct 
                        AC.Level3 ControlNumber,
                        AC.ChartIsName ControlName,
                        prod.[Name] as [ProductName],
                        bt.[TransactionId],
                        fp.[RolePlayerId] [AccountId],
                        fp.[FinPayeNumber] [AccountNumber],
                        --rp.[DisplayName] [ClientName],
                        isnull(c.[Name],'') [ClientName],
                        case isnull(c.[RolePlayerId], 0) when 0 then 1 else (case right(isnull(c.[ReferenceNumber], '99'), 2) when '99' then 2 else 3 end) end [ClientTypeId],
                        isnull(aaa.[CollectionAgent], '') [CollectionAgent],
                        isnull(aaa.[DebtorsClerk], '') [DebtorsClerk],
                        isnull(ind.[IndustryClassId], 0) [IndustryClassId],
                        isnull(tp.[PolicyStatusId], 0) [StatusId],
                        year(bt.[CreatedDate]) [Year],
                        month(bt.[CreatedDate]) [Month],
                        bt.[CreatedDate],
                        month(bt.[TransactionDate]) [Period],
                        (case bt.[TransactionTypeId] when 7 then 0.00 else case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end end) [Amount],
                        (case bt.[TransactionTypeId] when 7 then case ttl.[IsDebit] when 1 then abs(bt.[Amount]) else -abs(bt.[Amount]) end else 0.00 end) [Interest],
                        bt.CreatedDate,
                        --(dbo.GetTransactionBalance(TransactionId)),
                        CASE WHEN ttl.IsDebit = 1 THEN bt.Amount ELSE - bt.Amount END AS Balance,bt.[TransactionTypeId],
                                                                                                prod.Id [ProductId],
                        ROW_NUMBER() OVER (PARTITION BY bt.TransactionId ORDER BY bt.TransactionId)

            from #TempBillingTransactions bt--[client].[RolePlayer] rp
                inner join [client].[FinPayee] fp on fp.[RolePlayerId] = bt.[RolePlayerId]
                --inner join #TempBillingTransactions bt on bt.[RolePlayerId] = rp.[RolePlayerId]
                inner join [billing].[TransactionTypeLink] ttl on ttl.[Id] = bt.[TransactionTypeLinkId]
                left join [billing].[AgeAnalysisAgent] aaa on aaa.[RolePlayerId] = fp.[RolePlayerId]
                left join [client].[Company] c on c.[RolePlayerId] = fp.[RolePlayerId]
                left join [common].[Industry] ind on ind.[Id] = fp.[IndustryId]
                left join [common].[IndustryClass] ICD ON ICD.Id =ind.IndustryClassId
                left join [billing].[Invoice] I ON bt.InvoiceId = I.InvoiceId   
                left join [billing].[Invoice] bi ON bt.RmaReference = bi.InvoiceNumber AND bt.InvoiceId IS NULL
                left join [policy].[Policy] (NOLOCK) tp ON isnull(I.[Policyid],bi.PolicyId) = tp.[Policyid] and tp.[PolicyOwnerId] = fp.[RolePlayerId]
                left join [product].ProductOption ppo (NOLOCK) on tp.ProductOptionId = ppo.Id
                left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
                left join (select [TransactionId],[Reference],count(*) [Transactions]
							from [billing].[AbilityTransactionsAudit]
							where IsDeleted =0
							group by [TransactionId],[Reference]
							having count(*) = 1
					      ) AT on AT.TransactionId = bt.TransactionId
				left join [billing].[AbilityCollections] AC ON AC.Reference = AT.Reference
            where  bt.[CreatedDate] <= @endDate
                and bt.[TransactionTypeId] != case @includeInterest when 1 then 99999 else 7 end
                 --Exclude claims transactions
                AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
                            WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
                            AND ind.[Id] = ISNULL(fp.IndustryId, ind.[Id]))
                and bt.[TransactionTypeId] not in (14, 15, 16)
                and bt.IsDeleted =0
                and (prod.[Id] = @ProductId or @ProductId is null )
            order by bt.[CreatedDate]
                 

     delete t from @transactions t where t.RowNumber <> 1
                --delete t from @transactions t where t.Amount = 0

                if (@clientTypeId > 0) begin
                                delete from @transactions where [ClientTypeId] != @clientTypeId
                end

                if @assignedStatus = 1 begin
                                delete from @transactions where [CollectionAgent] = ''
                end else if @assignedStatus = 2 begin
                                delete from @transactions where [CollectionAgent] != ''
                end

                declare @analysis table (
                                [ControlNumber] varchar(250),
                                [ControlName] varchar(250),
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

                if (@debtorStatus = 1) begin
                                delete from @transactions where [StatusId] != 1
                end else if (@debtorStatus = 2) begin
                                delete from @transactions where [StatusId] = 1
                end

                insert into @analysis ([ControlNumber],[ControlName],[ProductName],[AccountId], [AccountNumber], [ClientName], [ClientType], [Industry], [Status], [CollectionAgent], [DebtorsClerk], [Balance], [Interest], [Current], [30Days], [60Days], [90Days], [120Days], [120PlusDays], [FilterAmount])
                                select t.[ControlNumber],t.[ControlName],
                                                                                                                                t.[ProductName],
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
                group by t.[ControlNumber],t.[ControlName],t.[AccountId],
                                t.[AccountNumber],
                                t.[StatusId],
                                t.[CollectionAgent],
                                t.[DebtorsClerk],
                                t.[ClientName],
                                t.[ClientTypeId],
                                cit.[Name],
                                t.[ProductName]
                                                                

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

                if @balanceTypeId = 1 begin                -- All non-zero
                                delete from @analysis where round([FilterAmount], 2) = 0.00
                end else if @balanceTypeId = 2 begin -- Greater than zero
                                delete from @analysis where round([FilterAmount], 2) <= 0.00
                end else if @balanceTypeId = 3 begin -- Less than zero
                               delete from @analysis where round([FilterAmount], 2) >= 0.00
                end

                ----delete a1 from @analysis a1 where Exists (Select * From @analysis a2 where a2.AccountId = a1.AccountId and a2.[Status] = 'Active') and a1.[Status] = 'Inactive'

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

                    select distinct a.[ControlNumber],
                                                                                                                                                                                    a.[ControlName],
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
                                    left join @notes n1 on a.[AccountId] = n1.[RolePlayerId] and n1.[NoteRank] = 1
                                    left join @notes n2 on a.[AccountId] = n2.[RolePlayerId] and n2.[NoteRank] = 2
                                    left join @notes n3 on a.[AccountId] = n3.[RolePlayerId] and n3.[NoteRank] = 3
                    order by [AccountNumber]
    end else begin
                    select distinct 
                                                                                                                                                                                    a.[ControlNumber],
                                                                                                                                                                                    a.[ControlName],
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
end