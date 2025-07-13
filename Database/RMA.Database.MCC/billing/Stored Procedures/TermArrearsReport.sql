USE [AZU-MCC]
GO
CREATE   PROCEDURE [billing].[TermArrearsReport] 
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId AS VARCHAR(25) = '0',
	@ProductId AS VARCHAR(25) = '-1'
	
AS

BEGIN
	DECLARE @CurrentDate DATE = GETDATE()
	DECLARE @Date AS DATE
	SET @Date =DATEADD(day, +7, @StartDate)

    IF @IndustryId = '0'
            begin select @IndustryId = NULL;
            end

    IF @ProductId = '-1'
            begin select @ProductId = NULL;
            end

------Number of Missedpayments----

        IF OBJECT_ID(N'TEMPDB..#TEMPMissedpayments', N'U') IS NOT NULL
           DROP TABLE #tempMissedpayments;

            select [TermArrangementId],
     --            sum(case when  DATEADD(day,7, [PaymentDate]) between @StartDate and  @EndDate 
				 --and TermArrangementScheduleStatusId not in (3,1)
				 --then 1 else 0 end) as [numberofpaymentsmissed],
				 sum(case when  (DATEADD(day,7, [PaymentDate]) < @StartDate or DATEADD(day,7, [PaymentDate]) between  @StartDate and  @EndDate) and TermArrangementScheduleStatusId not in (3,1)
				 then 1 else 0 end) as [numberofpaymentsmissed] ,
				 sum(Balance) Balance


            into #tempMissedpayments
            from [billing].[TermArrangementSchedule] (nolock)
			where IsDeleted =0
			and TermArrangementScheduleStatusId in (4,2)
			group by [TermArrangementId]

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

----------------------------------------------------------------
			 
		SELECT DISTINCT 
			ic.[Name] as [Industry],
			--prod.[Name] as [Product],
			ISNULL(cpn.[FirstName] +' ' + cpn.Surname,r.DisplayName) AS [MemberName],
			tdo.[BankAccountNumber] as [AccountNumber],
			btas.Amount AS [Amount],
			Datename(mm,(bta.[StartDate])) [StartingMonth],
			tmp.Balance	as [DefaultAmount],		 
			cfp.[FinPayeNumber] [MemberNumber],	
			Isnull(tmp.[numberofpaymentsmissed],0) [NumberofPaymentsMissed],
			--btas.TermArrangementScheduleStatusId,
			ctass.[Name] AS [Status],
			cpf.[Name] PaymentFrequency,
			bta.TermMonths,
			Case when sum(bta.TotalAmount - tpa.Balance) < 0.06 then 0 else bta.TotalAmount - tpa.Balance end as [CollectedInstallemnt],
			cpm.[Name] as [PaymentMethod],
			sum(case when DATEDIFF(day, btas.[PaymentDate], @CurrentDate) < 30  then btas.[Balance]/tmp.[numberofpaymentsmissed] else 0.00 end) [Current],
            sum(case when DATEDIFF(day, btas.[PaymentDate], @CurrentDate) >= 30 and DATEDIFF(day, btas.[PaymentDate], @CurrentDate) < 60 then btas.[Balance]/tmp.[numberofpaymentsmissed] else 0.00 end) [30Days],
            sum(case when DATEDIFF(day, [PaymentDate], @CurrentDate) >= 60 and DATEDIFF(day, [PaymentDate], @CurrentDate) < 90 then btas.[Balance]/tmp.[numberofpaymentsmissed] else 0.00 end) [60Days],
            sum(case when DATEDIFF(day, [PaymentDate], @CurrentDate) >= 90 and DATEDIFF(day, [PaymentDate], @CurrentDate) < 120 then btas.[Balance]/tmp.[numberofpaymentsmissed] else 0.00 end) [90Days],
            sum(case when DATEDIFF(day, [PaymentDate], @CurrentDate) >= 120 and DATEDIFF(day, [PaymentDate], @CurrentDate) < 150 then btas.[Balance]/tmp.[numberofpaymentsmissed] else 0.00 end) [120Days],
            sum(case when (DATEDIFF(day, [PaymentDate], @CurrentDate) >= 150) then btas.[Balance]/tmp.[numberofpaymentsmissed] else 0.00 end) [120PlusDays]


	from [billing].[TermArrangementSchedule] btas
	inner join [billing].[TermArrangement] bta (NOLOCK) on btas.TermArrangementId =bta.TermArrangementId
	left join [common].[termarrangementstatus] ctass (NOLOCK) on bta.[TermArrangementStatusId] =ctass.[Id]
	inner join policy.policy pp (NOLOCK) on bta.RolePlayerId = pp.PolicyOwnerId
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	left join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID 
	left join  common.Industry ind on ind.Id = cfp.IndustryId
    left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
	left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
	left join [billing].[TermDebitOrderBankingDetail] tdo on bta.TermArrangementId = tdo.TermArrangementId
	left join [common].[PaymentFrequency]  cpf ON bta.TermArrangementPaymentFrequencyId = cpf.Id
	left join [common].[PaymentMethod]  cpm ON bta.PaymentMethodId= cpm.Id
	left join #tempMissedpayments tmp  on bta.TermArrangementId = tmp.TermArrangementId
	left join #tempAmountPaid tpa on bta.TermArrangementId = tpa.TermArrangementId
	where DATEADD(day,7, btas.[PaymentDate]) between @StartDate and  @EndDate
	AND  (prod.[Id] not in (1,2,3))
	AND (cast(prod.Id as char(10)) IN (select value from string_split(@ProductId,',')) OR @ProductId IS NULL)
    AND (cast(ic.[Id] as char(10)) IN (select value from string_split(@IndustryId,',')) OR @IndustryId IS NULL)
	AND  btas.IsDeleted =0 AND  bta.IsDeleted =0
	AND btas.TermArrangementScheduleStatusId IN (4,2)
	AND bta.IsActive =1
	AND ctass.[Name] in ('Terms Defaulted','Terms Defaulted1')



	Group by ic.[Name] ,cpm.[Name],--prod.[Name],
			ISNULL(cpn.[FirstName] +' ' + cpn.Surname,r.DisplayName) ,
			tdo.[BankAccountNumber],Datename(mm,(bta.[StartDate])),			 
			 cfp.[FinPayeNumber],ctass.[Name],tmp.[numberofpaymentsmissed],
			cpf.[Name],bta.TermMonths,btas.Amount ,tmp.Balance,bta.TotalAmount,
			btas.Amount,tpa.Balance	


END
GO
