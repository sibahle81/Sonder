-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
CREATE   PROCEDURE [billing].[TermArrangementMOAReport] 
    @termArrangementId int
	as 
	begin        
     select ta.StartDate, ta.EndDate,ta.Balance, cf.FinPayeNumber, c.[Name] companyname,parentTermArrangementId, TermMonths, pf.Name PaymentFrequency from billing.TermArrangement ta
		  inner join client.Company c on c.RolePlayerId = ta.rolePlayerId		  
		  inner join client.FinPayee cf on cf.RolePlayerId = ta.roleplayerid
		  inner join common.PaymentFrequency pf on pf.Id = ta.PaymentFrequencyId
		   where ta.TermArrangementId = @termArrangementId  or ta.ParentTermArrangementId =  @termArrangementId  
		   order by parentTermArrangementId 
   end