CREATE PROCEDURE [Medical].[MedicalInvoiceStatusUpdates]
AS
BEGIN

DECLARE @Result BIT = 0;
	
	CREATE TABLE #MedicalInvoice
	(
		InvoiceId INT
	)

	INSERT INTO #MedicalInvoice    
	SELECT invoiceId FROM medical.Invoice WHERE InvoiceStatusId = 3
	AND DateDiff(d, ModifiedDate, GETDATE()) > (SELECT Value 
	FROM common.settings WHERE [Key] = 'DaysBeforeInvoiceRejectedFromPended')
	AND IsActive = 1

	DECLARE @MedicalInvoiceId INT
	WHILE (SELECT COUNT(1) FROM #MedicalInvoice) > 0
	
	BEGIN

	SELECT TOP 1 @MedicalInvoiceId = invoiceId FROM #MedicalInvoice

		UPDATE medical.Invoice
		SET InvoiceStatusId = 10,
		    ModifiedDate = GETDATE(),
			ModifiedBy = 'system'
		WHERE InvoiceId = @MedicalInvoiceId

		DELETE #MedicalInvoice WHERE InvoiceId = @MedicalInvoiceId
	END

	INSERT INTO #MedicalInvoice    
	SELECT invoiceId FROM medical.Invoice WHERE InvoiceStatusId = 10
	AND DateDiff(d, ModifiedDate, GETDATE()) > (SELECT Value 
	FROM common.settings WHERE [Key] = 'DaysBeforeInvoiceFinallyRejected')
	AND IsActive = 1


	WHILE (SELECT COUNT(1) FROM #MedicalInvoice) > 0
	BEGIN
	SELECT TOP 1 @MedicalInvoiceId = invoiceId FROM #MedicalInvoice

		UPDATE medical.Invoice
		SET InvoiceStatusId = 11,
		    ModifiedDate = GETDATE(),
			ModifiedBy = 'system'
		WHERE InvoiceId = @MedicalInvoiceId

		DELETE #MedicalInvoice WHERE InvoiceId = @MedicalInvoiceId
	END

	DROP TABLE #MedicalInvoice

	SET @Result = 1
	SELECT @Result 

END