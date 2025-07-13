CREATE PROCEDURE [billing].[RefundDashboardDetails]
 AS
  BEGIN  
	SELECT 
		[HEADER].CreatedDate,
		[ACCOUNT].FinpayeNumber,
		[HEADER].Reason,
		[PAYMENT].SubmissionDate,
		[PAYMENT].PaymentConfirmationDate,
		[STATUS].Name,
		[HEADER].HeaderTotalAmount
	FROM [billing].[RefundHeader] [HEADER]
		INNER JOIN [client].Finpayee [ACCOUNT] ON [ACCOUNT].RolePlayerId = [HEADER].RolePlayerId
		INNER JOIN [payment].Payment [PAYMENT] ON [PAYMENT].RefundHeaderId = [HEADER].RefundHeaderId
		INNER JOIN [common].PaymentStatus [STATUS] ON [STATUS].Id = [PAYMENT].PaymentStatusId
	WHERE YEAR([HEADER].CreatedDate) = YEAR(GetDate())
  END