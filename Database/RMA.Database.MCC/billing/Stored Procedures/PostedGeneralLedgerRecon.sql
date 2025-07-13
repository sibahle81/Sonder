



/****** Object:  StoredProcedure [billing].[PostedGeneralLedgerReport]    Script Date: 2020/10/26 12:54:11 PM ******/
--SET ANSI_NULLS ON
--GO

--SET QUOTED_IDENTIFIER ON
--GO

 CREATE    PROCEDURE [billing].[PostedGeneralLedgerRecon]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL,
	@IndustryId int,
	@ProductName VARCHAR(50)
AS
--declare @startdate as date = '2022-09-01'
--declare	@enddate as date = '2022-09-30'
--declare @industryid int = 0
--declare @ProductName VARCHAR(50) ='All'
begin

	declare @parentpolicies table (id int identity(1,1),parentpolicyid int not null)
	insert @parentpolicies
	select distinct parentpolicyid 
	from [policy].policy where parentpolicyid is not null 
	and createddate <= @EndDate

	if @productname = 'all'
	begin select @productname = null;
	end

	if @industryid = 0
	begin select @industryid = null;
	end

IF OBJECT_ID(N'tempdb..#TempGeneralLedger', N'U') IS NOT NULL
			DROP TABLE #TempGeneralLedger;

select distinct icd.[Name] as Industry,OnwerDetails as Schemename,I.InvoiceNumber as ItemReference,
          AT.Amount AS Amount,T.TransactionDate,AT.Item as DocumentType,
		  F.FinPayeNumber as DebtorNumber,'General Ledger' as SourceType
		  into #tempgeneralledger
from [billing].[abilitycollections] ac inner join [billing].[abilitytransactionsaudit] at
on ac.reference = at.reference inner join [billing].[transactions] t 
on at.transactionid = t.transactionid inner join [client].[roleplayer] r
on t.roleplayerid = r.roleplayerid inner join [client].[finpayee] f
on r.roleplayerid = f.roleplayerid left join billing.invoice i
on i.invoiceid = t.invoiceid left join [common].[industry] ic 
on ic.id =f.industryid left join [common].[industryclass] icd 
on icd.id =ic.industryclassid left join [policy].[policy] (nolock) pp 
on t.roleplayerid = pp.[policyownerid] left join [product].[productoption] (nolock) prod 
on prod.id = pp.productoptionid left join [product].[product] (nolock) ppr 
on prod.productid = ppr.id where ac.isbilling = 1
and (t.transactiondate between @startdate and @enddate)
and at.item ='invoice'
AND (ICD.Id > CASE WHEN (@IndustryId = 0 OR @IndustryId IS NULL) THEN 0 END
OR          ICD.Id = CASE WHEN (@IndustryId > 0) THEN  @IndustryId END)
AND (ppr.[Name] =@ProductName or @ProductName is null )
AND icd.[Name] <> 'Individual'

--group by icd.[Name],OnwerDetails,T.TransactionDate,AT.Reference,AT.Item,F.FinPayeNumber,I.InvoiceNumber 
order by 2

---------Policy Details ----------


IF OBJECT_ID(N'tempdb..#TempPolicy', N'U') IS NOT NULL
			DROP TABLE #TempPolicy;

select icd.[Name] AS Industry,F.FinPayeNumber as DebtorNumber,p.PolicyNumber,crp.DisplayName as SchemeName,cps.[Name] as PolicyStatus,p.PolicyInceptionDate,
p.CancellationDate,p.CreatedBy as PolicyCreatedBy,p.CreatedDate as PolicyCreatedDate,
pfr.Name AS PaymentFrequency,'Installment Premium' as DocumentType,'Policy' as SourceType
into #TempPolicy
from policy.policy p
inner join @ParentPolicies tmppp on tmppp.ParentPolicyId = p.PolicyId
inner join common.PolicyStatus cps on p.PolicyStatusId = cps.Id
inner join broker.brokerage bbr on p.BrokerageId = bbr.Id
inner join broker.Representative br on p.RepresentativeId =br.Id
inner join product.ProductOption ppo on p.ProductOptionId = ppo.Id
inner join product.Product pp on ppo.ProductId =pp.Id
inner join common.PaymentFrequency pfr on p.PaymentFrequencyId =pfr.Id
inner join [client].[RolePlayer] crp on p.PolicyOwnerId =crp.RolePlayerId
inner join [client].[FinPayee] F on crp.RolePlayerId = F.RolePlayerId
left join [common].[Industry] IC on IC.Id =F.IndustryId 
left join [common].[IndustryClass] ICD on ICD.Id =IC.IndustryClassId
cross apply (select sum(cap.InstallmentPremium) As InstallmentPremium
			from policy.policy cap
			inner join [policy].[PolicyStatusActionsMatrix]  psam on cap.PolicyStatusId = psam.PolicyStatus
			where cap.parentpolicyid=p.PolicyId
			and psam.DoRaiseInstallementPremiums =1) as Premium
where  p.IsDeleted = 0

--Select top 10 * from #tempgeneralledger
--Select top 10 * from #TempPolicy
END