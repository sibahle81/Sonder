CREATE PROCEDURE [policy].[FuneralConductofBusinessReturnReport]

AS
BEGIN

              declare @ParentPolicies Table (
                           Id int identity(1,1),
                           ParentPolicyId int not null
                           )
              insert @ParentPolicies
              select distinct parentpolicyid 
                     from [policy].Policy 
                     where ParentPolicyId is not null 

------Invoices----

        IF OBJECT_ID(N'TEMPDB..#TEMPINVOICE', N'U') IS NOT NULL
           DROP TABLE #tempinvoice;

                select distinct
                    first_value([invoiceid]) over (partition by [policyid] order by [collectiondate] desc) as [invoiceid],
                    first_value([collectiondate]) over (partition by [policyid] order by [collectiondate]  desc) as [collectiondate],
                    first_value([invoicedate]) over (partition by [policyid] order by [collectiondate]  desc) as [invoicedate],
                    first_value([policyid]) over (partition by [policyid] order by [collectiondate] desc) as [policyid]
                     into #tempinvoice
                     from [billing].[invoice] (nolock)

------Number of Insured Lives----

              IF OBJECT_ID(N'tempdb..#TempPolicyInsuredLives', N'U') IS NOT NULL
           DROP TABLE #TempPolicyInsuredLives;

                     select count(policyid) Nooflives,policyid 
                     into #TempPolicyInsuredLives
                     from [policy].[PolicyInsuredLives] (NOLOCK)
                     where InsuredLifeStatusId = 1
                     group by policyid  
 
