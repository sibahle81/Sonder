CREATE   PROCEDURE [billing].[Top20TermArrangementReport]-- '2023/03/01','2023/03/28',0
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId AS VARCHAR(25) = '0'
	
AS
BEGIN

DECLARE	@ProcEndDate AS DATE = Dateadd(dd,1,@EndDate)

	DECLARE @Last4Date AS DATE
	DECLARE @Last3Date AS DATE
	DECLARE @Last2Date AS DATE
	DECLARE @Last1Date AS DATE
	DECLARE @Last5Date AS DATE
	DECLARE @Last6Date AS DATE
	DECLARE @Last7Date AS DATE
	DECLARE @Last8Date AS DATE
	DECLARE @Last9Date AS DATE
	DECLARE @Last10Date AS DATE
	DECLARE @Last11Date AS DATE
	DECLARE @Last12Date AS DATE
	SET @Last1Date =eomonth(Getdate())
	SET @Last3Date =eomonth(DATEADD(month, -2, Getdate()))
	SET @Last2Date =eomonth(DATEADD(month, -1, Getdate()))
	SET @Last4Date =eomonth(DATEADD(month, -3, Getdate()))
	SET @Last5Date =eomonth(DATEADD(month, -4, Getdate()))
	SET @Last6Date =eomonth(DATEADD(month, -5, Getdate()))
	SET @Last7Date =eomonth(DATEADD(month, -6, Getdate()))
	SET @Last8Date =eomonth(DATEADD(month, -7, Getdate()))
	SET @Last9Date =eomonth(DATEADD(month, -8, Getdate()))
	SET @Last10Date =eomonth(DATEADD(month, -9, Getdate()))
	SET @Last11Date =eomonth(DATEADD(month, -10, Getdate()))
	SET @Last12Date =eomonth(DATEADD(month, -11, Getdate()))


    IF @IndustryId = '0'
            begin select @IndustryId = NULL;
            end
 
 IF OBJECT_ID(N'tempdb..#TempArrangementpaid', N'U') IS NOT NULL
			DROP TABLE #TempArrangementpaid

			select btas.TermArrangementId,
				   sum(Amount - Balance) as AmountPaid


			INTO #TempArrangementpaid 
			FROM [billing].[TermArrangementSchedule] btas (NOLOCK)
			WHERE TermArrangementScheduleStatusId in (Select distinct [Id]
													  from [common].[TermArrangementScheduleStatus]
													  where [Name] in ('PartiallyPaid','Paid'))
			and btas.isdeleted = 0 
			--and TermArrangementId IN (77) 
			group by btas.TermArrangementId

--------------------------Get First Payment--------------------------------------------
 
 IF OBJECT_ID(N'tempdb..#TempFirstpayment', N'U') IS NOT NULL
			DROP TABLE #TempFirstpayment

			select distinct
				   btas.[TermArrangementId],
    			   FIRST_VALUE (btas.[Amount]) OVER (PARTITION BY btas.[TermArrangementId] ORDER BY btas.[PaymentDate] ASC) AS [Amount],
				   FIRST_VALUE (btas.[PaymentDate]) OVER (PARTITION BY btas.[TermArrangementId] ORDER BY btas.[PaymentDate] ASC) AS [1stPaymentDate]



			INTO #TempFirstpayment 
			FROM [billing].[TermArrangementSchedule] btas (NOLOCK)
			where btas.isdeleted = 0 
			--and TermArrangementId IN (116) 
