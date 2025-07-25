CREATE PROCEDURE [billing].[CommisionTransactionReportBrokerageDetails] 
	@headerId int
AS
/*
	exec  billing.CommisionTransactionReportBrokerageDetails   	@headerId = 19
*/
Begin
SELECT TOP 1 
h.RecepientName,
h.RecepientCode,
h.TotalHeaderAmount,
CurrentClawBackBalance = ISNULL(claw.ClawBackAmount,0), 
AvailableAmount = CASE WHEN (h.TotalHeaderAmount  + ISNULL(claw.ClawBackAmount,0)) < 1 THEN 0 ELSE (h.TotalHeaderAmount  + ISNULL(claw.ClawBackAmount,0)) END
FROM	commission.Header h (NOLOCK)
OUTER APPLY ( SELECT TOP 1 ClawBackAmount = CurrentClawBackBalance from commission.ClawBackAccountMovement cb where cb.IsDeleted = 0 AND cb.headerId = H.HeaderId ORDER BY ClawBackAccountMovementId DESC) claw
OUTER APPLY ( SELECT Amount = SUM(p.Amount)from commission.PaymentInstruction p where p.IsDeleted = 0 AND  p.headerId = h.HeaderId) instruction
WHERE  (h.HeaderId = @headerId) AND h.IsDeleted = 0 
END