------Group Created period----

        IF OBJECT_ID(N'TEMPDB..#TEMPNEWGROUPS', N'U') IS NOT NULL
           DROP TABLE #TempNewGroups;

                select distinct
                        FIRST_VALUE((YEAR(p.[CreatedDate]) * 100) + (MONTH(p.[CreatedDate]))) OVER (PARTITION BY parp.DisplayName ORDER BY (YEAR(p.[CreatedDate]) * 100) + (MONTH(p.[CreatedDate])) ASC) AS [CreatedDateYearMonth],
                        p.ParentPolicyId
                into #TempNewGroups
                from [policy].[Policy] p (nolock)
                left join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
                left join [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId

                     
------Number of Policy Info----
       
       IF OBJECT_ID(N'tempdb..#TempCBR', N'U') IS NOT NULL
          DROP TABLE #TempCBR;

           select         
				case when parp.[displayname] is not null then 'Group'
					 else 'Individual' end as 'FuneralType', 
				cpn.firstname  as [Name],
				cpn.surname as [Surname],
				case isnull(cpn.idtypeid, 6) when 1 then cpn.idnumber else '' end [Idnumber],
				case isnull(cpn.idtypeid, 6) when 1 then '' else cpn.idnumber end [Passportnumber],
				p.[policynumber],
				p.[clientreference] as Adsolpolicynumber,
				p.[policyinceptiondate] as [Commencedate] ,
				(year(p.[policyinceptiondate]) * 100) + (month(p.[policyinceptiondate])) as [Policyinceptionyearmonth],
				year(p.[policyinceptiondate]) as [Policyinceptionyear],
				month(p.[policyinceptiondate]) as [Policyinceptionmonth],
				cast(p.[createddate] as date) as [Creationdate],
				p.[installmentpremium] as [Currentpremium],
				icd.[name] as [Industryclass],
				brokerage.[name] as [Brokername],
				parp.displayname as [Schemename],
				agent.firstname + ' ' + [agent].surnameorcompanyname as [Agentname],
				cps.[name] as [Status],
				case when cps.[name] in ('cancelled','lapsed','not taken up','pending reinstatement','paused','pending continuation') then 'Cancelled' 
					 when  cps.[name] in ('pending first premium','reinstated','continued','pending cancelled','request cancellation','active','Free Cover') then 'Active' else cps.[name] end as Overallstatus,
				p.[cancellationdate] as [Cancellationdate],
				p.[lastlapseddate] as [Lastlapseddate],
				ccr.[name] as [Cancelreason],
				cpn.[dateofdeath] as [Deathdate],
				cast(p.[createddate] as date) as [Applicatiodate],
				cast(p.[modifieddate] as date) as [Modifieddate],
				case when cps.[name] in ('pending first premium','reinstated','continued','pending cancelled','request cancellation','active','Free Cover')
					 then [brokerage].[name] + [parp].displayname else 'none' end as Brokerscheme,
				case when crt.name like 'natural' and [brokerage].[name] like '%rand mutual%' then 'rma written business'
					 when crt.name like 'juristic' then 'juristic rep written business'
					 when crt.name like 'natural' and [brokerage].[name] not like '%rand mutual%'  then 'independent brokers written business'
				end as Underwritter,
                prod.name as [Productoption],
				bi.[collectiondate] Debitdate,
				(year(p.[createddate]) * 100) + (month(p.[createddate])) as [Createddateyearmonth],
				r.tellnumber as 'Telnumber',
				r.cellnumber as 'Cellnumber',
				r.emailaddress as 'Emailaddress',
				[agent1].firstname + ' ' + [agent1].surnameorcompanyname as [Juristicrep],
	            dateadd(month,CAST(ISNULL(json_value(ppor.[RuleConfiguration], '$[0].fieldValue'),0) AS INT), p.[PolicyInceptionDate]) AS [WaitingPeriodEnd],
				case when cpn.isalive = 0 then'no'
					 when cpn.isalive = 1 then 'yes' else 'unknown' end as [Aliveindicator],
				client.CalculateAge(isnull(cpn.DateOfBirth, getdate())) [Age],
				sum(tpil.nooflives) as [Lives],	
	            tng.[CreatedDateYearMonth] as [NewGroupCreatedDateYearMonth],
				case when pcps.[name] in ('cancelled','lapsed','not taken up','pending reinstatement','paused','pending continuation') then 'Cancelled' 
					 when  pcps.[name] in ('pending first premium','reinstated','continued','pending cancelled','request cancellation','active') then 'Active' else pcps.[name] end as Parentoverallstatus,
				case when prod.[Name] like '%family%' then 'Individual'
					when prod.[Name] like '%group%' then 'Group'
					when prod.[Name] like '%corporate%' then 'Corporate'
					when prod.[Name] = 'rma staff' then 'Staff'
					when prod.[Name] like '%gold%' then 'Goldwage'
					end as [ClientType]                 

                 into #tempcbr
                 from [policy].[policy]  p (nolock) 
                 inner join [client].[roleplayer] r (nolock) on r.[roleplayerid] = p.[policyownerid]
                 left join [policy].[policy] papol (nolock) on papol.policyid = p.parentpolicyid
                 left join [client].[roleplayer] parp (nolock) on parp.roleplayerid = papol.policyownerid
                 left join client.finpayee cfp (nolock) on papol.[policyownerid] = cfp.roleplayerid 
                 left join [common].[industry] ic (nolock) on ic.id =cfp.industryid
                 left join [common].[industryclass] icd (nolock) on icd.id =ic.industryclassid 
                 left join [broker].brokerage [brokerage] (nolock) on [brokerage].id = p.brokerageid
                 left join [common].[policystatus] cps (nolock) on p.[policystatusid] = cps.[id]
                 left join [client].person cpn (nolock) on  r.roleplayerid = cpn.roleplayerid
                 left join [common].policycancelreason ccr on p.[policycancelreasonid] =ccr.[id]
                 inner join [broker].[representative] [agent] on p.representativeid = [agent].id
                 left join [common].[reptype] crt on agent.reptypeid = crt.[id]
                 left join [product].[productoption] (nolock) prod on prod.id = p.productoptionid
                 left join [product].[product] (nolock) ppr on prod.productid = ppr.id
                 left join #tempinvoice bi on isnull(p.parentpolicyid,p.[policyid]) =bi.[policyid]
                 left join #temppolicyinsuredlives tpil on tpil.[policyid] = p.[policyid]
                 left join #tempNewGroups tng on tng.[ParentPolicyId] = papol.policyid
                 left join [policy].[policybroker] ppb (nolock) on [p].juristicrepresentativeid = [ppb].juristicrepid and [p].policyid = ppb.policyid and ppb.isdeleted =0
                 left join [broker].[representative] [agent1] (nolock) on ppb.juristicrepid = [agent1].id
                 left join product.productoptionrule ppor (nolock) on prod.id = ppor.productoptionid and ppor.ruleid = 5 and ppor.isdeleted = 0
                 left join [common].[policystatus] pcps (nolock) on papol.[policystatusid] = pcps.[id]

                 where p.isdeleted = 0 
                 and r.[roleplayeridentificationtypeid] <> 2

                 GROUP BY ICD.Id ,
              cpn.FirstName,
              cpn.Surname,
              cpn.[IdNumber],
              p.[PolicyNumber],
              p.[ClientReference],
              p.[PolicyInceptionDate],
              (YEAR(p.[PolicyInceptionDate]) * 100) + (MONTH(p.[PolicyInceptionDate])),            YEAR(p.[PolicyInceptionDate]),
              MONTH(p.[PolicyInceptionDate]),
              CAST(p.[CreatedDate] AS DATE),
              CAST(p.[ModifiedDate] AS DATE),                                            
              p.[InstallmentPremium],
              ICD.[Name],
              [brokerage].[Name],
              [parp].DisplayName,
              [agent].FirstName + ' ' + [agent].SurnameOrCompanyName,
              cps.[Name],
              p.[CancellationDate],
              p.[LastLapsedDate],
              ccr.[Name],
              cpn.[DateOfDeath],
              CAST(p.[CreatedDate] AS DATE),
              [brokerage].[Name] + [parp].DisplayName,
              crt.name,
              prod.Name ,
              p.ParentPolicyId,
              cpn.IdTypeId,
              bi.[CollectionDate],
              (YEAR(p.[CreatedDate]) * 100) + (MONTH(p.[CreatedDate])),
                r.[TellNumber],
                r.[CellNumber],
                r.[EmailAddress],
                [agent1].FirstName + ' ' + [agent1].SurnameOrCompanyName,
              dateadd(month,CAST(ISNULL(json_value(ppor.[RuleConfiguration], '$[0].fieldValue'),0) AS INT), p.[PolicyInceptionDate]),
            pcps.[Name],
            cpn.IsAlive, 
            cpn.[DateOfBirth],tng.[CreatedDateYearMonth]  

          Select tmp.*,DATEDIFF(DAY,tmp.[CommenceDate],tmp.[WaitingPeriodEnd]) AS [WaitingPeriodOutstandinginDays]
          from #tempcbr tmp
                   
END
GO