
--exec  [finance].[FinanceBankReconReport] @StartDate='2022-01-11',@EndDate='2022-08-22'
CREATE    PROCEDURE [finance].[FinanceBankReconReport]
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
			SELECT PolicyId 
			FROM [policy].Policy p
			INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
			INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
			WHERE ct.Id IN (7,6,5,4) --Groups Ids

	INSERT INTO @IndividualPolicyIds
		SELECT PolicyId 
		FROM [policy].Policy p
		INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
		INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
		WHERE ct.Id = 1 --Individual Ids
 		
;WITH CTE AS(
	
	SELECT PaymentId AS ID, 
		   'Individual' as Product,
		    AccountNo as Account,
		    ReconciliationDate as Batch_Date,
			case WHEN  BATCHREFERENCE IS NULL
				THEN 'Not yet submitted'
				ELSE  BATCHREFERENCE
				END AS BATCHREFERENCE, 
			REFERENCE,
			p.PaymentConfirmationDate as Confirmation_Date,
			' ' as Bank_Statement,
			' ' as Ability,
			--Amount as [Approved Payments],
			CASE
					WHEN  DATEDIFF(day,CAST(p.CreatedDate AS date),CAST(p.SubmissionDate AS date))=0
					THEN p.Amount
						ELSE 0
			END AS [Approved Payments],
			CASE
					WHEN  DATEDIFF(day,CAST(p.SubmissionDate AS date),CAST(p.CreatedDate AS date))=0
					THEN p.Amount
						ELSE 0
			END AS [Bank Submissions],
			CASE
				WHEN  DATEDIFF(day,CAST(p.PaymentConfirmationDate AS date),CAST(p.CreatedDate AS date))=0
					THEN p.Amount
					ELSE 0
			END AS [Paid Payments],
			CASE
				WHEN  DATEDIFF(day,CAST(p.ReconciliationDate AS date),CAST(p.CreatedDate AS date))=0
						THEN p.Amount
						ELSE 0
				END AS [Reconciled and Posted on GL]	
	FROM payment .payment  p
	WHERE   (CAST(CreatedDate as date)>=@StartDate 
		AND CAST(CreatedDate as date) <=@EndDate)
		AND PolicyId IN (SELECT PolicyId FROM @IndividualPolicyIds)
		AND	Product = @Individual
UNION ALL
		SELECT PaymentId AS ID, 
		   'Individual' as Product,
		    AccountNo as Account,
		    ReconciliationDate as Batch_Date,
			case WHEN  BATCHREFERENCE IS NULL
				THEN 'Not yet submitted'
				ELSE  BATCHREFERENCE
				END AS BATCHREFERENCE, 
			REFERENCE,
			p.PaymentConfirmationDate as Confirmation_Date,
			' ' as Bank_Statement,
			' ' as Ability,
		    0 as [Approved Payments],
			Amount as [Bank Submissions],
			Amount as [Paid Payments],
			Amount [Reconciled and Posted on GL]	
	FROM payment .payment  p
	WHERE   (CAST(PaymentConfirmationDate as date) >= @StartDate 
		AND CAST(PaymentConfirmationDate as date) <=@EndDate)
		AND CAST(CreatedDate as date) < CAST(PaymentConfirmationDate as date)
		AND PolicyId IN (SELECT PolicyId FROM @IndividualPolicyIds)
		AND	Product = @Individual
UNION ALL
	SELECT PaymentId AS ID, 
		   'Group' as Product,
			AccountNo as Account,
			ReconciliationDate as Batch_Date,
			case WHEN  BATCHREFERENCE IS NULL
				THEN 'Not yet submitted'
				ELSE  BATCHREFERENCE
				END AS BATCHREFERENCE, 
			REFERENCE,
			p.PaymentConfirmationDate as Confirmation_Date,
			' ' as Bank_Statement,
			' ' as Ability,
			--Amount as [Approved Payments],
			CASE
					WHEN  DATEDIFF(day,CAST(p.CreatedDate AS date),CAST(p.SubmissionDate AS date))=0
					THEN p.Amount
						ELSE 0
			END AS [Approved Payments],
			CASE
					WHEN  DATEDIFF(day,CAST(p.SubmissionDate AS date),CAST(p.CreatedDate AS date))=0
					THEN p.Amount
						ELSE 0
			END AS [Bank Submissions],
			CASE
				WHEN  DATEDIFF(day,CAST(p.PaymentConfirmationDate AS date),CAST(p.CreatedDate AS date))=0
					THEN p.Amount
					ELSE 0
			END AS [Paid Payments],
			CASE
				WHEN  DATEDIFF(day,CAST(p.ReconciliationDate AS date),CAST(p.CreatedDate AS date))=0
						THEN p.Amount
						ELSE 0
				END AS [Reconciled and Posted on GL]	
	FROM payment .payment  p
	WHERE   (CAST(CreatedDate as date)>=@StartDate 
		AND CAST(CreatedDate as date) <=@EndDate)
		AND PolicyId IN (SELECT PolicyId FROM @GroupPolicyIds)
		AND	Product <> (SELECT @GoldWage)
UNION ALL
		SELECT PaymentId AS ID, 
		   'Group' as Product,
		    AccountNo as Account,
		    ReconciliationDate as Batch_Date,
			case WHEN  BATCHREFERENCE IS NULL
				THEN 'Not yet submitted'
				ELSE  BATCHREFERENCE
				END AS BATCHREFERENCE, 
			REFERENCE,
			p.PaymentConfirmationDate as Confirmation_Date,
			' ' as Bank_Statement,
			' ' as Ability,
		    0 as [Approved Payments],
			Case When DATEDIFF(day,CAST(p.SubmissionDate AS date),CAST(p.CreatedDate AS date))=0 AND DATEDIFF(day,CAST(p.SubmissionDate AS date),CAST(p.PaymentConfirmationDate AS date))!=0 Then 0
			ELSE
			Amount END as [Bank Submissions] ,		--As per discussion with Marcus dated - 2020/Nov/26 - added the condition for [Bank Submissions]
			--Amount as [Bank Submissions],
			Amount as [Paid Payments],
			Amount [Reconciled and Posted on GL]	
	FROM payment .payment  p
	WHERE   (CAST(PaymentConfirmationDate as date) >= @StartDate 
		AND CAST(PaymentConfirmationDate as date) <=@EndDate)
		AND CAST(CreatedDate as date) < CAST(PaymentConfirmationDate as date)
		AND PolicyId IN (SELECT PolicyId FROM @GroupPolicyIds)
		AND	Product <> (SELECT @GoldWage)
UNION ALL
	SELECT PaymentId AS ID, 
		   'GoldWage' as Product,
		    AccountNo as Account,
		    ReconciliationDate as Batch_Date,
			case WHEN  BATCHREFERENCE IS NULL
				THEN 'Not yet submitted'
				ELSE  BATCHREFERENCE
				END AS BATCHREFERENCE, 
			REFERENCE,
			p.PaymentConfirmationDate as Confirmation_Date,
			' ' as Bank_Statement,
			' ' as Ability,
		   --Amount as [Approved Payments],
		   CASE
					WHEN  DATEDIFF(day,CAST(p.CreatedDate AS date),CAST(p.SubmissionDate AS date))=0
					THEN p.Amount
						ELSE 0
			END AS [Approved Payments],
			CASE
					WHEN  DATEDIFF(day,CAST(p.SubmissionDate AS date),CAST(p.CreatedDate AS date))=0
					THEN p.Amount
						ELSE 0
			END AS [Bank Submissions],
			CASE
				WHEN  DATEDIFF(day,CAST(p.PaymentConfirmationDate AS date),CAST(p.CreatedDate AS date))=0
					THEN p.Amount
					ELSE 0
			END AS [Paid Payments],
			CASE
				WHEN  DATEDIFF(day,CAST(p.ReconciliationDate AS date),CAST(p.CreatedDate AS date))=0
						THEN p.Amount
						ELSE 0
				END AS [Reconciled and Posted on GL]	
	FROM payment .payment  p
	WHERE   CAST(CreatedDate as date)>=@StartDate 
		AND CAST(CreatedDate as date) <=@EndDate
		AND	Product = (SELECT @GoldWage)
UNION ALL
			SELECT PaymentId AS ID, 
			   'GoldWage' as Product,
			    AccountNo as Account,
		        ReconciliationDate as Batch_Date,
				case WHEN  BATCHREFERENCE IS NULL
					THEN 'Not yet submitted'
					ELSE  BATCHREFERENCE
					END AS BATCHREFERENCE, 
				REFERENCE,
				p.PaymentConfirmationDate as Confirmation_Date,
				' ' as Bank_Statement,
				' ' as Ability,
				0 as [Approved Payments],
				Amount as [Bank Submissions],
				Amount as [Paid Payments],
				Amount [Reconciled and Posted on GL]	
		FROM payment .payment  p
		WHERE   (CAST(PaymentConfirmationDate as date) >= @StartDate 
			AND CAST(PaymentConfirmationDate as date) <=@EndDate)
			AND CAST(CreatedDate as date) < CAST(PaymentConfirmationDate as date)
			AND	Product = (SELECT @GoldWage)
) 

SELECT ID,
       Account,
	   Batch_Date,
	   BatchReference,
	   Confirmation_Date,
	   Bank_Statement,
	   Ability,
	   [Approved Payments],
	   [Bank Submissions],
	   [Paid Payments],
	   [Reconciled and Posted on GL],
	   Case When ([Reconciled and Posted on GL] > 0 AND [Approved Payments] = 0) Then 0
	   When ([Approved Payments] > 0 AND [Approved Payments] = [Reconciled and Posted on GL]) Then 0
	   Else ABS([Approved Payments]-[Reconciled and Posted on GL]) End AS VARIANCE ,
	   --ABS([Approved Payments]-[Reconciled and Posted on GL]) AS VARIANCE,				--As per discussion with Marcus dated - 2020/Nov/26 - added the condition for Variance
	   Product
FROM CTE 
/*GROUP BY ID,Account,Batch_Date,BatchReference,
			[Approved Payments],
			[Bank Submissions],
			[Paid Payments],
			[Reconciled and Posted on GL],
			Product */
ORDER BY Product,BatchReference ASC

END