CREATE PROCEDURE [claim].[FSBReport]
	@DateFrom As Date,
	@DateTo AS Date
AS
BEGIN
 Declare @claimsCount int,
		@claimsTotal money,
		@claimsPaidCount int,
		@claimsPaidTotal money,
		@claimsRepudiatedCount int,
		@claimsRepudiatedTotal money,
		@claimsOutstandingCount int,
		@claimsOutstandingTotal money

Select 
@claimsCount = Count(c.ClaimId),@claimsTotal = ROUND(Sum(cl.AuthorisedAmount),2)  from Claim.claim c 
 inner join [claim].[ClaimInvoice] cl on c.claimId = cl.ClaimId  where cl.createdDate between @DateFrom and @DateTo
/*Select 
@claimsPaidCount = Count(c.ClaimId),@claimsPaidTotal = Sum(cl.AuthorisedAmount)  from Claim.claim c 
 inner join [claim].[ClaimInvoice] cl on c.claimId = cl.ClaimId  
 where cl.createdDate between @DateFrom and @DateTo and cl.ClaimInvoiceStatusId = 60*/

select 
@claimsPaidCount =Count(distinct cl.ClaimId),@claimsPaidTotal = Sum(p.amount)  
  from claim.claim cl
   INNER join  payment.payment p on cl.claimid = p.claimid
  where cl.createdDate between @DateFrom and @DateTo and cl.claimstatusid= 9
/*Select 
@claimsRepudiatedCount = Count(c.ClaimId),@claimsRepudiatedTotal = Sum(cl.AuthorisedAmount)  from Claim.claim c 
 inner join [claim].[ClaimInvoice] cl on c.claimId = cl.ClaimId  
 where cl.createdDate between @DateFrom and @DateTo and cl.ClaimInvoiceStatusId = 80 */

 select 
@claimsRepudiatedCount =Count(distinct cl.ClaimId),@claimsRepudiatedTotal = Sum(p.amount)  
  from claim.claim cl
   join  payment.payment p on cl.claimid = p.claimid
  where cl.createdDate between @DateFrom and @DateTo and cl.claimstatusid= 10

/* Select 
@claimsOutstandingCount = Count(c.ClaimId),@claimsOutstandingTotal = Sum(cl.AuthorisedAmount)  from Claim.claim c 
 inner join [claim].[ClaimInvoice] cl on c.claimId = cl.ClaimId  
 where cl.createdDate between @DateFrom and @DateTo and cl.ClaimInvoiceStatusId = 140*/

  select 
@claimsOutstandingCount =Count(distinct cl.ClaimId),@claimsOutstandingTotal = Sum(p.amount)  
  from claim.claim cl
   join  payment.payment p on cl.claimid = p.claimid
  where cl.createdDate between @DateFrom and @DateTo and cl.claimstatusid= 23

 Select @claimsCount as ' Number of claims reported to the insurer ', @claimsTotal as ' Value of claims reported in the reporting period.',
 @claimsPaidCount as 'Number of claims  paid in the reporting period',@claimsPaidTotal as 'Value of claims paid in the reporting period.',
 @claimsRepudiatedCount as 'Number of claims  repudiated in the reporting period.',@claimsRepudiatedTotal as 'Value of claims   repudiated in the reporting period.',
 @claimsOutstandingCount as 'Number of claims outstanding end of the reporting period.',@claimsOutstandingTotal as 'Value of claims outstanding  end of the reporting period.'
END




