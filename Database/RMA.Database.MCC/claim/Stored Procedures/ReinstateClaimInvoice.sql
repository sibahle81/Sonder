
CREATE PROCEDURE [claim].[ReinstateClaimInvoice]
	@ClaimInvoiceId int
AS

--Declare @ClaimInvoiceId int
--Set @ClaimInvoiceId = 19209

BEGIN

	DECLARE @ClaimInvoiceType INT
	SELECT @ClaimInvoiceType = ClaimInvoiceTypeId FROM  [claim].[ClaimInvoice] (NOLOCK)  WHERE ClaimInvoiceId = @ClaimInvoiceId
	--print @ClaimInvoiceType

	Update [claim].[ClaimInvoice] Set IsDeleted = 0 where ClaimInvoiceId = @ClaimInvoiceId
	IF @ClaimInvoiceType = 1
		BEGIN
			Update [Claim].[SundryInvoice] Set IsDeleted = 0 Where ClaimInvoiceId = @ClaimInvoiceId
		END
	ELSE IF @ClaimInvoiceType = 3
		BEGIN
			Update [Claim].[DaysOffInvoice] Set IsDeleted = 0 Where ClaimInvoiceId = @ClaimInvoiceId
		END
	ELSE IF @ClaimInvoiceType = 8
		BEGIN
			Update [Claim].[WidowLumpsumInvoice] Set IsDeleted = 0 where ClaimInvoiceId = @ClaimInvoiceId
		END
	ELSE IF @ClaimInvoiceType = 9
		BEGIN
			Update [Claim].[FuneralExpenseInvoice] Set IsDeleted = 0 where ClaimInvoiceId = @ClaimInvoiceId
		END

END