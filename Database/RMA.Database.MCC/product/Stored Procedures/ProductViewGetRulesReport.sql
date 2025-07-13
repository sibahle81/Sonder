-- dbo.ProductViewGetRulesReport 10
CREATE PROCEDURE [product].ProductViewGetRulesReport
		@ProductId int = null
AS
BEGIN
  
  SET NOCOUNT ON;
 --Select * from [product].[Benefit]

	 Select * from [product].[Benefit] Ben 
			inner join [product].[Product] P on P.Id = Ben.ProductID
	Where p.ID = ISNULL(@ProductId, p.ID)	

     
		 
	 
END
