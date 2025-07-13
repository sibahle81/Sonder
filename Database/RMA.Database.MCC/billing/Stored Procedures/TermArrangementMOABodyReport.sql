-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
CREATE   PROCEDURE [billing].[TermArrangementMOABodyReport] --96
    @termArrangementId int
	as 
	begin
    declare @count int =	  (select count(termarrangementId)  from billing.TermArrangement where termarrangementId in (
		        select ta.termarrangementId from billing.TermArrangement ta
		   where ta.TermArrangementId = @termArrangementId  or ta.ParentTermArrangementId =  @termArrangementId  
		  ))

		  if @count =1
		  begin
		   select ta.TotalAmount Balance, cf.FinPayeNumber,c.[name] companyname  from billing.TermArrangement ta
		  inner join client.Company c on c.RolePlayerId = ta.rolePlayerId		  
		  inner join client.FinPayee cf on cf.RolePlayerId = ta.roleplayerid
		  inner join common.PaymentFrequency pf on pf.Id = ta.TermArrangementPaymentFrequencyId
		   where ta.TermArrangementId = @termArrangementId
		  end
		    if @count >1
		  begin
		    select sum(tp.contractAmount) Balance, cf.FinPayeNumber,c.[name] companyname   from billing.TermArrangement ta
		  inner join client.Company c on c.RolePlayerId = ta.rolePlayerId		  
		  inner join client.FinPayee cf on cf.RolePlayerId = ta.roleplayerid
		  inner join common.PaymentFrequency pf on pf.Id = ta.TermArrangementPaymentFrequencyId
		  	inner join [billing].[TermArrangementProductOption] tp on ta.TermArrangementId = tp.TermArrangementId
		 where ta.ParentTermArrangementId = @termArrangementId
		 group by cf.FinPayeNumber,c.[name]
		  end
	
   end