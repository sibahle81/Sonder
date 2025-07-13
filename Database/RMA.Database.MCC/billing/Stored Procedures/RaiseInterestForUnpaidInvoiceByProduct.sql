-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2022-01-10
-- Description:	Raises interest on overdue invoices
-- =============================================
CREATE PROCEDURE [billing].[RaiseInterestForUnpaidInvoiceByProduct]
 @productId int
AS
BEGIN
	declare @unpaidInvoices table (invoiceNumber nvarchar(200), transactionId int, balance decimal(18,2),invoiceId int, roleplayerId int)

	declare @primeRate decimal(18,2) =(select [value] from common.primerate where isactive ='true')

	insert into @unpaidInvoices
	select i.InvoiceNumber, t.TransactionId, dbo.GetTransactionBalanceForInterest(t.TransactionId),i.invoiceid, t.RolePlayerId  from billing.invoice i 
	join billing.transactions t on 
	t.invoiceid = i.invoiceid
	join policy.Policy p on p.PolicyId = i.PolicyId
	where t.TransactionTypeId = 6
	and i.CreatedDate < DATEADD(day, -30, GETDATE())
	and dbo.GetTransactionBalanceForInterest(t.TransactionId) > 0
	and p.ProductOptionId in (select ProductOptionId from product.ProductOption where productid =@productId)
	and i.InvoiceId not in (select distinct t1.InvoiceId  from billing.transactions t1 join billing.transactions t2 on t1.transactionid = t2.LinkedTransactionId   where t2.createddate  > DATEADD(day, -30, GETDATE())
	and t2.TransactionTypeId = 7  ) --dont double charge interest in the same month

	While (Select Count(*) From @unpaidInvoices) > 0
	begin
	declare @id int = (select top 1 invoiceId from  @unpaidInvoices)
	declare @interest decimal(18,2)
	declare @invoiceNumber nvarchar(200)
	declare @linkedTransactionId int
	declare @balance decimal(18,2)
	declare @roleplayerId int

	select @invoiceNumber = invoiceNumber,@linkedTransactionId = transactionId,@roleplayerId=roleplayerId,@balance = balance  from @unpaidInvoices where invoiceId = @id

	set  @interest =  (@balance * (@primeRate/ cast (100 as decimal(18,2)))) * (30 /  cast( (365/ cast( 6   as decimal(18,2))) as decimal(18,2)))
	
	 insert into billing.[Transactions] (
      [RolePlayerId]
      ,[TransactionTypeLinkId]
      ,[Amount]
      ,[TransactionDate]
      ,[TransactionTypeId]
      ,[CreatedDate]
      ,[ModifiedDate]
      ,[CreatedBy]
      ,[ModifiedBy],LinkedTransactionId, RmaReference)
	  values (@roleplayerId,1,@interest,Getdate(),7,Getdate(),Getdate(),'system@randmutual.co.za',	'system@randmutual.co.za',@linkedTransactionId, concat('Overdue-Invoice:', @invoiceNumber))

	delete @unpaidInvoices where invoiceId = @id
	
	end
END