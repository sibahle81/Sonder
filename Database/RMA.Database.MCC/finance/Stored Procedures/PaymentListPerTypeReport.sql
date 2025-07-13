--exec [finance].[PaymentListPerTypeReport] @paymentType='GoldWage',@StartDate='2020-01-21',@EndDate='2020-05-21'
/*************************************************************************/
-- ModifedBy: Sibahle Senda
-- Modified Date: 2024/10/04
-- Change: Added All option to get all payments within specific date range
/*************************************************************************/

CREATE PROCEDURE  [finance].[PaymentListPerTypeReport]
	
	 @PaymentType varchar(20),
	 @StartDate As Date,
	 @EndDate AS Date


AS

BEGIN
    DECLARE @Payments TABLE(
                        [Transaction Date] Date, PaymentConfirmationDate Date, [Transaction Reference] varchar(200), [Transaction Type] varchar (50), Amount money
                       )
	DECLARE @GetAllPayments bit = 0
	IF (@PaymentType = -1)
	BEGIN
	   SET @GetAllPayments = 1
	END

	SET @PaymentType=(SELECT CASE WHEN @PaymentType='Group'
							  THEN   'GroupIndividual'
							  WHEN @PaymentType='Individual'
							  Then 'Individual'
							  ELSE
								@PaymentType
							  END)



	IF(@PaymentType='Refunds' OR @PaymentType='Commissions' OR @GetAllPayments = 1)
		BEGIN
			SET @PaymentType=(SELECT CASE WHEN @PaymentType='Refunds'
							  THEN   'Refund'
							  WHEN @PaymentType='Commissions'
							  THEN   'Commission'
							  END)
			insert @Payments
			SELECT CreatedDate AS [Transaction Date],
					PaymentConfirmationDate,
					Reference AS [Transaction Reference],
				CASE WHEN pt.name IS NULL 
					THEN 'Uknown'
					ELSE pt.name
				END as [Transaction Type],
				Amount
			from payment.payment p
			INNER JOIN  Common.PaymentType pt ON p.PaymentTypeId=pt.Id
			INNER JOIN Common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
			LEFT JOIN common.ClaimType ct On ct.ID= p.ClaimTypeId
			WHERE CAST(PaymentConfirmationDate AS DATE)>=@StartDate AND  CAST(PaymentConfirmationDate AS DATE)<=@EndDate  AND 
			(pt.Name='Refund' or pt.Name='Commission')
			order by pt.name
		END
	IF(@PaymentType='GoldWage' OR @GetAllPayments = 1)
		BEGIN
		    insert @Payments
			SELECT CreatedDate AS [Transaction Date],
					PaymentConfirmationDate,
					Reference AS [Transaction Reference],
			CASE WHEN pt.name IS NULL 
					THEN 'Uknown'
					ELSE 'GoldWage'
			END as [Transaction Type],
			Amount
			from payment.payment p
			INNER JOIN  Common.PaymentType pt ON p.PaymentTypeId=pt.Id
			INNER JOIN Common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
			LEFT JOIN common.ClaimType ct On ct.ID= p.ClaimTypeId
			WHERE CAST(PaymentConfirmationDate AS DATE)>=@StartDate AND  CAST(PaymentConfirmationDate AS DATE)<=@EndDate  AND 
			p.SenderAccountNo='62576026530'
			order by pt.name 
			END
 	IF(@PaymentType='GroupIndividual' OR @GetAllPayments = 1)
	   BEGIN
		DECLARE @GroupPolicyIds TABLE (
					PolicyId INT
				)

		INSERT INTO @GroupPolicyIds
			SELECT PolicyId 
			FROM [policy].Policy p
			INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
			INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
			WHERE ct.Id IN (4,5) --Groups Ids
			
			insert @Payments
			SELECT CreatedDate AS [Transaction Date],
					PaymentConfirmationDate,
					Reference AS [Transaction Reference],
			'Group' as [Transaction Type],
			Amount
			from payment.payment p
			INNER JOIN  Common.PaymentType pt ON p.PaymentTypeId=pt.Id
			INNER JOIN Common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
			LEFT JOIN common.ClaimType ct On ct.ID= p.ClaimTypeId
			WHERE CAST(PaymentConfirmationDate AS DATE)>=@StartDate 
				 AND  CAST(PaymentConfirmationDate AS DATE)<=@EndDate  
				 AND p.PolicyId IN (SELECT PolicyId FROM @GroupPolicyIds)
				 AND
					p.product <> '62576026530'
			order by pt.name 
	 END

	 IF(@PaymentType='Individual'  OR @GetAllPayments = 1)
	   BEGIN
			DECLARE @IndividualPolicyIds TABLE (
				PolicyId INT
			)

		 INSERT INTO @IndividualPolicyIds
			SELECT PolicyId 
			FROM [policy].Policy p
			INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
			INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
			WHERE ct.Id = 1 --Individual Ids

			insert @Payments
			SELECT CreatedDate AS [Transaction Date],
					PaymentConfirmationDate,
					Reference AS [Transaction Reference],
					'Individual' AS [Transaction Type],
					Amount
			from payment.payment p
			INNER JOIN  Common.PaymentType pt ON p.PaymentTypeId=pt.Id
			INNER JOIN Common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
			LEFT JOIN common.ClaimType ct On ct.ID= p.ClaimTypeId
			WHERE CAST(PaymentConfirmationDate AS DATE)>=@StartDate 
				AND  CAST(PaymentConfirmationDate AS DATE)<=@EndDate  
			    AND (p.Product='Individual')
				AND	p.PolicyId IN (SELECT PolicyId FROM @IndividualPolicyIds)
			order by pt.name 
	 END

	 IF(@PaymentType='Corporate' OR @GetAllPayments = 1)
	   BEGIN
			DECLARE @CorporatePolicyIds TABLE (
					PolicyId INT
				)

			INSERT INTO @CorporatePolicyIds
				SELECT PolicyId 
				FROM [policy].Policy p
				INNER JOIN [product].[ProductOptionCoverType] poc ON p.ProductOptionId = poc.ProductOptionId
				INNER JOIN [common].CoverType ct on poc.CoverTypeId = ct.Id
				WHERE ct.Id IN (6,7) --Groups Ids
			
			insert @Payments
			SELECT CreatedDate AS [Transaction Date],
					PaymentConfirmationDate,
					Reference AS [Transaction Reference],
					'Corporate' as [Transaction Type],
					Amount
			from payment.payment p
			INNER JOIN  Common.PaymentType pt ON p.PaymentTypeId=pt.Id
			INNER JOIN Common.PaymentStatus ps ON p.PaymentStatusId=ps.Id
			LEFT JOIN common.ClaimType ct On ct.ID= p.ClaimTypeId
			WHERE CAST(PaymentConfirmationDate AS DATE)>=@StartDate AND  
				CAST(PaymentConfirmationDate AS DATE)<=@EndDate 
				AND	p.PolicyId IN (SELECT PolicyId FROM @CorporatePolicyIds) 
				AND
					p.SenderAccountNo <> '62576026530'
			order by pt.name 
	 END

	 SELECT distinct * FROM @Payments
END
