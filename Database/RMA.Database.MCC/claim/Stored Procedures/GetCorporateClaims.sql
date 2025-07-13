CREATE PROCEDURE [claim].[GetCorporateClaims]  (   
	@CoverTypeIds AS VARCHAR(50)
	)
AS
begin

/*

exec [claim].[GetCorporateClaims]  @CoverTypeIds = '6,7'

*/

Select 
       clm.ClaimId,
	   clm.PersonEventId,
	   clm.ClaimReferenceNumber,
	   clm.ClaimStatusId,
	   clm.ClaimStatusChangeDate,
	   clm.PolicyId,
	   clm.CreatedBy,
	   clm.createddate,
	   clm.ModifiedBy,
	   clm.ModifiedDate
FROM product.productoptioncovertype (NOLOCK) poct
inner join policy.[policy] (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId								
									AND pol.IsDeleted = 0
									AND poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))
INNER JOIN client.RolePlayer (nolock) rp on rp.RolePlayerId = pol.PolicyOwnerId
											AND rp.RolePlayerIdentificationTypeId = 2
INNER JOIN claim.claim (nolock) clm on clm.PolicyId = pol.PolicyId
									AND clm.IsDeleted = 0
									AND clm.CreatedDate > dateadd(year, -1, getdate())  
group by clm.ClaimId,
		 clm.PersonEventId,
		 clm.ClaimReferenceNumber,
		 clm.ClaimStatusId,
		 clm.ClaimStatusChangeDate,
		 clm.PolicyId,
		 clm.CreatedBy,
		 clm.createddate,
		 clm.ModifiedBy,
		 clm.ModifiedDate
END