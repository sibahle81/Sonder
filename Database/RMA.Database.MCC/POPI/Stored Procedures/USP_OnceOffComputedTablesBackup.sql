

--EXEC  POPI.USP_OnceOffComputedTablesBackup
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: Column Extended Properties (MaskingAllComputed) with Backup Tables and Drop Constraints

-- =============================================

CREATE PROCEDURE [POPI].[USP_OnceOffComputedTablesBackup]
	-- Add the parameters for the stored procedure here
AS
BEGIN


SET NOCOUNT ON;

------------------------------------------------1.Creating the Backup Tables---------------------------------------------------------------------------------

IF OBJECT_ID(N'medical.InvoiceLine_POPI', N'U') IS NOT NULL  
   DROP TABLE medical.InvoiceLine_POPI;  

select * into medical.InvoiceLine_POPI
from medical.InvoiceLine


IF OBJECT_ID(N'medical.Invoice_POPI', N'U') IS NOT NULL  
   DROP TABLE medical.Invoice_POPI;  

select * into medical.Invoice_POPI
from medical.Invoice

END