


--EXEC  POPI.USP_OnceOffDropFkforComputedTables
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: (MaskingAllComputed) with Backup Tables -- DROP foreign key constraints

-- =============================================

CREATE PROCEDURE [POPI].[USP_OnceOffDropFkforComputedTables]
	-- Add the parameters for the stored procedure here
AS
BEGIN


SET NOCOUNT ON;



-------------------------------------------2.to Drop- No Constraints for below computed tables to drop -----------------------------------------
--[medical].[InvoiceLine]
--[medical].[Invoice]

------------------------------------------------2.a--Dropping the referential Foreign key constraints before dropping computed table------------


--1) [medical].[InvoiceLine]

ALTER TABLE Medical.InvoiceLineUnderAssessReason
DROP CONSTRAINT FK_InvoiceLine_InvoiceLineUnderAssessReason_InvoiceLineId;

--2) [medical].[Invoice]

ALTER TABLE Medical.InvoiceLine
DROP CONSTRAINT FK_Invoice_InvoiceLine_InvoiceId;---

ALTER TABLE payment.Allocation
DROP CONSTRAINT FK_Payment_Allocation_MedicalInvoiceId;----

ALTER TABLE Medical.InvoiceUnderAssessReason
DROP CONSTRAINT FK_Invoice_InvoiceUnderAssessReason_InvoiceId;---

--ALTER TABLE Medical.InvoiceLineUnderAssessReason
--DROP CONSTRAINT FK_Invoice_InvoiceLineUnderAssessReason_InvoiceId;--

ALTER TABLE Medical.SwitchBatchInvoice
DROP CONSTRAINT FK_SwitchBatchInvoice_Invoice;

ALTER TABLE [medical].[InvoiceReportMap]
Drop CONSTRAINT [FK_InvoiceReportMap_Invoice] ;

ALTER TABLE [medical].[Invoice] 
Drop CONSTRAINT [FK_Invoice_InvoiceStatus_Id] ;


ALTER TABLE [medical].[Invoice] 
Drop CONSTRAINT [FK_Invoice_PersonEvent] ;


END