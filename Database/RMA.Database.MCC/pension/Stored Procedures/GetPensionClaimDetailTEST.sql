
CREATE PROCEDURE [pension].[GetPensionClaimDetailTEST]    
	@ClaimReferenceNumber VARCHAR(50)

AS     
BEGIN
	--SET NOCOUNT ON

	SELECT NULL ClaimId
		,@ClaimReferenceNumber ClaimReferenceNumber
		,'EMP' ProductCode
		,GETDATE() DateOfAccident
		,GETDATE() DateOfStabilisation
		,71711.63 Earnings
		,0.0 PensionLumpSum
		,0.0 EstimatedCv
		,33.0 DisabilityPercentage
		,0.0 WidowLumpSum
		,0.0 VerifiedCV
		,0 PolicyId
		,'0004' IndustryNumber
		,'Mike Pty ltd' Member
		,'s10' ICD10Driver
		,'DRG06' Drg

	--SET NOCOUNT OFF
END