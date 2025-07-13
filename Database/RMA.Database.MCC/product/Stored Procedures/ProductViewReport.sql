 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- dbo.ProductViewReport 16
CREATE PROCEDURE product.ProductViewReport
		@ProductId int = null
AS
BEGIN
	
	if(@ProductID = -1)
	BEGIN
		SET @ProductID = null
	END
	SET NOCOUNT ON;

    Select P.ID as ProductId , ProductClassID, p.[Name] as ProductName, p.Code as ProductCode, p.Description as ProductDescription, p.StartDate, p.EndDate,
		  PC.Name as [ProductClassName]
		from [product].[Product] P 
			inner join [common].[ProductClass] PC on PC.ID = P.ProductClassID
	Where p.ID = ISNULL(@ProductId, p.ID)	
END
