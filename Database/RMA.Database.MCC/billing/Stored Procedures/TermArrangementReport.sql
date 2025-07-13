CREATE   PROCEDURE [billing].[TermArrangementReport] --'2023/03/01','2024/04/28',0,-1
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId AS VARCHAR(25) = '0',
	@ProductId AS VARCHAR(25) = '-1'
	
AS
BEGIN

DECLARE @CurrentDate DATE = GETDATE()
DECLARE	@ProcEndDate AS DATE = Dateadd(dd,1,@EndDate)

    IF @IndustryId = '0'
            begin select @IndustryId = NULL;
            end

    IF @ProductId = '-1'
            begin select @ProductId = NULL;
            end

 
------Payment Date----

        IF OBJECT_ID(N'TEMPDB..#TEMPPaymentDate', N'U') IS NOT NULL
           DROP TABLE #tempPaymentDate;

            select distinct
                first_value([TermArrangementId]) over (partition by [TermArrangementId] order by [PaymentDate] asc) as [TermArrangementId],
                first_value([PaymentDate]) over (partition by [TermArrangementId] order by [PaymentDate] asc) as [PaymentDate],
                first_value([Amount]) over (partition by [TermArrangementId] order by [PaymentDate] asc) as [NextInstallment]

            into #tempPaymentDate
            from [billing].[TermArrangementSchedule] (nolock)
			where [PaymentDate] >= @CurrentDate
			and [isdeleted] =0


