CREATE   PROCEDURE [policy].[QDelReport] 
AS

select  distinct
    'QDEL'as 'QDEL',
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
		 left(convert(varchar,pp.CancellationDate,112),8) as 'End Date',
		  '0' as 'Start Date'		,
		  ps.[Name] as 'Policy Status',
		 '0056' as 'Deduction Type'
			 
		
from policy.Policy pp  WITH (NOLOCK)

inner join Client.Person ccp  WITH (NOLOCK) on ccp.RolePlayerId =  pp.PolicyOwnerId
inner join product.ProductOption po  WITH (NOLOCK) on pp.ProductOptionId = po.Id
inner join [common].[PaymentMethod]  pm  WITH (NOLOCK) on pm.Id = pp.PaymentMethodId
inner join [common].[PaymentFrequency] pf  WITH (NOLOCK) on pf.Id = pp.PaymentFrequencyId
inner join policy.PolicyLifeExtension ple  WITH (NOLOCK) on ple.PolicyId = pp.PolicyId 
inner join client.[RolePlayerPersalDetail] pps  WITH (NOLOCK) on pps.RolePlayerId = ccp.RolePlayerId 
inner join common.PolicyStatus ps WITH (NOLOCK) on ps.Id = pp.PolicyStatusId
where (ple.AffordabilityCheckPassed = 1 and pm.Id = 12  and ps.Id in (5, 2) )
