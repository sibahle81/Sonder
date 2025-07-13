CREATE   PROCEDURE [billing].[InvoiceCreditNoteLineItems]
@invoiceId int
as
begin
	--declare @invoiceId int =582018
		select bi.InvoiceNumber,bili.InsurableItem,bili.NoOfEmployees,isnull(bili.Earnings,0) Earnings,bili.[Percentage],bili.rate,
			   isnull(bili.ActualPremium,0) ActualPremium,isnull(round(bili.PaymentAmount,0),0) PaymentAmount,isnull(round(bili.Amount,0),0) Amount,
			   isnull(round(bi.TotalInvoiceAmount,0),0) TotalInvoiceAmount, 
			   isnull(round(bili.Amount,0),0) -isnull(round(bi.TotalInvoiceAmount,0),0) Prev_Billing
		from billing.Invoice bi (nolock)
		inner join billing.InvoiceLineItems  bili (nolock) on bi.InvoiceId =bili.InvoiceId
		where bi.invoiceId = @invoiceId 
end