------Amount Paid----

        IF OBJECT_ID(N'TEMPDB..#TempAmountPaid', N'U') IS NOT NULL
           DROP TABLE #tempAmountPaid;

            select distinct
                [TermArrangementId] as [TermArrangementId],
				sum(balance) as Balance

            into #tempAmountPaid
            from [billing].[TermArrangementSchedule] (nolock)
			where [isdeleted] =0
			group by [TermArrangementId]
		 

 IF OBJECT_ID(N'tempdb..#TempTermCounts', N'U') IS NOT NULL
		DROP TABLE #TempTermCounts;

		SELECT DISTINCT
			 count([RolePlayerId]) as TermCounts,
			 sum(TotalAmount) as TotalAmount,
			 RolePlayerId

	    INTO #TempTermCounts 
		FROM [billing].[TermArrangement] (NOLOCK)
		WHERE TermArrangementStatusId not in (1,6)
		AND [StartDate] between @StartDate and @EndDate
		GROUP BY RolePlayerId

		SELECT DISTINCT
			 bta.[StartDate] [Date],
			 ic.[Name] as [Industry],
			 A.[AccountNumber] as [AccountNumber],
			 cfp.[FinPayeNumber] [MemberNumber],
			 bta.TotalAmount as [Balance],
			 Datename(mm,(bta.[StartDate])) [StartingMonth],
			 DATEDIFF(Month,bta.[StartDate],bta.[EndDate]) as [ArrangementMonths],
			 cpf.[Name] PaymentFrequency,
			 cast(bta.[CreatedDate] as date) [CreatedDate], 
			 tdr.[Name] as [Reason],
			 ctas.[Name] as [ApplicationStatus],
			 case when ctas.[Name] in ('ApplicationInProgress','Unsuccessful') then 'No' else 'Yes' end as TermActive, 
			 isnull(TermCounts,0) as TermCounts,
			 isnull(ttc.TotalAmount,0) as TotalAmount,
			 Case when bta.IsActive =1 then 'Yes' else 'No' end as [IsActive],
			 Year(bta.CreatedDate)  as [FinancialYear],
			 cpm.[Name] as [PaymentMethod],
			 tpd.PaymentDate as [NextPaymentDate],
			 tpa.Balance [OutstandingBalance],
			 Case when sum(bta.TotalAmount - tpa.Balance) < 0.06 then 0 else bta.TotalAmount - tpa.Balance end as [InstalmentsReceived],
			 isnull(tpd.[NextInstallment],0) as [NextInstallments],bta.[TotalAmount] [TermsTotalAmount],
			 sum(case when DATEDIFF(day, bta.[CreatedDate], @CurrentDate) < 30  then bta.[TotalAmount] else 0.00 end) [Current],
             sum(case when DATEDIFF(day, bta.[CreatedDate], @CurrentDate) >= 30 and DATEDIFF(day, bta.[CreatedDate], @CurrentDate) < 60 then bta.[TotalAmount] else 0.00 end) [30Days],
             sum(case when DATEDIFF(day, bta.[CreatedDate], @CurrentDate) >= 60 and DATEDIFF(day, bta.[CreatedDate], @CurrentDate) < 90 then bta.[TotalAmount] else 0.00 end) [60Days],
             sum(case when DATEDIFF(day, bta.[CreatedDate], @CurrentDate) >= 90 and DATEDIFF(day, bta.[CreatedDate], @CurrentDate) < 120 then bta.[TotalAmount] else 0.00 end) [90Days],
             sum(case when DATEDIFF(day, bta.[CreatedDate], @CurrentDate) >= 120 and DATEDIFF(day, bta.[CreatedDate], @CurrentDate) < 150 then bta.[TotalAmount] else 0.00 end) [120Days],
             sum(case when (DATEDIFF(day, bta.[CreatedDate], @CurrentDate) >= 150) then bta.[TotalAmount] else 0.00 end) [120PlusDays]


	from [billing].[TermArrangement] bta
	inner join policy.policy pp (NOLOCK) on  bta.RolePlayerId = pp.PolicyOwnerId
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID
	inner join [common].[TermArrangementStatus] ctas on bta.TermArrangementStatusId = ctas.id
	inner join [client].[company] c (NOLOCK) on c.[RolePlayerId] = pp.[PolicyOwnerId]
	left join #tempPaymentDate tpd on bta.TermArrangementId = tpd.TermArrangementId
	left join #tempAmountPaid tpa on bta.TermArrangementId = tpa.TermArrangementId
    left join [common].[PaymentMethod]  cpm ON bta.PaymentMethodId= cpm.Id
	left join  [billing].[TermDebitOrderRolePlayerBankingDetail] tdo on bta.TermArrangementId = tdo.TermArrangementId
 	left join [client].[RolePlayerBankingDetails] A on A.RolePlayerBankingId =tdo.RolePlayerBankingId
	left join  common.Industry ind on ind.Id = cfp.IndustryId
    left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
	left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
	left join [common].[PaymentFrequency]  cpf ON bta.TermArrangementPaymentFrequencyId = cpf.Id
	left join [common].[TermApplicationDeclineReason]  tdr ON bta.TermApplicationDeclineReasonId = tdr.Id
	left join #TempTermCounts ttc on bta.RolePlayerId = ttc.RolePlayerId
	left join [billing].[IndustryFinancialYear] bify on bta.FinancialYearid =bify.IndustryFinancialYearid

	where bta.[StartDate] between @StartDate and @ProcEndDate
	AND (cast(prod.Id as char(10)) IN (select value from string_split(@ProductId,',')) OR @ProductId IS NULL)
    AND (cast(ic.[Id] as char(10)) IN (select value from string_split(@IndustryId,',')) OR @IndustryId IS NULL)
	and prod.[Id] not in (1,2,3)
	and bta.isactive=1 and bta.isdeleted =0
	and ctas.[Name] not in ('Paid')
	and bta.TotalAmount >= 0

	group by bta.[StartDate],ic.[Name],A.[AccountNumber] ,cfp.[FinPayeNumber],
			 bta.TotalAmount,Datename(mm,(bta.[StartDate])),bta.IsActive,
			 DATEDIFF(Month,bta.[StartDate],bta.[EndDate]),cpf.[Name],cast(bta.[CreatedDate] as date),
			 tdr.[Name] ,ctas.[Name] ,isnull(TermCounts,0) ,isnull(ttc.TotalAmount,0) ,
			 ic.[Id] ,bify.StartYear,bify.EndYear, Year(bta.CreatedDate),
			 cpm.[Name],tpd.PaymentDate,tpa.Balance,isnull(tpd.[NextInstallment],0) 
END
