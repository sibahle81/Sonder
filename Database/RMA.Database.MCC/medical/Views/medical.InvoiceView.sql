CREATE VIEW [medical].[InvoiceView]
AS

	SELECT InvoiceId, ClaimId, PersonEventId, HealthCareProviderId, HCPInvoiceNumber, HCPAccountNumber, InvoiceNumber, InvoiceDate, DateSubmitted, 
		DateReceived, DateAdmitted, DateDischarged, PreAuthId, InvoiceStatusId, InvoiceAmount, InvoiceVAT, InvoiceTotalInclusive, AuthorisedAmount, 
		AuthorisedVAT, AuthorisedTotalInclusive, PayeeID, PayeeTypeID, UnderAssessedComments,  HoldingKey, IsPaymentDelay, 
		IsPreauthorised, Comments, IsActive, IsDeleted
	FROM [medical].[Invoice]
