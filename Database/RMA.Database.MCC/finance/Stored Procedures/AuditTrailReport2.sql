


CREATE  PROCEDURE [finance].[AuditTrailReport2] 
       @StartDate As Date,
       @EndDate AS Date

AS
BEGIN
SELECT DISTINCT 
pay.CreatedBy		AS  Username	
,ps.name		AS Status	
,pay.Product	AS Product	
,ClaimReference AS 'Claim Number'		
,pay.Reference	AS Reference	
--,pt.name		AS 'Payment Type'	
,pay.Payee		AS 'Payee Name'	
,pay.AccountNo	AS 'Bank Account' 	
,pay.Amount		AS Amount
,pay.CreatedDate		AS 'Date and time'	
,case when pt.[name] in ('Claim','Pension','Commission') and DATEDIFF(HOUR,pay.SubmissionDate,trns.TransactionDate) <= 480 then 'Within SLA'
      when pt.[name] in ('Claim','Pension','Commission') and DATEDIFF(HOUR,pay.SubmissionDate,trns.TransactionDate) > 480 then 'Outside SLA' 
	  when pt.[name] in ('Medical Invoice','Capital Value','Tribunal') and DATEDIFF(HOUR,pay.SubmissionDate,trns.TransactionDate) <= 24 then 'Within SLA'
      when pt.[name] in ('Medical Invoice','Capital Value','Tribunal') and DATEDIFF(HOUR,pay.SubmissionDate,trns.TransactionDate) > 24 then 'Outside SLA'
	  when pt.[name] not in ('Medical Invoice','Capital Value','Tribunal','Claim','Pension','Commission') and DATEDIFF(HOUR,pay.SubmissionDate,trns.TransactionDate) <= 120 then 'Within SLA'
      when pt.[name] not in ('Medical Invoice','Capital Value','Tribunal','Claim','Pension','Commission') and DATEDIFF(HOUR,pay.SubmissionDate,trns.TransactionDate) > 120 then 'Outside SLA'
	  else 'Within SLA' 
	  end AS 'SLA'
	  ,case when pay.PaymentTypeId = 2 then ps.name	else '' end as 'Payment Type'
	 

from [Payment].[Payment] (NOLOCK) pay 
inner join [Common].[Paymenttype] (NOLOCK) pt ON pt.id = pay.PaymentTypeId
inner join [common].[paymentstatus](NOLOCK) ps ON ps.id = pay.PaymentStatusId
left join billing.Invoice inv on pay.PolicyId = inv.PolicyId 
left join billing.Transactions trns on inv.InvoiceId = trns.InvoiceId
left join claim.Claim clm on pay.ClaimId = clm.ClaimId 

where  Cast(pay.CreatedDate as Date) >= @StartDate and  Cast(pay.CreatedDate as Date) <= @EndDate

  end