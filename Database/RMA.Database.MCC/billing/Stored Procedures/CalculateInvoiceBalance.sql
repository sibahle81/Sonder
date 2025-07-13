CREATE PROCEDURE [billing].[CalculateInvoiceBalance] 
(
	@invoiceId INT, 
	@totalInvoiceAmount DECIMAL(18,2)
)
AS BEGIN
	SET NOCOUNT ON
	BEGIN TRY
		DECLARE @InvoiceAllocations TABLE (TransactionId INT, Amount DECIMAL(18,2), IsDeleted BIT);
		INSERT INTO @InvoiceAllocations(TransactionId, Amount,IsDeleted) VALUES (1,0.0,0);
		-- Get the invoice transaction
		DECLARE @InvoiceTransactions TABLE (TransactionId INT,InvoiceId INT,TransactionType INT);
		INSERT INTO @InvoiceTransactions
		SELECT TOP 1 TransactionId, InvoiceId, TransactionTypeId
		FROM [billing].[Transactions] 
		WHERE InvoiceId = @invoiceId AND TransactionTypeId = 6--Invoice

		-- Check if the invoice transaction exists
		IF NOT EXISTS (SELECT 1 FROM @InvoiceTransactions)
		BEGIN
			SELECT @totalInvoiceAmount AS Balance
			RETURN;
		END

		-- Get the reversal transaction
		DECLARE @ReversalTransactions TABLE (TransactionId INT,LinkedTransactionId INT,TransactionType INT);
		INSERT INTO @ReversalTransactions
		SELECT TOP 1 TransactionId, LinkedTransactionId, TransactionTypeId
		FROM [billing].[Transactions] 
		WHERE LinkedTransactionId = (SELECT TransactionId FROM @InvoiceTransactions)
			AND TransactionTypeId = 5--Invoice Reversal

		-- Check if the reversal transaction exists
		IF EXISTS (SELECT 1 FROM @ReversalTransactions)
		BEGIN
			SELECT 0.0 AS Balance
			RETURN;
		END		

		DECLARE @AllocationsAmount TABLE(Amount DECIMAL(18,2))
		INSERT INTO @AllocationsAmount VALUES(0)

		INSERT INTO @InvoiceAllocations
			SELECT TransactionId, Amount, IsDeleted
			FROM [billing].[InvoiceAllocation]
			WHERE IsDeleted = 0 AND InvoiceId = @invoiceId 

			;WITH CalculateInvoiceBalance_CTE
			AS (
					SELECT 
							AI.TransactionId, 
							AI.Amount,
							T.TransactionTypeId				
					FROM @InvoiceAllocations AS AI INNER JOIN (SELECT TransactionId,LinkedTransactionId,Amount,TransactionTypeId
																				FROM [billing].[Transactions]
																				WHERE TransactionTypeId NOT IN 
																				(
																					8,--Refund
																					9,--Inter Debtor Transfer
																					18--Debit Reallocation
																				)
																		) AS T ON AI.TransactionId = T.LinkedTransactionId
				WHERE AI.IsDeleted = 0
			   )
			INSERT INTO @AllocationsAmount
			SELECT 
				DT.Amount - CT.Amount
			FROM 
				CalculateInvoiceBalance_CTE AS DT INNER JOIN [billing].[Transactions] AS CT ON DT.TransactionId = CT.TransactionId
			WHERE DT.Amount = CT.Amount

			DECLARE @AllocationAmount DECIMAL(18,2)
			DECLARE @Balance DECIMAL(18,2)
			SELECT @Balance = @totalInvoiceAmount - SUM(Amount) FROM @AllocationsAmount

			IF (@Balance < 0) BEGIN SET @Balance = 0.0 END
			IF (@Balance > @totalInvoiceAmount) BEGIN SET @Balance = @totalInvoiceAmount END

			SELECT ISNULL(@Balance,0.0) AS [Balance]
	END TRY
	BEGIN CATCH
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	END CATCH
	SET NOCOUNT OFF
END