


CREATE     PROCEDURE [pension].[GetOverpayments]
				@FromDate	DATETIME,
				@ToDate		DATETIME
AS
BEGIN
select distinct sum([Amount]) as TotalAmountRecovered, [PersonId]  
   into ##OutStandingOverPaymentsTotals
  FROM [pension].[OutstandingOverpayments]
  group by [PersonId]
select distinct lg.PensionLedgerId [LedgerId],
	per.FirstName + ' '+per.Surname [DeceasedNames],
	per.DateOfDeath,
	lg.LastPaymentDate,
	lg.NormalMonthlyPension,
	rpt.TotalAmount [OverpaymentAmount],
	tmp.TotalAmountRecovered [AmountRecovered], 
	rpt.TotalAmount - tmp.TotalAmountRecovered [WriteOffAmount],
	per.RolePlayerId
from [pension].[OutstandingOverpayments] op
inner join [pension].[Ledger] lg
on op.LedgerID = lg.PensionLedgerId
inner join [pension].[PensionClaimMap] cm
on cm.PensionClaimMapId = lg.PensionClaimMapId
inner join [pension].[PensionRecipient] rec
on cm.PensionClaimMapId = rec.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = rec.PersonId
inner join [pension].[RolePlayerPensionTransaction] rpt
on rpt.RolePlayerId = per.RolePlayerId
inner join ##OutStandingOverPaymentsTotals tmp 
on tmp.[PersonId] = per.RolePlayerId
and cm.IsDeleted=0
where CAST(op.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
END