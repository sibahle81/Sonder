



--EXEC  POPI.USP_OnceOffRestoringComputedTables
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: (MaskingAllComputed) with Restoring the Data from Backup Tables 

-- =============================================

CREATE PROCEDURE [POPI].[USP_OnceOffRestoringComputedTables]
	-- Add the parameters for the stored procedure here
AS
BEGIN


SET NOCOUNT ON;


----------------------------------------------1.[medical].[InvoiceLine]--------------------------------------------------------------------------------------
	SET IDENTITY_INSERT medical.InvoiceLine ON;  

INSERT into medical.InvoiceLine(
[InvoiceLineId]
      ,[InvoiceId]
      ,[ServiceDate]
      ,[RequestedQuantity]
      ,[AuthorisedQuantity]
      ,[RequestedAmount]
      ,[RequestedVAT]
     -- ,[RequestedAmountInclusive]
      ,[AuthorisedAmount]
      ,[AuthorisedVAT]
    --  ,[AuthorisedAmountInclusive]
      ,[TotalTariffAmount]
      ,[TotalTariffVAT]
    --  ,[TotalTariffAmountInclusive]
    --  ,[TariffAmount]
      ,[CreditAmount]
      ,[VatCodeId]
      ,[VATPercentage]
      ,[TariffId]
      ,[TreatmentCodeId]
      ,[MedicalItemId]
      ,[HCPTariffCode]
      ,[TariffBaseUnitCostTypeId]
      ,[Description]
      ,[SummaryInvoiceLineId]
      ,[IsPerDiemCharge]
      ,[IsDuplicate]
      ,[DuplicateInvoiceLineId]
      ,[CalculateOperands]
      ,[ICD10Code]
      ,[IsActive]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]

)

SELECT  
[InvoiceLineId]
      ,[InvoiceId]
      ,[ServiceDate]
      ,[RequestedQuantity]
      ,[AuthorisedQuantity]
      ,[RequestedAmount]
      ,[RequestedVAT]
    --  ,[RequestedAmountInclusive]
      ,[AuthorisedAmount]
      ,[AuthorisedVAT]
   --   ,[AuthorisedAmountInclusive]
      ,[TotalTariffAmount]
      ,[TotalTariffVAT]
     -- ,[TotalTariffAmountInclusive]
   --   ,[TariffAmount]
      ,[CreditAmount]
      ,[VatCodeId]
      ,[VATPercentage]
      ,[TariffId]
      ,[TreatmentCodeId]
      ,[MedicalItemId]
      ,[HCPTariffCode]
      ,[TariffBaseUnitCostTypeId]
      ,[Description]
      ,[SummaryInvoiceLineId]
      ,[IsPerDiemCharge]
      ,[IsDuplicate]
      ,[DuplicateInvoiceLineId]
      ,[CalculateOperands]
      ,[ICD10Code]
      ,[IsActive]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]

  FROM [AZD-MCC].medical.InvoiceLine_POPI

	SET IDENTITY_INSERT medical.InvoiceLine OFF;  

----------------------------------------------2.[medical].[Invoice]---------------------------------------------------------------------------------------
	SET IDENTITY_INSERT medical.Invoice ON;  
 

INSERT into medical.Invoice(

[InvoiceId]
      ,[ClaimId]
      ,[PersonEventId]
      ,[HealthCareProviderId]
      ,[HCPInvoiceNumber]
      ,[HCPAccountNumber]
      ,[InvoiceNumber]
      ,[InvoiceDate]
      ,[DateSubmitted]
      ,[DateReceived]
      ,[DateAdmitted]
      ,[DateDischarged]
      ,[PreAuthId]
      ,[InvoiceStatusId]
      ,[InvoiceAmount]
      ,[InvoiceVAT]
   --   ,[InvoiceTotalInclusive]
      ,[AuthorisedAmount]
      ,[AuthorisedVAT]
   --   ,[AuthorisedTotalInclusive]
      ,[PayeeID]
      ,[PayeeTypeID]
      ,[UnderAssessedComments]
      
      ,[HoldingKey]
      ,[IsPaymentDelay]
      ,[IsPreauthorised]
      ,[PreAuthXML]
      ,[Comments]
      ,[IsActive]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]
)

SELECT  [InvoiceId]
      ,[ClaimId]
      ,[PersonEventId]
      ,[HealthCareProviderId]
      ,[HCPInvoiceNumber]
      ,[HCPAccountNumber]
      ,[InvoiceNumber]
      ,[InvoiceDate]
      ,[DateSubmitted]
      ,[DateReceived]
      ,[DateAdmitted]
      ,[DateDischarged]
      ,[PreAuthId]
      ,[InvoiceStatusId]
      ,[InvoiceAmount]
      ,[InvoiceVAT]
     -- ,[InvoiceTotalInclusive]
      ,[AuthorisedAmount]
      ,[AuthorisedVAT]
     -- ,[AuthorisedTotalInclusive]
      ,[PayeeID]
      ,[PayeeTypeID]
      ,[UnderAssessedComments]
      ,[HoldingKey]
      ,[IsPaymentDelay]
      ,[IsPreauthorised]
      ,[PreAuthXML]
      ,[Comments]
      ,[IsActive]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]
  FROM [AZD-MCC].medical.[Invoice_POPI]

	SET IDENTITY_INSERT medical.Invoice OFF;  
 
END
