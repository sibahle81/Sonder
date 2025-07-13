--exec  [finance].[RecoveryReport] @StartDate='2020-08-01',@EndDate='2020-11-17'
CREATE   PROCEDURE [finance].[RecoveryReport]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN
	 		
	SELECT DISTINCT  ClaimRecoveryId as TranId, Product as TranType, cr.ClaimNumber as [Claim No] ,cr.Name as [Name],Product as [Policy Type],crr.Name as [Recovery Reason]
		,cri.Amount as [Recovery Amount],cr.CreatedDate as[Recovery Date],cr.RecoveryInvokedBy as [Recovery By],cr.ModifiedBy AS [Authorised By]
	FROM payment.payment p
	INNER JOIN  [claim].[ClaimsRecovery] cr ON p.ClaimId=cr.ClaimId
	INNER JOIN [billing].[ClaimRecoveryInvoice] cri ON cri.ClaimId=cr.ClaimId
	INNER JOIN [common].[ClaimRecoveryReason] crr ON cr.RecoveryReasonId=crr.Id
	WHERE CONVERT(DATE, cri.CreatedDate)>=@StartDate and CONVERT(DATE, cri.CreatedDate)<=@EndDate
END
