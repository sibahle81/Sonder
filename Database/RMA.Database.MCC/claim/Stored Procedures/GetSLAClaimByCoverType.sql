CREATE   PROCEDURE [claim].[GetSLAClaimByCoverType]  (   
	@CoverTypeIds AS VARCHAR(50),
	@BrokerageId AS INT = 0)
AS

/*

exec [claim].[GetSLAClaimByCoverType]  @CoverTypeIds = '6,7', @BrokerageId = 46

*/

BEGIN 
if (@BrokerageId > 0 )
BEGIN
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
	   clm.ModifiedDate,
	   pedd.DeathDate AS PersonEventDeathDate

FROM product.productoptioncovertype (NOLOCK) poct
inner join policy.[policy] (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId
									--AND pol.PolicyPayeeId = @ParentOwnerId
									AND pol.IsDeleted = 0
									AND poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))
INNER JOIN broker.Brokerage (NOLOCK) brk on brk.Id = pol.BrokerageId
INNER JOIN claim.claim (nolock) clm on clm.PolicyId = pol.PolicyId
									AND clm.IsDeleted = 0
									-- AND clm.CreatedDate > DATEADD(YYYY, -1, @todayDate)
INNER JOIN claim.Personevent (NOLOCK) pe on pe.PersonEventId = clm.PersonEventId
inner join claim.PersonEventDeathDetail(Nolock) pedd on pedd.PersonEventId = pe.PersonEventId
WHERE pol.BrokerageId = @BrokerageId

group by clm.ClaimId,
		 clm.PersonEventId,
		 clm.ClaimReferenceNumber,
		 clm.ClaimStatusId,
		 clm.ClaimStatusChangeDate,
		 clm.PolicyId,
		 clm.CreatedBy,
		 clm.createddate,
		 clm.ModifiedBy,
		 clm.ModifiedDate,
		 pedd.DeathDate
END
ELSE
BEGIN

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
	   clm.ModifiedDate,
	   pedd.DeathDate AS PersonEventDeathDate
FROM product.productoptioncovertype (NOLOCK) poct
inner join policy.[policy] (NOLOCK)pol on pol.ProductOptionId = poct.ProductOptionId
									--AND pol.PolicyPayeeId = @ParentOwnerId
									AND pol.IsDeleted = 0
									AND poct.CoverTypeId in (SELECT [Data] FROM [dbo].[Split] (@CoverTypeIds,','))
INNER JOIN claim.claim (nolock) clm on clm.PolicyId = pol.PolicyId
									AND clm.IsDeleted = 0
									-- AND clm.CreatedDate > DATEADD(YYYY, -1, @todayDate)
INNER JOIN claim.Personevent (NOLOCK) pe on pe.PersonEventId = clm.PersonEventId
inner join claim.PersonEventDeathDetail(Nolock) pedd on pedd.PersonEventId = pe.PersonEventId

group by clm.ClaimId,
		 clm.PersonEventId,
		 clm.ClaimReferenceNumber,
		 clm.ClaimStatusId,
		 clm.ClaimStatusChangeDate,
		 clm.PolicyId,
		 clm.CreatedBy,
		 clm.createddate,
		 clm.ModifiedBy,
		 clm.ModifiedDate,
		 pedd.DeathDate
END

END