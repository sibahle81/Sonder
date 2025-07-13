---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- product.ProductOptionsReport 16
CREATE PROCEDURE product.ProductOptionsReport
		@ProductId int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 

		Select id, productid, name, description, CONVERT(VARCHAR(10),startdate,111) as startdate ,code, MaxAdminFeePercentage, MaxAdminFeePercentage  as MaxAF , MaxCommissionFeePercentage as MCFP
		from product.ProductOption PO 
		Where ProductID = ISNULL(@ProductId, PO.ID)	
		 
	 
END
