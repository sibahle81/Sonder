
CREATE PROCEDURE [pension].[PaymentScheduleYTDReport]
			
	
AS
BEGIN
	
	SET NOCOUNT ON;

    
	SELECT        common.PaymentStatus.Name AS [Payment Status], common.PaymentMethod.Name AS [Payment Method],sum(payment.Payment.Amount) as 'Amount'
FROM            common.PaymentStatus INNER JOIN
                         payment.Payment ON common.PaymentStatus.Id = payment.Payment.PaymentStatusId INNER JOIN
                         policy.Policy ON payment.Payment.PolicyId = policy.Policy.PolicyId INNER JOIN
                         common.PaymentMethod ON policy.Policy.PaymentMethodId = common.PaymentMethod.Id AND policy.Policy.PaymentMethodId = common.PaymentMethod.Id
						 WHERE CAST(payment.CreatedDate AS DATE) BETWEEN CAST(DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0)  AS DATE) AND CAST(getdate() AS DATE)
						 group by common.PaymentMethod.Name, common.PaymentStatus.Name

						 
END