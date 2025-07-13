


--EXEC  POPI.USP_OnceOffRecreateFKComputedTables
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: (MaskingAllComputed) with Restoring the FK Constraints to all tables relate to Computed Tables

-- =============================================

CREATE PROCEDURE [POPI].[USP_OnceOffRecreateFKComputedTables]
	-- Add the parameters for the stored procedure here
AS
BEGIN


SET NOCOUNT ON;
---------------------------------------medical.InvoiceLine--------------------

--1) [medical].[InvoiceLine]

ALTER TABLE [medical].[InvoiceLineUnderAssessReason]  WITH CHECK ADD  CONSTRAINT [FK_InvoiceLine_InvoiceLineUnderAssessReason_InvoiceLineId] FOREIGN KEY([InvoiceLineId])
REFERENCES [medical].[InvoiceLine] ([InvoiceLineId])

ALTER TABLE [medical].[InvoiceLineUnderAssessReason] CHECK CONSTRAINT [FK_InvoiceLine_InvoiceLineUnderAssessReason_InvoiceLineId]



ALTER TABLE [medical].[InvoiceLine]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_InvoiceLine_InvoiceId] FOREIGN KEY([InvoiceId])
REFERENCES [medical].[Invoice] ([InvoiceId])
ON DELETE CASCADE

ALTER TABLE [medical].[InvoiceLine] CHECK CONSTRAINT [FK_Invoice_InvoiceLine_InvoiceId]

---------------------------------------medical.Invoice--------------------


ALTER TABLE [payment].[Allocation]  WITH CHECK ADD  CONSTRAINT [FK_Payment_Allocation_MedicalInvoiceId] FOREIGN KEY([MedicalInvoiceId])
REFERENCES [medical].[Invoice] ([InvoiceId])

ALTER TABLE [payment].[Allocation] CHECK CONSTRAINT [FK_Payment_Allocation_MedicalInvoiceId]


ALTER TABLE [medical].[InvoiceUnderAssessReason]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_InvoiceUnderAssessReason_InvoiceId] FOREIGN KEY([InvoiceId])
REFERENCES [medical].[Invoice] ([InvoiceId])

ALTER TABLE [medical].[InvoiceUnderAssessReason] CHECK CONSTRAINT [FK_Invoice_InvoiceUnderAssessReason_InvoiceId]


--ALTER TABLE [medical].[InvoiceLineUnderAssessReason]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_InvoiceLineUnderAssessReason_InvoiceId] FOREIGN KEY([InvoiceId])
--REFERENCES [medical].[Invoice] ([InvoiceId])

ALTER TABLE [medical].[SwitchBatchInvoice]  WITH CHECK ADD  CONSTRAINT [FK_SwitchBatchInvoice_Invoice] FOREIGN KEY([InvoiceId])
REFERENCES [medical].[Invoice] ([InvoiceId])

ALTER TABLE [medical].[InvoiceReportMap]  WITH CHECK ADD  CONSTRAINT [FK_InvoiceReportMap_Invoice] FOREIGN KEY([InvoiceId])
REFERENCES [medical].[Invoice] ([InvoiceId])


ALTER TABLE [medical].[Invoice]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_InvoiceStatus_Id] FOREIGN KEY([InvoiceStatusId])
REFERENCES [common].[InvoiceStatus] ([Id])

ALTER TABLE [medical].[Invoice] CHECK CONSTRAINT [FK_Invoice_InvoiceStatus_Id]

ALTER TABLE [medical].[Invoice]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_PersonEvent] FOREIGN KEY([PersonEventId])
REFERENCES [claim].[PersonEvent] ([PersonEventId])

ALTER TABLE [medical].[Invoice] CHECK CONSTRAINT [FK_Invoice_PersonEvent]






END