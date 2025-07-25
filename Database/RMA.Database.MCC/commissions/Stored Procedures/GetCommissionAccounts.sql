CREATE   PROCEDURE [commission].[GetCommissionAccounts]	 
AS
BEGIN

declare @commissionAccountsView table
(
	Id int identity (1,1),
	AccountTypeId smallint,
	AccountTypeName varchar(50), -- Brokerage (1) or Juristic (2)
	AccountId int, -- BrokeRageId or RepresentativeId
	AccountCode varchar(20), -- Code
	AccountName varchar(150), --Name or SurnameOrCompanyName
	IdentificationNumber varchar(50), -- RegNo or IdNumber

	TotalPendingRelease decimal(18,2),
	TotalSubmitted decimal(18,2),
	TotalWithHeld decimal(18,2),
	TotalPaid decimal(18,2),
	TotalRejected decimal(18,2)
)

insert @commissionAccountsView

select	 
	1,
	'Brokerage', 
	bkr.Id,
	bkr.Code,
	bkr.[Name],
	bkr.RegNo,
	ISNULL(pending.Total,0) ,
	ISNULL(submitted.Total,0) ,
	ISNULL(withheld.Total,0),
	ISNULL(paid.Total,0),
	ISNULL(rejected.Total,0)
from policy.[Policy] (nolock) pol
     inner join policy.PolicyBroker (nolock) pbr on pbr.PolicyId = pol.PolicyId									 
	 inner join broker.brokerage (nolock) bkr on bkr.Id = pol.brokerageId
	 outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND h.RecepientTypeId = 1 and h.RecepientId = bkr.Id and h.[HeaderStatusId] = 1) pending
	 --outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND  h.RecepientTypeId = 1 and h.RecepientId = bkr.Id and h.[HeaderStatusId] = 2) submitted
	 outer apply (select Total	= SUM(p.Amount) from commission.Header(NOLOCK) h inner join commission.PaymentInstruction (NOLOCK) p on p.HeaderId = h.HeaderId where h.IsDeleted = 0  and p.IsDeleted = 0 and p.StatusId = 2 AND h.RecepientTypeId = 1 and h.RecepientId = bkr.Id) submitted
     outer apply (select Total	= SUM(p.Amount) from commission.Header(NOLOCK) h inner join commission.PaymentInstruction (NOLOCK) p on p.HeaderId = h.HeaderId where h.IsDeleted = 0  and p.IsDeleted = 0 and p.StatusId = 3 AND h.RecepientTypeId = 1 and h.RecepientId = bkr.Id) paid
	 outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND  h.RecepientTypeId = 1 and h.RecepientId = bkr.Id and h.[HeaderStatusId] = 4) withheld
	 -- outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND  h.RecepientTypeId = 1 and h.RecepientId = bkr.Id and h.[HeaderStatusId] = 5) rejected
	 outer apply (select Total	= SUM(p.Amount) from commission.Header(NOLOCK) h inner join commission.PaymentInstruction (NOLOCK) p on p.HeaderId = h.HeaderId where h.IsDeleted = 0  and p.IsDeleted = 0 and p.StatusId = 5 AND h.RecepientTypeId = 1 and h.RecepientId = bkr.Id) rejected


GROUP BY bkr.Id,
		 bkr.Code,
		 bkr.[Name],
		 bkr.RegNo,
		 pending.Total ,
		 submitted.Total,
		 withheld.Total,
		 paid.Total,
		 rejected.Total

union all	 
select  
	2,
	'Juristic', 
	rep.Id,
	rep.Code,
	rep.SurnameOrCompanyName,
	rep.IdNumber,
	ISNULL(pending.Total,0) ,
	ISNULL(submitted.Total,0) ,
	ISNULL(withheld.Total,0),
	ISNULL(paid.Total,0),
	ISNULL(rejected.Total,0)
from policy.[Policy] (nolock) pol 
     inner join policy.PolicyBroker (nolock) pbr on pbr.PolicyId = pol.PolicyId	and pbr.JuristicRepId is not null								 
	 inner join broker.Representative (nolock) rep on rep.Id = pbr.JuristicRepId and rep.RepTypeId = 2
	 outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND  h.RecepientTypeId = 2 and h.RecepientId = rep.Id and h.[HeaderStatusId] = 1) pending
	 --outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND  h.RecepientTypeId = 2 and h.RecepientId = rep.Id and h.[HeaderStatusId] = 2) submitted
	 outer apply (select Total	= SUM(p.Amount) from commission.Header(NOLOCK) h inner join commission.PaymentInstruction (NOLOCK) p on p.HeaderId = h.HeaderId where h.IsDeleted = 0  and p.IsDeleted = 0 and p.StatusId = 2 AND h.RecepientTypeId = 2 and h.RecepientId = rep.Id) submitted
	 --outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND  h.RecepientTypeId = 2 and h.RecepientId = rep.Id and h.[HeaderStatusId] = 3) paid
	 outer apply (select Total	= SUM(p.Amount) from commission.Header(NOLOCK) h inner join commission.PaymentInstruction (NOLOCK) p on p.HeaderId = h.HeaderId where h.IsDeleted = 0  and p.IsDeleted = 0 and p.StatusId = 3 AND h.RecepientTypeId = 2 and h.RecepientId = rep.Id) paid
	 outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND h.RecepientTypeId = 2 and h.RecepientId = rep.Id and h.[HeaderStatusId] = 4) withheld
	 --outer apply (select Total	= SUM(TotalHeaderAmount) from commission.Header(NOLOCK) h where h.IsDeleted = 0 AND h.RecepientTypeId = 2 and h.RecepientId = rep.Id and h.[HeaderStatusId] = 5) rejected
	 outer apply (select Total	= SUM(p.Amount) from commission.Header(NOLOCK) h inner join commission.PaymentInstruction (NOLOCK) p on p.HeaderId = h.HeaderId where h.IsDeleted = 0  and p.IsDeleted = 0 and p.StatusId = 5 AND h.RecepientTypeId = 2 and h.RecepientId = rep.Id) rejected

	 
GROUP BY rep.Id,
		 rep.Code,
		 rep.SurnameOrCompanyName,
		 rep.IdNumber,
		 pending.Total ,
		 submitted.Total,
		 withheld.Total,
		 paid.Total,
		 rejected.Total

 select 
	DISTINCT
	Id,
	cav.AccountTypeId,
	AccountTypeName, -- Brokerage (1) or Juristic (2)
	cav.AccountId, -- BrokeRageId or RepresentativeId
	AccountCode, -- Code
	AccountName, --Name or SurnameOrCompanyName
	IdentificationNumber, -- RegNo or IdNumber

	TotalPendingRelease,
	TotalSubmitted,
	TotalWithHeld,
	TotalPaid,
	TotalRejected,
	ClawBackAccountBalance = AccountBalance
 
 from @commissionAccountsView cav
 inner join [commission].[ClawBackAccount] cba on cba.RecepientTypeId = cav.AccountTypeId
												AND cba.RecepientId = cav.AccountId
	
END