------------------------------------------------------------------


		SELECT DISTINCT --TOP 20 
			 ic.[Name] as [Industry],
			 cfp.[FinPayeNumber] [MemberNumber],
			 R.DisplayName as DebtorName,
			 bta.TotalAmount  as [Balance],
			 bta.TotalAmount - isnull(tmpap.AmountPaid,0) as [OutstandingBalance],
    		 Isnull((Case when (ROW_NUMBER() OVER (PARTITION BY bta.TermArrangementId ORDER BY tfp.[1stPaymentDate] ASC)) =1 then  isnull(sum(tmpap.AmountPaid),0) end),0) as AmountPaid,
			 bta.StartDate as [CommenceDate],
			 Isnull(Case when (cast(btas.[PaymentDate] as date) between dateadd(dd,+1,@Last12Date) and @Last1Date)
			      then Datename(mm,(btas.[PaymentDate])) + ' ' + cast(year(btas.[PaymentDate]) as char(4)) end,'None') [MonthsPaid],
			Isnull((Case when (ROW_NUMBER() OVER (PARTITION BY bta.TermArrangementId ORDER BY tfp.[1stPaymentDate] ASC)) =1 then bta.TotalAmount - isnull(tmpap.AmountPaid,0) end),0) as Total,
			 Case when btas.[AllocationDate] is not null and cast(btas.[PaymentDate] as date) between dateadd(dd,+1,@Last12Date) and @Last1Date then 'Yes' else 'No' end as [PrevMonthsPaid],
			 CASE WHEN btas.[AllocationDate] is not null Then 
					 (CASE WHEN Datename(mm,(btas.[PaymentDate])) ='January' THEN 1
						 WHEN Datename(mm,(btas.[PaymentDate])) ='February' THEN 2
						 WHEN Datename(mm,(btas.[PaymentDate])) ='March' THEN 3
						 WHEN Datename(mm,(btas.[PaymentDate])) ='April' THEN 4
						 WHEN Datename(mm,(btas.[PaymentDate])) ='May' THEN 5
						 WHEN Datename(mm,(btas.[PaymentDate])) ='June' THEN 6
						 WHEN Datename(mm,(btas.[PaymentDate])) ='July' THEN 7
						 WHEN Datename(mm,(btas.[PaymentDate])) ='August' THEN 8
						 WHEN Datename(mm,(btas.[PaymentDate])) ='September' THEN 9
						 WHEN Datename(mm,(btas.[PaymentDate])) ='October' THEN 10
						 WHEN Datename(mm,(btas.[PaymentDate])) ='November' THEN 11
						 WHEN Datename(mm,(btas.[PaymentDate])) ='December' THEN 12 END)
				ELSE 0 END AS [MonthNumber],
			CONVERT(DATETIME, '1 ' + Datename(mm,(btas.[PaymentDate])) + ' ' + cast(year(btas.[PaymentDate]) as char(4)), 106) as [PaymentDate],
			tfp.[1stPaymentDate],			 
			Case when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last2Date) and @Last1Date then 1 
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last3Date) and @Last2Date then 2
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last4Date) and @Last3Date then 3
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last5Date) and @Last4Date then 4 
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last6Date) and @Last5Date then 5
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last7Date) and @Last6Date then 6
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last8Date) and @Last7Date then 7 
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last9Date) and @Last8Date then 8
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last10Date) and @Last9Date then 9
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last11Date) and @Last10Date then 10
				 when tfp.[1stPaymentDate] between dateadd(dd,+1,@Last12Date) and @Last11Date then 11
			else 0 end as [1stPaymentFlag],
			Datename(mm,(tfp.[1stPaymentDate])) as FirstPaymentMonth,
			bta.TermArrangementId
	from [billing].[TermArrangement] bta
	inner join policy.policy pp (NOLOCK) on bta.RolePlayerId = pp.PolicyOwnerId
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join [common].[TermArrangementStatus] ctas on bta.TermArrangementStatusId = ctas.id
	inner join [client].[company] c (NOLOCK) on c.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID 
	left join  common.Industry ind on ind.Id = cfp.IndustryId
    left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
	left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
	left join #TempArrangementpaid tmpap on bta.TermArrangementId = tmpap.TermArrangementId
	left join #TempFirstpayment tfp on  bta.TermArrangementId = tfp.TermArrangementId
    inner join [billing].[TermArrangementSchedule] btas on bta.[TermArrangementId] = btas.[TermArrangementId]
	where prod.[Id] not in (1,2) 
	and bta.IsActive =1 and bta.IsDeleted=0 
	AND ctas.[Name] not in ('Unsuccessful','ApplicationInProgress','Paid')
	AND bta.TotalAmount > 0
    AND (cast(ic.[Id] as char(10)) IN (select value from string_split(@IndustryId,',')) OR @IndustryId IS NULL)


	Group by ic.[Name], cfp.[FinPayeNumber],R.DisplayName,bta.StartDate,Datename(mm,(tfp.[1stPaymentDate])) ,
			 Datename(mm,(btas.[AllocationDate])),bta.TermArrangementId,
			 Case when btas.[AllocationDate] between @Last1Date and @Last3Date then 'Yes' else 'No' end,
			 cast(btas.[AllocationDate] as date),bta.TotalAmount,isnull(tmpap.AmountPaid,0),tfp.[1stPaymentDate],btas.[PaymentDate],btas.[AllocationDate]
 
	order by bta.TotalAmount - isnull(tmpap.AmountPaid,0) desc


END
