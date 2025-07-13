-- =============================================
-- Author:		bongani makelane
-- Create date: 30/05/2023
-- Culprits: bongani makelane
-- =============================================
CREATE FUNCTION [dbo].[GetInvoiceBalanceBasedOnDateRange] (@transactionId int, @startDate date, @endDate date) 
returns DECIMAL (18, 2) 
AS 
  BEGIN 
      DECLARE @balance DECIMAL (18, 2) 
	 
	 declare @invoiceId int =(select invoiceid from billing.Transactions where transactionid = @transactionId  and TransactionTypeId=6)

	declare @originalInvoiceAmount decimal(18,2) =(select Amount from billing.Transactions where transactionid = @transactionId)

	declare @sumAllocated decimal(18,2) = (select sum(amount) from billing.InvoiceAllocation where InvoiceId = @invoiceId and createddate between @startDate and @endDate) 


	set @balance  = (select @originalInvoiceAmount -  isnull( @sumAllocated,0))
      RETURN @balance 
  END