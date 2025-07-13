


CREATE PROCEDURE [finance].[KeyRiskIndicators]
	--@StartDate		As Date,
	--@EndDate		AS Date 
	
AS
	BEGIN

	
    SET NOCOUNT ON;
   
   

select pt.Name, count(*) Total_No_Of_Payment
into #pay
from Payment.payment p
inner join common.paymentType pt on p.PaymentTypeId = pt.Id  
inner join common.PaymentStatus ps on p.PaymentStatusId = ps.Id  
where ps.id in (2)
group by pt.Name 
order by pt.Name desc

select p.Name, p.Total_No_Of_Payment, missedPayment.missedPayment, case when p.Name = 'Commission' then 'Once a week and month end' 
			   when p.Name = 'Pension' then 'Once a week and month end' 
			   when p.Name = 'Medical Invoice' then 'Daily' 
			   when p.Name = 'Tribunal' then 'Daily'
			   when p.Name = 'CV values' then 'Daily'
			   When p.Name = 'Scheduled' then 'Thursdays only (weekly)'
			   when p.Name = 'Funeral' then 'Twice a day' 
			   else 'Daily'
           end as SLA 

    ,case when datepart(hour, p.Name) >= 0 AND
	           datepart(hour,p.Name) <= 24
      then 'Green'
      when datepart(hour, p.Name) >= 24 AND
	        datepart(hour,p.Name) <= 48
      then 'Amber'
      else 'Red'
    	end as Status



from #pay p
left join ( select pt.Name,count(*)  missedPayment 
from Payment.payment p 
inner join common.paymentType pt on p.PaymentTypeId = pt.Id 
inner join common.PaymentStatus ps on p.PaymentStatusId = ps.Id  
where SubmissionDate <> ModifiedDate
group by pt.Name ) as missedPayment on p.Name =  missedPayment.Name

	END