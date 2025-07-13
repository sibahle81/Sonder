

CREATE  PROCEDURE [pension].[GetOutstandingOverpayment]
				@PageIndex	INT = 1,
				@PageSize	INT = 5,
				@recordCount INT = 0 OUTPUT,
				@FromDate	DATETIME  = NULL,
				@ToDate		DATETIME = NULL
AS
BEGIN

select distinct sum([Amount]) as TotalAmountRecovered, [PersonId] ,Status 
   into ##OutStandingOverPaymentsTotals 
  FROM [pension].[OutstandingOverpayments]
  group by [PersonId],[Status]
  --having [Status] in (2)

If (@FromDate  is Null or @ToDate  is Null)
                begin				
                    Set @FromDate= (SELECT MIN(CreatedDate) FROM  [pension].[OutstandingOverpayments])
					Set @ToDate=GETDATE()
                end                            
  select distinct lg.PensionLedgerId [LedgerId],
    rec.PensionRecipientId,
	op.[Id] [OutstandingOverpaymentId],
	per.FirstName + ' '+per.Surname [DeceasedNames],
	per.DateOfDeath,
	per.[RolePlayerId],
	lg.LastPaymentDate,
	lg.NormalMonthlyPension,
	rpt.TotalAmount [OverpaymentAmount],
	op.[Status],
	tmp.TotalAmountRecovered [AmountRecovered], 	
	CASE
    WHEN op.[Status]=2 or op.[Status]=1 THEN 0.00
    ELSE ow.Amount
END [WriteOffAmount],
	CASE
    WHEN op.[Status]=3 THEN 0.00
    ELSE (rpt.TotalAmount-tmp.TotalAmountRecovered)
END [OverpaymentBalanceAmount]
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
left join [pension].[OverPaymentsWriteOff] ow
on op.Id = ow.OverPaymentId

where op.CreatedDate BETWEEN @FromDate  AND @ToDate

DROP TABLE dbo.##OutStandingOverPaymentsTotals

END