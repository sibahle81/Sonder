CREATE PROCEDURE [billing].[PaymentAudit]
	@PaymentId AS INT
AS 
BEGIN  

SELECT 
CASE
	WHEN [AUDIT].[Action] = 'Added' THEN JSON_VALUE(NewItem,'$.ModifiedBy') + ' captured a ' + [TYPE].Name + ' payment of R' + JSON_VALUE(NewItem,'$.Amount') + ', to be paid into ' + JSON_VALUE(NewItem,'$.Payee') + '''s ' + JSON_VALUE(NewItem,'$.Bank') + '(' + JSON_VALUE(NewItem,'$.BankBranch') + ') account number(' + JSON_VALUE(NewItem,'$.AccountNo') + ') on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)
	WHEN [AUDIT].[Action] = 'Modified' AND [STATUS].Name = 'Pending' THEN JSON_VALUE(NewItem,'$.ModifiedBy') + ' received the ' + [TYPE].Name + ' payment request on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.CreatedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.CreatedDate'), 108) + ' and approved the payment on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)
	
	WHEN [AUDIT].[Action] = 'Modified' AND [STATUS].Name = 'Queued' THEN JSON_VALUE(NewItem,'$.ModifiedBy') + ' queued the payment on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.CreatedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.CreatedDate'), 108) + '. The system picked up the queued payment on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)
	WHEN [AUDIT].[Action] = 'Modified' AND [STATUS].Name = 'Submitted' THEN 'The system submitted the queued ' + [TYPE].Name + ' payment to the bank for processing and set the payment status to Submitted on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)
	
	WHEN [AUDIT].[Action] = 'Modified' AND [STATUS].Name = 'Paid' THEN 'The system received the bank response on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.CreatedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.CreatedDate'), 108) + ' and set the payment status to paid on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)
	WHEN [AUDIT].[Action] = 'Modified' AND [STATUS].Name = 'Rejected' THEN 'The ' + [TYPE].Name + ' payment was rejected by the bank on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.RejectionDate'), 109) + ' because a ' + JSON_VALUE(NewItem,'$.ErrorCode') + ' error occurred, with the description ''' + JSON_VALUE(NewItem,'$.ErrorDescription') + ''', and set the payment status to rejected on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)

	WHEN [AUDIT].[Action] = 'Modified' AND [STATUS].Name = 'Reconciled' THEN JSON_VALUE(NewItem,'$.ModifiedBy') + ' reconsiled the payment and set the payment status to reconsiled on ' + CONVERT(VARCHAR(10), JSON_VALUE(NewItem,'$.ModifiedDate'), 109) + ' at ' + CONVERT(VARCHAR, JSON_VALUE(NewItem,'$.ModifiedDate'), 108)
	
	ELSE 'NO STORY HAS BEEN ADDED FOR THIS PAYMENT STATUS...'+ [STATUS].Name
END AS Audit_Text
FROM [audit].[AuditLog] [AUDIT]
	INNER JOIN [common].[PaymentStatus] [STATUS] ON [STATUS].Id = JSON_VALUE(NewItem,'$.PaymentStatusId')
	INNER JOIN [common].[PaymentType] [TYPE] ON [TYPE].Id = JSON_VALUE(NewItem,'$.PaymentTypeId')
WHERE [AUDIT].[ItemType] = 'payment_Payment' 
    AND JSON_VALUE(NewItem,'$.PaymentId') = @PaymentId
	AND JSON_VALUE(NewItem,'$.PaymentStatusId') IS NOT NULL
	AND [AUDIT].[Action] <> 'update'
ORDER BY JSON_VALUE(NewItem,'$.ModifiedDate')

END 
