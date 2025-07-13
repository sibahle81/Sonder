 
CREATE   PROCEDURE [claim].[ClaimDashboardCorporateStoredProcedure]     
	@CoverTypeIds AS VARCHAR(50)  
AS

BEGIN 
 
Select comp.RolePlayerId, comp.[Name] from product.productoptioncovertype (NOLOCK) poct
inner join policy.policy (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId
AND pol.IsDeleted = 0
INNER JOIN client.roleplayer (NOLOCK) rp on rp.RolePlayerId = pol.PolicyOwnerId
									  AND rp.RolePlayerIdentificationTypeId = 2
									  AND rp.IsDeleted = 0
INNER JOIN client.Company (nolock) comp on comp.RolePlayerId = rp.RolePlayerId
									AND comp.IsDeleted = 0

where poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))
 
group by comp.RolePlayerId,comp.[Name]
 
 

END