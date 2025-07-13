--exec  [finance].[FinanceReconReportException] @StartDate='2020-11-10',@EndDate='2020-11-10'

CREATE   PROCEDURE [finance].[FinanceReconReportException]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN

	DECLARE @GroupPolicyIds TABLE ( PolicyId INT)
	DECLARE @IndividualPolicyIds TABLE ( PolicyId INT)
	
	DECLARE @GoldWage VARCHAR(10) = 'Goldwage';
	DECLARE @Individual VARCHAR(10) = 'Individual';
	DECLARE @GroupIndividual VARCHAR(10) = 'GroupIndividual';

	INSERT INTO @GroupPolicyIds
			SELECT Distinct PolicyId 
			FROM [policy].Policy p
			INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
			INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
			WHERE ct.Id IN (7,6,5,4) --Groups Ids

		INSERT INTO @IndividualPolicyIds
			SELECT  PolicyId 
			FROM [policy].Policy p
			INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
			INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
			WHERE ct.Id = 1 --Individual Ids
;WITH CTE AS (	
 		
	SELECT Distinct p.BatchReference,p.PaymentId AS ID,p.PolicyReference as [Policy NR],c.ClaimReferenceNumber as [Claim No],per.FirstName as Name,per.Surname,
		   ps.Name as [Status], p.Amount,fi.CoverAmount as Cover ,p.RejectionDate as [Date],
					 @Individual 
					AS Product,
				   p.CreatedDate,
				   p.SubmissionDate,p.PaymentConfirmationDate,p.ReconciliationDate,p.ModifiedDate,p.paymentStatusId
	FROM Payment.Payment p
	INNER JOIN common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
	INNER JOIN claim.Claim c ON p.ClaimId=c.ClaimId
	INNER JOIN claim.ClaimInvoice ci ON c.ClaimId=ci.ClaimId
	INNER JOIN claim.FuneralInvoice fi ON ci.ClaimInvoiceId=fi.ClaimInvoiceId
	INNER JOIN claim.PersonEvent pe ON c.PersonEventId=pe.PersonEventId
	INNER JOIN client.Person per ON pe.InsuredLifeId=per.RolePlayerId
	 WHERE  (CAST(p.CreatedDate as date)>=@StartDate AND CAST(p.CreatedDate as date) <=@EndDate)
		AND c.PolicyId IN (SELECT PolicyId FROM @IndividualPolicyIds)
			AND	Product = @Individual
UNION ALL
	SELECT Distinct  p.BatchReference,p.PaymentId AS ID,p.PolicyReference as [Policy NR],c.ClaimReferenceNumber as [Claim No],per.FirstName as Name,per.Surname,
		   ps.Name as [Status], p.Amount,fi.CoverAmount as Cover ,p.RejectionDate as [Date],
					 @Individual 
					AS Product,
				   p.CreatedDate,p.SubmissionDate,p.PaymentConfirmationDate,p.ReconciliationDate,p.ModifiedDate, p.paymentStatusId
	FROM Payment.Payment p
	INNER JOIN common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
	INNER JOIN claim.Claim c ON p.ClaimId=c.ClaimId
	INNER JOIN claim.ClaimInvoice ci ON c.ClaimId=ci.ClaimId
	INNER JOIN claim.FuneralInvoice fi ON ci.ClaimInvoiceId=fi.ClaimInvoiceId
	INNER JOIN claim.PersonEvent pe ON c.PersonEventId=pe.PersonEventId
	INNER JOIN client.Person per ON pe.InsuredLifeId=per.RolePlayerId
	 WHERE  (CAST(p.PaymentConfirmationDate as date)>=@StartDate AND CAST(p.PaymentConfirmationDate as date) <=@EndDate)
			AND CAST(p.CreatedDate as date) < CAST(p.PaymentConfirmationDate as date)
		AND c.PolicyId IN (SELECT PolicyId FROM @IndividualPolicyIds)
			AND	Product = @Individual
			
UNION ALL
	SELECT Distinct p.BatchReference,p.PaymentId AS ID,p.PolicyReference as [Policy NR],c.ClaimReferenceNumber as [Claim No],per.FirstName as Name,per.Surname,
	   ps.Name as [Status], p.Amount,fi.CoverAmount as Cover ,p.RejectionDate as [Date],
				 'Group'
			    AS Product,
			   p.CreatedDate,p.SubmissionDate,p.PaymentConfirmationDate,p.ReconciliationDate,p.ModifiedDate, p.paymentStatusId
	FROM Payment.Payment p
	INNER JOIN common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
	INNER JOIN claim.Claim c ON p.ClaimId=c.ClaimId
	INNER JOIN claim.ClaimInvoice ci ON c.ClaimId=ci.ClaimId
	INNER JOIN claim.FuneralInvoice fi ON ci.ClaimInvoiceId=fi.ClaimInvoiceId
	INNER JOIN claim.PersonEvent pe ON c.PersonEventId=pe.PersonEventId
	INNER JOIN client.Person per ON pe.InsuredLifeId=per.RolePlayerId
	 WHERE  (CAST(p.CreatedDate as date)>=@StartDate AND CAST(p.CreatedDate as date) <=@EndDate)
		AND c.PolicyId IN (SELECT PolicyId FROM @GroupPolicyIds)
		AND	Product <> (SELECT @GoldWage)
UNION ALL
	SELECT  p.BatchReference,p.PaymentId AS ID,p.PolicyReference as [Policy NR],c.ClaimReferenceNumber as [Claim No],per.FirstName as Name,per.Surname,
	   ps.Name as [Status], p.Amount,fi.CoverAmount as Cover ,p.RejectionDate as [Date],
				 'Group'
			    AS Product,
			   p.CreatedDate,p.SubmissionDate,p.PaymentConfirmationDate,p.ReconciliationDate,p.ModifiedDate, p.paymentStatusId
	FROM Payment.Payment p
	INNER JOIN common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
	INNER JOIN claim.Claim c ON p.ClaimId=c.ClaimId
	INNER JOIN claim.ClaimInvoice ci ON c.ClaimId=ci.ClaimId
	INNER JOIN claim.FuneralInvoice fi ON ci.ClaimInvoiceId=fi.ClaimInvoiceId
	INNER JOIN claim.PersonEvent pe ON c.PersonEventId=pe.PersonEventId
	INNER JOIN client.Person per ON pe.InsuredLifeId=per.RolePlayerId
	 WHERE  (CAST(p.PaymentConfirmationDate as date)>=@StartDate AND CAST(p.PaymentConfirmationDate as date) <=@EndDate)
		AND CAST(p.CreatedDate as date) < CAST(p.PaymentConfirmationDate as date)
		AND c.PolicyId IN (SELECT PolicyId FROM @GroupPolicyIds)
		AND	Product <> (SELECT @GoldWage)

UNION ALL
	SELECT Distinct p.BatchReference,p.PaymentId AS ID,p.PolicyReference as [Policy NR],c.ClaimReferenceNumber as [Claim No],per.FirstName as Name,per.Surname,
	   ps.Name as [Status], p.Amount,fi.CoverAmount as Cover ,p.RejectionDate as [Date],
				 @GoldWage
			    AS Product,
			   p.CreatedDate,p.SubmissionDate,p.PaymentConfirmationDate,p.ReconciliationDate,p.ModifiedDate,p.paymentStatusId
	FROM Payment.Payment p
	INNER JOIN common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
	INNER JOIN claim.Claim c ON p.ClaimId=c.ClaimId
	INNER JOIN claim.ClaimInvoice ci ON c.ClaimId=ci.ClaimId
	INNER JOIN claim.FuneralInvoice fi ON ci.ClaimInvoiceId=fi.ClaimInvoiceId
	INNER JOIN claim.PersonEvent pe ON c.PersonEventId=pe.PersonEventId
	INNER JOIN client.Person per ON pe.InsuredLifeId=per.RolePlayerId
	 WHERE  (CAST(p.CreatedDate as date)>=@StartDate AND CAST(p.CreatedDate as date) <=@EndDate)
			 AND Product = (SELECT @GoldWage)  
UNION ALL
	SELECT Distinct  p.BatchReference,p.PaymentId AS ID,p.PolicyReference as [Policy NR],c.ClaimReferenceNumber as [Claim No],per.FirstName as Name,per.Surname,
	   ps.Name as [Status], p.Amount,fi.CoverAmount as Cover ,p.RejectionDate as [Date],
				 @GoldWage
			    AS Product,
			   p.CreatedDate,p.SubmissionDate,p.PaymentConfirmationDate,p.ReconciliationDate,p.ModifiedDate, p.paymentStatusId
	FROM Payment.Payment p
	INNER JOIN common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
	INNER JOIN claim.Claim c ON p.ClaimId=c.ClaimId
	INNER JOIN claim.ClaimInvoice ci ON c.ClaimId=ci.ClaimId
	INNER JOIN claim.FuneralInvoice fi ON ci.ClaimInvoiceId=fi.ClaimInvoiceId
	INNER JOIN claim.PersonEvent pe ON c.PersonEventId=pe.PersonEventId
	INNER JOIN client.Person per ON pe.InsuredLifeId=per.RolePlayerId
	 WHERE  (CAST(p.PaymentConfirmationDate as date)>=@StartDate AND CAST(p.PaymentConfirmationDate as date) <=@EndDate)
			AND CAST(p.CreatedDate as date) < CAST(p.PaymentConfirmationDate as date)
			 AND Product = (SELECT @GoldWage)  
   )   

