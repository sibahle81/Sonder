CREATE  PROCEDURE [broker].[GetBrokeragesByCoverTypeIds]     
	@CoverTypeIds AS VARCHAR(50)  
AS

BEGIN 
 
Select brk.Id, brk.[Name] from product.ProductOptionCoverType (NOLOCK) poct
inner join policy.policy (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId
AND pol.IsDeleted = 0
INNER JOIN broker.brokerage (NOLOCK) brk on brk.Id = pol.BrokerageId									   
									  AND brk.IsDeleted = 0
where poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))
 
group by brk.Id, brk.[Name]
 
 

END