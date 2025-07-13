
CREATE PROCEDURE [commission].[UpfrontCommCalcPolicy]
AS

EXECUTE commission.SP_UpfrontCommCalc 1;

/* REPORT 1   Get Policy Level Comm for all polcicies */
select BrokerName,BrokerRepID, PC.PolicyNumber, PC.CommReason,PC.CommissionablePremium, PC.CommDue,PC.CommRetention, PC.CalcDate, Pc.Paydate, PC.PolicyInceptionDate,PI.PolicyCaptureDate,PC.CommStatus,PC.PaymentBatch 
from commission.PolicyCommission PC
left join (select distinct policynumber, BrokerName, BrokerRepID, max(PolicyCaptureDate) as PolicyCaptureDate from commission.PolicyImport group by policynumber, BrokerName, BrokerRepID) PI on PI.policynumber=PC.PolicyNumber
where CommReason like '% Primary Commission' 
order by  PC.policynumber