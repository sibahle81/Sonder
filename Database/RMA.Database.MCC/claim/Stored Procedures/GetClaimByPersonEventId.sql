-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [claim].[GetClaimByPersonEventId]
	@PersonEventId int 
AS
BEGIN
	select 
	   [ClaimId]
      ,[PersonEventId]
      ,[PolicyId]
      ,[WizardId]
      ,[ClaimReferenceNumber]
      ,[ClaimStatusId] as ClaimStatus
      ,[ClaimLiabilityStatusId] as ClaimLiabilityStatus
      ,[ClaimStatusChangeDate]
      ,[IsCancelled]
      ,[ClaimCancellationReasonId] as ClaimCancellationReason
      ,[IsClosed]
      ,[ClaimClosedReasonId] as ClaimClosedReason
      ,[AssignedToUserId]
      ,[IsRuleOverridden]
      ,[DisabilityPercentage]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]
      ,[UnderwriterId]
      ,[InvestigationRequired]
      ,[PDVerified]
      ,[CAA]
      ,[FamilyAllowance] 
	  from [claim].[Claim] where PersonEventId = @PersonEventId
END