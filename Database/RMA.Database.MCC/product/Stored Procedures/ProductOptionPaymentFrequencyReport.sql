---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE PROCEDURE [product].ProductOptionPaymentFrequencyReport
		@ProductId int = null,
		@ProductOptionId int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 

	 
	Select P.ID, P.Name, PO.Name as [ProductName]
		from [product].[ProductOptionPaymentFrequency] POF 
		inner join [common].[PaymentFrequency] P on P.Id = POF.PaymentFrequencyID
		inner join product.ProductOption PO  on POF.ProductOptionId = PO.Id
	 Where PO.ProductID  =  ISNULL(@ProductId, PO.ProductID )
		 AND PO.ID = @ProductOptionId
END
