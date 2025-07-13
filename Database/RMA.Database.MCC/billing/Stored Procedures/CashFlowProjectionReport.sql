CREATE  PROCEDURE [billing].[CashFlowProjectionReport] --'0','4,2'
	@IndustryId AS VARCHAR(25) = '0',
	@ProductId AS VARCHAR(25) = '-1'
	
AS

BEGIN

 DECLARE @includeInterest bit =0

 IF @IndustryId = '0'
   BEGIN SELECT @IndustryId = NULL; END

 IF @ProductId = '-1'
   BEGIN SELECT @ProductId = NULL; END    


		SELECT DISTINCT  
			 bta.[StartDate],
			 Datename(mm,(bta.[StartDate])) + ' ' + cast(year(bta.[StartDate]) as char(4)) as [StartingMonth],
			 ic.[Name] as [Industry],
			 cfp.[FinPayeNumber] [MemberNumber],
			 ISNULL(cpn.[FirstName] +' ' + cpn.Surname,r.DisplayName) AS [MemberName],
			 bta.TotalAmount as [Balance],
			 bta.TermMonths as [ArrangementMonths],
			 ctass.[Name] as [ScheduleStatus],
			 cast(bta.[CreatedDate] as date) [CreatedDate],
			 Datename(mm,(btas.[PaymentDate])) + ' ' + cast(year(btas.[PaymentDate]) as char(4)) [MonthsPaid],
			 --CASE WHEN btas.[AllocationDate] IS NOT NULL THEN Datename(mm,(btas.[PaymentDate])) + ' ' + cast(year(btas.[PaymentDate]) as char(4)) ELSE 'Unpaid' END  [MonthsPaid],
			 CASE WHEN Datename(mm,(btas.[PaymentDate])) ='January' THEN 1
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
				WHEN Datename(mm,(btas.[PaymentDate])) ='December' THEN 12 END AS [MonthNumber],
			ctas.[Name] as [TermStatus],
			btas.Amount AS [CollectedInstallemnt],
			CASE WHEN btas.[AllocationDate] IS NOT NULL THEN 'Yes' ELSE 'No' END AS [AllocatedStatus],
			ISNULL(DATEDIFF(DAY,btas.[PaymentDate],btas.[AllocationDate]),1999) AS DifferenceDay		

	from [billing].[TermArrangement] bta
	left join [billing].[TermArrangementSchedule] btas (NOLOCK) on btas.TermArrangementId =bta.TermArrangementId
	inner join policy.policy pp (NOLOCK) on  bta.RolePlayerId = pp.PolicyOwnerId
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID
	inner join [common].[TermArrangementStatus] ctas on bta.TermArrangementStatusId = ctas.id
	inner join [client].[company] c (NOLOCK) on c.[RolePlayerId] = pp.[PolicyOwnerId]
 	left join  common.Industry ind on ind.Id = cfp.IndustryId
    left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
	left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
	left join [common].[TermApplicationDeclineReason]  tdr ON bta.TermApplicationDeclineReasonId = tdr.Id
	left join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
	left join [common].[TermArrangementScheduleStatus] ctass (NOLOCK) on btas.[TermArrangementScheduleStatusId] =ctass.[Id]
	
	where  (prod.[Id] not in (1,2,3))
	AND (cast(prod.Id as char(10)) IN (select value from string_split(@ProductId,',')) OR @ProductId IS NULL)
    AND (cast(ic.[Id] as char(10)) IN (select value from string_split(@IndustryId,',')) OR @IndustryId IS NULL)
	AND bta.IsActive = 1 and bta.isdeleted =0 and bta.TotalAmount > 0
	AND ctas.[Name] not in ('Unsuccessful','ApplicationInProgress','Terms Defaulted 1','Paid')


END