SELECT Distinct BatchReference,
	   ID,
	   [Policy NR],
	   [Claim No],
	   Name,
	   Surname,
	   Status, 
	   Amount, 
	   Cover ,
	   Date,
	   Product ,
	   SubmissionDate,
	   PaymentConfirmationDate,
	   ReconciliationDate,
	   CreatedDate,
	   ModifiedDate,
	   PaymentStatusId
FROM CTE
WHERE    (DATEDIFF(DAY,@StartDate,CAST(SubmissionDate as date))> 0 OR SubmissionDate IS NULL) OR
	       (DATEDIFF(DAY,@StartDate,CAST(PaymentConfirmationDate as date))> 0 OR PaymentConfirmationDate IS NULL) OR
		    (DATEDIFF(DAY,@StartDate,CAST(ReconciliationDate as date))> 0 OR ReconciliationDate IS NULL) AND
				(DATEDIFF(DAY,@EndDate,CAST(PaymentConfirmationDate as date)) = 0 
	AND CAST(CreatedDate as date) < CAST(PaymentConfirmationDate as date))
--UNION ALL
--	SELECT Distinct PolicyId, BatchReference,
--	   ID,
--	   [Policy NR],
--	   [Claim No],
--	   Name,
--	   Surname,
--	   Status, 
--	   Amount, 
--	   Cover ,
--	   Date,
--	   Product ,
--	   SubmissionDate,
--	   PaymentConfirmationDate,
--	   ReconciliationDate,
--	   CreatedDate,
--	   ModifiedDate,
--	   PaymentStatusId
--FROM CTE
--WHERE	DATEDIFF(DAY,@EndDate,CAST(PaymentConfirmationDate as date)) = 0 
--	AND CAST(CreatedDate as date) < CAST(PaymentConfirmationDate as date)
		
			
END

