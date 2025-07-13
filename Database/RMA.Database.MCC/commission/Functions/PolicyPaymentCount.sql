CREATE FUNCTION [commission].[PolicyPaymentCount] (@PolicyNumber varchar(50))
	RETURNS INT
AS
BEGIN
    DECLARE @PaymentCount INT;
	
	SELECT @PaymentCount = SUM(PaymentCount) FROM
	(
		SELECT PaymentCount
		FROM policy.Policy pol
		OUTER APPLY (
			SELECT PaymentCount = COUNT(1)
			FROM billing.Transactions bt (NOLOCK)  
			LEFT JOIN finance.BankStatementEntry (NOLOCK) bse ON bse.BankStatementEntryId = bt.BankStatementEntryId		
			LEFT JOIN billing.Invoice inv (NOLOCK) ON inv.InvoiceId = bt.InvoiceId 
			WHERE bt.TransactionTypeId = 3 AND bse.UserReference = @PolicyNumber AND inv.PolicyId IS NULL
		) PaymentCount
		WHERE pol.PolicyNumber = @PolicyNumber
		UNION
		SELECT PaymentCount
		FROM policy.Policy pol
		OUTER APPLY (
			SELECT PaymentCount = COUNT(1)
			FROM billing.Transactions bt (NOLOCK)  
			INNER JOIN finance.BankStatementEntry (NOLOCK) bse ON bse.BankStatementEntryId = bt.BankStatementEntryId		
			LEFT JOIN billing.Invoice inv (NOLOCK) ON inv.InvoiceId = bt.InvoiceId 
			WHERE inv.PolicyId = pol.PolicyId AND bt.TransactionTypeId = 3
		) PaymentCount
		WHERE pol.PolicyNumber = @PolicyNumber
	) innerCount


    RETURN @PaymentCount;
END;
