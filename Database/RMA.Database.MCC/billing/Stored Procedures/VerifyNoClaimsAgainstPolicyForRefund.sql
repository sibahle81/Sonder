--=============================================
 --Author:		bongani makelane
 --Create date: 05/07/2020
 --=============================================
CREATE PROCEDURE [billing].[VerifyNoClaimsAgainstPolicyForRefund]
	@policyId INT
AS
BEGIN
Select ClaimId   from claim.Claim C
where C.PolicyId = @policyId AND C.isDeleted = 0 
END
