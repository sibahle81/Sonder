CREATE PROCEDURE [payment].[UnsuccessfulPaymentReport]
	@PaymentTypeId INT,
	@CreateDateFrom DATETIME,
	@CreateDateTo DATETIME
AS
BEGIN 
/*
select * from payment.Payment where paymenttypeid = 1
exec [payment].[UnsuccessfulPaymentReport] @PaymentTypeId = 1, @CreateDateFrom = '2020-01-01', @CreateDateTo = '2022-12-31'

*/
	SELECT p.PaymentId as Id, 
		   p.PolicyReference, 
		   p.ClaimReference,
		   p.BrokerCode, 
		   p.BrokerName, 
		   p.Payee, 
		   (SELECT [Name] FROM [common].[PaymentStatus] WHERE Id = JSON_VALUE(a.NewItem, '$.PaymentStatus')) AS PaymentStatus, 
		   CAST(JSON_VALUE(a.NewItem, '$.Amount') AS money) AS Amount, 
		   JSON_VALUE(a.NewItem, '$.ErrorDescription') AS ErrorDescription, 
		   CAST(JSON_VALUE(a.NewItem, '$.RejectionDate') AS datetime2) AS RejectionDate
	FROM [payment].[Payment] p
		INNER JOIN[payment].[AuditLog] a ON p.PaymentId = a.ItemId
	WHERE ISJSON(a.OldItem)  > 0 
		AND JSON_VALUE(a.NewItem, '$.RejectionDate') IS NOT NULL
		AND JSON_VALUE(a.NewItem, '$.RejectionType') IS NOT NULL
		AND JSON_VALUE(a.NewItem, '$.PaymentStatus') IN ('4')
		AND p.PaymentTypeId = @PaymentTypeId
		AND p.CreatedDate BETWEEN @CreateDateFrom AND @CreateDateTo
	ORDER BY JSON_VALUE(a.NewItem, '$.RejectionDate') DESC
END
