CREATE   PROCEDURE [policy].[QaddReport] 
AS
select  distinct
    'QADD'as 'QADD',
	pps.PersalNumber as 'Employee Number',
	ccp.Surname as 'Surname', 
	left(ccp.FirstName,1)  + case when 
	charindex (' ', ccp.FirstName, 1) > 0 then  substring(ccp.FirstName , charindex (' ', ccp.FirstName, 1) + 1,1)
	 else ' ' end  'initials',
	  ccp.IdNumber as 'ID Number',
       REPLACE(pp.PolicyNumber, '-', 'X') as 'Policy Number',
	   pp.InstallmentPremium*100 as 'Amount',
	   '0' as 'Balance',
	   '0' as 'Loan Amount',
		 left(convert(varchar,pp.FirstInstallmentDate,112),8) as 'Start Date',
		  '0' as 'End Date'		,
		 '0056' as 'Deduction Type',
		 CASE WHEN StatusCode  = 200 THEN QTT.Name + 'Ok'
WHEN StatusCode = 400 THEN LEFT(QTT.Name + REPLACE(JSON_VALUE(cql.REsponse,'$.Message'),'Qlink Error:',''),30)
END as RESULT
			 
		
from policy.Policy pp  WITH (NOLOCK)

inner join Client.Person ccp  WITH (NOLOCK) on ccp.RolePlayerId =  pp.PolicyOwnerId
inner join product.ProductOption po  WITH (NOLOCK) on pp.ProductOptionId = po.Id
inner join [common].[PaymentMethod]  pm  WITH (NOLOCK) on pm.Id = pp.PaymentMethodId
inner join [common].[PaymentFrequency] pf  WITH (NOLOCK) on pf.Id = pp.PaymentFrequencyId
inner join policy.PolicyLifeExtension ple  WITH (NOLOCK) on ple.PolicyId = pp.PolicyId 
inner join client.[RolePlayerPersalDetail] pps  WITH (NOLOCK) on pps.RolePlayerId = ccp.RolePlayerId 
inner join client.QlinkTRansaction cql WITH (NOLOCK) on cql.ItemId = pp.PolicyId
inner join [common].[QLinkTransactionType] QTT  WITH (NOLOCK) on cql.[QlinkTransactionTypeId] = QTT.id
where (ple.AffordabilityCheckPassed = 1 
and pm.Id = 12 and  cql.StatusCode<>401 
and cql.QlinkTransactionId not in (1448,1579,998,1452)
and (CASE WHEN StatusCode  = 200 THEN QTT.Name + 'Ok'
WHEN StatusCode = 400 THEN LEFT(QTT.Name + REPLACE(JSON_VALUE(cql.REsponse,'$.Message'),'Qlink Error:',''),30)
END ) not in ('QADDOk', 'QDELOk'))