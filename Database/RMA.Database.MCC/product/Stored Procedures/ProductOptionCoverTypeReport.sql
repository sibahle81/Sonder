-- ProductOptionCoverTypeReport 16 , 43
CREATE PROCEDURE [product].ProductOptionCoverTypeReport
		@ProductId int = null,
		@ProductOptionId int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 
		Select PO.ID, CP.Name , PO.Name as [ProductName]
			from  [Product].[ProductOptionCoverType] POCT 
			inner join [common].[CoverType] CP on POCT.CovertypeID = CP.ID
			inner join [product].[ProductOption] PO on POCT.ProductOptionId = PO.ID
		 Where PO.ProductID  =  ISNULL(@ProductId, PO.ProductID )
		AND PO.Id = @ProductOptionId
END
