
CREATE PROCEDURE [claim].[ClaimGetRejectedChildInvoice] 
(
	@ClaimInvoiceType		AS	INT,
	@ClaimInvoiceId			AS INT
)
AS
BEGIN

		--Declare @ClaimInvoiceType		AS	INT
		--Declare @ClaimInvoiceId			AS INT

		--Set @ClaimInvoiceType = 9
		--Set @ClaimInvoiceId = 19331

	IF @ClaimInvoiceType = 1
		BEGIN
			select DISTINCT * from claim.[SundryInvoice] AS c where c.ClaimInvoiceId = @ClaimInvoiceId
		END
	ELSE IF @ClaimInvoiceType = 3
		BEGIN
			select DISTINCT * from claim.[DaysOffInvoice] AS c where c.ClaimInvoiceId = @ClaimInvoiceId
		END
	ELSE IF @ClaimInvoiceType = 8
		BEGIN
			select DISTINCT * from claim.[WidowLumpsumInvoice] AS c where c.ClaimInvoiceId = @ClaimInvoiceId
		END
	ELSE IF @ClaimInvoiceType = 9
		BEGIN
			select DISTINCT * from claim.[FuneralExpenseInvoice] AS c where c.ClaimInvoiceId = @ClaimInvoiceId
		END

END