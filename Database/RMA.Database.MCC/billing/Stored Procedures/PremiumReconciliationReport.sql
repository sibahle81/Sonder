CREATE PROCEDURE [billing].[PremiumReconciliationReport] 
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId AS VARCHAR(25) = '0'
	
AS
BEGIN
DECLARE	@ProcEndDate AS DATE = Dateadd(dd,1,@EndDate)


IF @IndustryId = '0'
	 begin select @IndustryId = NULL;
	 end


------Posted on GL----

        IF OBJECT_ID(N'TEMPDB..#temptransactionaudit', N'U') IS NOT NULL
           DROP TABLE #temptransactionaudit;

           select  transactionid,Reference,
                   sum(Amount) as Amount

            into #temptransactionaudit
            from [billing].[AbilityTransactionsAudit] (nolock)
			where IsDeleted =0
			and CreatedDate between @StartDate and  @ProcEndDate 
			group by transactionid,Reference


SELECT  DISTINCT  bt.TransactionId,
		ic.[Name] [Industry],
		[debtor].finpayenumber as [MemberNumber],
		r.DisplayName MemberName,
		[client_transaction].coverperiod as [coverperiod], 
		case when [client_transaction].totalamount < 0 then 'Credit Note'
			 when [client_transaction].totalamount > 0 then 'Invoice' end as [DocumentType], 
		[client_transaction].documentnumber as [document number], 
		[client_transaction].totalamount as [membership amount], 
		[billing_invoice].totalinvoiceamount as [invoice amount],
		[transaction_status].[name] as [status (client)], 
		[invoice_status].[name] as [status (collections)],
		[client_transaction].sentdate as [membership date sent],
		[billing_invoice].createddate as [date received (collections)],
		[billing_invoice].invoicedate as [invoice date],
		[billing_invoice].collectiondate as [collection date],
		[product].[Name] as [Product],
		[productoption].[Name] as [ProductOption],
		[policy].PolicyNumber,
		Case when bata.Reference in (Select distinct Reference from [billing].[AbilityCollections] where ChartIsNo in ('75000','10651'))
			 then isnull(bata.Amount,0) else 0 end as [Posted Amount],
		bt.Amount as [Transaction Invoice Amount],
		bt.CreatedDate as [TransactionDate],
		bata.CreatedDate  as [PostedDate],
		case when [invoice_status].id = 15 then 'Invoice is Queued'
			 when bt.TransactionDate is null then 'Billing schedule has not run'
			 when bata.Reference not in (Select distinct Reference from [billing].[AbilityCollections])  then 'Transaction not posted on GL yet'
			 when (bt.IsLogged is null and bt.TransactionId not in (select transactionid from [billing].[AbilityTransactionsAudit] ))  then 'Transaction not posted on GL yet'
			 when (bt.IsLogged = 1 and bt.TransactionId not in (select transactionid from [billing].[AbilityTransactionsAudit] ))  then 'Transaction not posted on GL yet' 
			 when bt.TransactionId in (select distinct transactionid from [billing].[AbilityTransactionsAudit] where Isdeleted =0
							group by transactionid
							having count(*) > 1
						 ) then 'Duplicate'  
			when ([billing_invoice].totalinvoiceamount = isnull(bata.Amount,0))  then NULL
			else Null end [Reason],
		Case when ic.[Id] = 2 then Concat(bify.StartYear,'-',bify.EndYear ) else cast(bify.StartYear as char(10)) end as [FinancialYear],
		case when [product].UnderwriterId = 1 then 'Coid' else 'Non-Coid' end as IndustryProduct

from  [client].roleplayerpolicytransaction [client_transaction] 
left join [billing].[Transactions] (nolock) bt on [client_transaction].roleplayerid =bt.Roleplayerid and [client_transaction].DocumentNumber =bt.RmaReference
left join [billing].[AbilityTransactionsAudit] (nolock) bata on bt.TransactionId = bata.TransactionId and bt.TransactionTypeId in (6,4) and bata.Isdeleted=0
left join  [billing].[AbilityCollections]  (nolock) ability on bata.Reference  = ability.Reference
inner join [client].finpayee as [debtor] on [debtor].roleplayerid = [client_transaction].roleplayerid
inner join [policy].[policy] [policy] on [policy].policyid = [client_transaction].policyid
inner join [client].[RolePlayer] r (nolock) on r.[RolePlayerId] = [policy].[PolicyOwnerId]
inner join [client].company as [company] on [company].roleplayerid = [debtor].roleplayerid
inner join [product].[productoption] [productoption] on [productoption].id = [policy].productoptionid
inner join [product].[product] [product] on [productoption].ProductId = [product].Id 
inner join [billing].invoice [billing_invoice] on [billing_invoice].invoicenumber = [client_transaction].documentnumber
inner join [common].transactiontype [type] on [type].id = [client_transaction].transactiontypeid
inner join [common].roleplayerpolicytransactionstatus [transaction_status] on [transaction_status].id = [client_transaction].roleplayerpolicytransactionstatusid
inner join [common].invoicestatus [invoice_status] on [invoice_status].id = [billing_invoice].invoicestatusid
inner join  [common].Industry ind on ind.Id = [debtor].IndustryId
inner join [common].IndustryClass ic on ic.Id = ind.IndustryClassId
inner join [billing].[IndustryFinancialYear] bify on ic.Id =bify.IndustryClassId and bify.IsActive=1



where ([client_transaction].SentDate >= @StartDate AND [client_transaction].SentDate <= @ProcEndDate)
AND isnull(bt.Isdeleted,[client_transaction].Isdeleted)=0
AND [client_transaction].Isdeleted =0
AND [billing_invoice].SourceModuleid=1 
AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
				WHERE (cast(ic.[Id] as char(10)) IN (select value from string_split(@IndustryId,',')) OR @IndustryId IS NULL)  AND ind.[IndustryClassId] = ic.[Id]
				AND ind.[Id] = ISNULL([debtor].IndustryId, ind.[Id])) 

END
