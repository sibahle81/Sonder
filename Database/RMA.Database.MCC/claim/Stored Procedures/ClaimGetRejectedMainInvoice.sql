
CREATE PROCEDURE [claim].[ClaimGetRejectedMainInvoice] 
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


	select DISTINCT 
			c.ClaimInvoiceId				AS ClaimInvoiceId
			,c.claimId						AS ClaimId
			,c.claimInvoiceTypeId			AS ClaimInvoiceType
			,c.ClaimBenefitId				AS ClaimBenefitId
			,c.DateReceived		   			AS DateReceived
			,c.DateSubmitted				AS DateSubmitted
			,c.DateApproved					AS DateApproved
			,c.InvoiceAmount				AS InvoiceAmount
			,c.InvoiceVat					AS AuthorizedAmount
			,c.AuthorisedAmount				AS AuthorizedAmount
			,c.AuthorisedVat				AS AuthorisedVat
			,c.InvoiceDate					AS InvoiceDate
			,c.ClaiminvoiceStatusId			AS ClaiminvoiceStatusId
			,c.IsBankingApproved			AS IsBankingApproved
			,c.IsAuthorised					AS IsAuthorised
			,c.ClaimInvoiceDecisionId		AS ClaimInvoiceDecisionId
			,c.ExternalReferenceNumber		AS ExternalReferenceNumber
			,c.InternalReferenceNumber		AS InternalReferenceNumber
			,c.IsDeleted					AS IsDeleted
			,c.CreatedDate					AS CreatedDate
			,c.CreatedBy					AS CreatedBy
	from claim.ClaimInvoice				 AS c
	where c.ClaimInvoiceId = @ClaimInvoiceId AND c.ClaimInvoiceTypeId = @ClaimInvoiceType
END