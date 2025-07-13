CREATE PROCEDURE [billing].[CommisionTransactionReportLineItems] 
	@headerId int
AS
/*
	exec [billing].[CommisionTransactionReportLineItems] @headerId = 19
*/
Begin
DECLARE @RecepientId int,@RecepientTypeId int, @PeriodId int
select TOP 1
@RecepientId = h.RecepientId,
@RecepientTypeId = h.RecepientTypeId,
@PeriodId = p.PeriodId
from 
commission.Header h (NOLOCK)  
INNER JOIN commission.[Period] p on p.PeriodId = h.PeriodId
WHERE        (h.HeaderId = @headerId)


SELECT
h.HeaderId,
p.YYYY,
MM = LEFT(UPPER(DateName( month , DateAdd( month , p.MM , -1 ) )),3),
PolicyNumber = pol.PolicyNumber,
ClientName = cr.displayName,
 case when cr.RolePlayerIdentificationTypeId = 1 then cp.IdNumber when  cr.RolePlayerIdentificationTypeId = 2 then cc.IdNumber end  'ClientIdentificationNumber' ,
AgentCode = pb.Code,
PolicyInceptionDate = pol.PolicyInceptionDate,
ProductOption = ISNULL(po.Description,po.Name),
InvoiceMonth = FORMAT(inv.InvoiceDate,'MMM-yyyy'),
PaymentDate = pa.CreatedDate,
ReceivedPremium = pa.Amount,
CommissionPercentage = d.CommissionPercentage ,
CommissionAmount = d.CommissionAmount,
IntermediaryServiceFeePercentage = d.AdminPercentage ,
IntermediaryServiceFee = d.AdminServiceFeeAmount,
--[Status] = cs.[Name],
RowTotal = d.CommissionAmount+d.AdminServiceFeeAmount

FROM   commission.Header h (NOLOCK)  
		INNER JOIN commission.[Period] p on p.PeriodId = h.PeriodId
		INNER JOIN common.CommissionStatus cs on cs.Id = h.HeaderStatusId
		INNER JOIN commission.Detail d (nolock) on d.HeaderId = h.HeaderId
		INNER JOIN commission.InvoicePaymentAllocation pa (nolock) on pa.InvoicePaymentAllocationId = d.InvoicePaymentAllocationId
		INNER JOIN billing.Invoice inv (nolock) on inv.InvoiceId = pa.InvoiceId
		INNER JOIN [policy].[Policy] pol (nolock) on pol.PolicyId = inv.PolicyId
		INNER JOIN product.productoption po (nolock) on po.Id = pol.ProductOptionId
		INNER JOIN client.RolePlayer cr on pol.PolicyOwnerId = cr.RolePlayerId
		LEFT JOIN client.Person cp on cr.RolePlayerId = cp.RolePlayerId
		LEFT JOIN client.Company cc on cr.RolePlayerId = cc.RolePlayerId 
		CROSS APPLY(SELECT TOP 1 JuristicRepresentative = LTRIM(RTRIM(jur.FirstName +' '+ jur.SurnameOrCompanyName)), bk.RegNo, agent.Code
								from [policy].[PolicyBroker] p (nolock)
								inner join [broker].Brokerage (nolock) bk on bk.Id = p.BrokerageId
								inner join [broker].Representative (nolock) agent on agent.Id = p.RepId
								LEFT join [broker].Representative (nolock) jur on jur.Id = p.JuristicRepId
								where p.PolicyId = pol.PolicyId) pb  
where p.PeriodId  = @PeriodId AND (h.RecepientTypeId = @RecepientTypeId  and h.RecepientId = @RecepientId) 
END
