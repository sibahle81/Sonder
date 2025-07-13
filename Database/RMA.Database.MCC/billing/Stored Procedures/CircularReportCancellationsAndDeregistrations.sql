

CREATE  PROCEDURE [billing].[CircularReportCancellationsAndDeregistrations]
	@StartDate Datetime,
	@EndDate Datetime,
	@IndustryId AS VARCHAR(25) = '0',
	@ProductId AS VARCHAR(25) = '-1'

AS
	BEGIN
    
	--DECLARE @StartDate AS DATE = '2023-09-01'
	--DECLARE @EndDate AS DATE ='2024-10-01'
	--DECLARE @IndustryId AS NVARCHAR(25) = '2,1'
	--DECLARE @ProductId AS NVARCHAR(25) = '4,1'

			 IF @IndustryId = '0'
				 begin select @IndustryId = NULL;
				 end

			 IF @ProductId = '-1'
				 begin select @ProductId = NULL;
				 end

			IF OBJECT_ID(N'tempdb..#TempBillingTransactions', N'U') IS NOT NULL
						DROP TABLE #TempBillingTransactions;	
			SELECT RolePlayerId,
				   TransactionTypeLinkId,
				   Reason,Amount,TransactionTypeId
	
			INTO #TempBillingTransactions
			FROM Billing.Transactions (nolock)
			where TransactionDate <= @EndDate


		-- Create Temp Table

		IF OBJECT_ID(N'tempdb..#TempRolePlayers', N'U') IS NOT NULL
						DROP TABLE #TempRolePlayers;

		SELECT DISTINCT 
						icd.[Name] AS IndustryName,
						ps.[Name] AS PolicyStatus,		
						cfp.FinPayeNumber AS [Customer],
						r.Displayname as DebtorName,
						--sum(CASE WHEN bt.TransactionTypeLinkId = 1 THEN bt.Amount ELSE - bt.Amount END) AS [DocBalance],
						Case when (cds.[Name] like '%Write off%' and icd.[Id] in (1,2)) then (sum(Case when bt.reason like '%Write Off%' Then bt.Amount end)) 
							 --when (icd.[Id] not in (1,2) and pp.PolicyStatusId in (2,5,6,7,9,10,19,21)) then (sum(Case when bt.TransactionTypeLinkId = 1 Then bt.Amount else -bt.Amount end)) 
							 else sum(Case when bt.TransactionTypeLinkId = 1 Then bt.Amount else -bt.Amount end) end as Amount,
						Case when icd.[Id] in (1,2) then cds.[Name]  else ps.[Name] end as DebtorStatus,
						cpcr.[Name] as CancelationReason,
						case when prod.UnderwriterId = 1 and prod.ProductClassId = 1 then 'Coid' 
						     when prod.UnderwriterId = 2 and prod.ProductClassId = 3 then  'Non-Coid'
							 else 'Unknown' end as IndustryProduct
						           			    
		INTO #TempRolePlayers        
		FROM [client].[RolePlayer] (NOLOCK) r
		INNER JOIN [policy].[Policy] pp (NOLOCK) on r.RolePlayerId = pp.PolicyOwnerId
		LEFT JOIN #TempBillingTransactions bt on r.RolePlayerId = bt.RolePlayerId
		LEFT JOIN Common.PolicyStatus ps ON pp.PolicyStatusId = ps.Id
		LEFT JOIN Client.FinPayee cfp ON r.RolePlayerId = cfp.RolePlayerID       -- finPayeeNumber AS dr number  
		LEFT JOIN [common].[PolicyCancelReason] cpcr on pp.PolicyCancelReasonId = cpcr.Id
		LEFT JOIN [common].[Industry] IC ON IC.Id =cfp.IndustryId
		LEFT JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
		inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
        inner join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
		left join common.debtorstatus cds on cfp.DebtorStatusId = cds.Id
		WHERE pp.ParentPolicyId is null 
		and pp.PolicyStatusId not in (11,12,13,14,15,20,17,18)
		and (cast(prod.[Id] as char(10)) IN (select value from string_split(@ProductId,',')) OR @ProductId IS NULL)
		and (cast(icd.[Id] as char(10)) IN (select value from string_split(@IndustryId,',')) OR @IndustryId IS NULL)


--and bt.roleplayerid =1011270
		group by icd.[Name],ps.[Name],cfp.FinPayeNumber,cds.[Name],ICD.Id,prod.UnderwriterId,
		prod.ProductClassId,prod.Id,r.Displayname,cpcr.[Name],pp.PolicyStatusId,bt.TransactionTypeId


		SELECT DISTINCT
			IndustryName Class,DebtorName,CancelationReason,
			COALESCE(PolicyStatus, 'Unknown') AS PolicyStatus,
			DebtorStatus,
			COUNT(Customer) AS 'No of accounts',
			SUM(isnull(Amount,0)) AS 'Amount',
			IndustryProduct
		FROM #TempRolePlayers
		WHERE (IndustryName in ('Group','Individual','Other') and DebtorStatus not in ('Active','Pending First Premium'))
		or (IndustryName in ('Mining','Metals') and DebtorStatus is not null)
		and DebtorStatus not like '%Term%'
		GROUP BY PolicyStatus,DebtorName,CancelationReason,
				 IndustryName,
				 DebtorStatus,IndustryProduct
				 order by 1

		END