-- =============================================
-- Author:		Bongani Makelane
-- Create date: 21 Jul 2023
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [billing].[GetBulkAllocationExceptionReport]
	@fileId int
AS
BEGIN
	/****** Script for SelectTopNRows command from SSMS  ******/
SELECT 
      [BankAccountNumber]
      ,[UserReference]
      ,[StatementReference]
      ,[TransactionDate]
      ,[Amount]    
      ,[UserReference2]
      ,[ReferenceType]
      ,[Allocatable]
      ,[AllocateTo]
      ,[Error]
  FROM [Load].[BulkManualAllocation] where [BulkAllocationFileId] = @fileId and Error is not NULL
END