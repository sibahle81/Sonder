

CREATE     PROCEDURE [pension].[GetPensionCaseLegacy] @pensionId int
AS
BEGIN
/*
exec [pension].[GetPensionCaseModernisation] @pensionId = 181
exec [pension].[GetPensionCaseLegacy] @pensionId = 1092
*/
select
clm.ClaimId,
clm.FileRefNumber as ClaimReferenceNumber,
--clm.PersonEventId,
clm.DisabilityExtent as DisabilityPercentage, 
--pol.PolicyId,
pc.ProductCode,
evt.EventDateTime [DateOfAccident],
pev.StabilisedDate [DateOfStabilisation],
pdPensionEstimatedValue.EstimatedValue as EstimatedCV,--TO DO: Get correct EstimateTypeId
isnull(ern.Total,0)[Earnings], 
isnull(per.IndustryNumber,'')[IndustryNumber],
'' as Icd10Driver --isnull(icd.ICD10Code,'') [Icd10Driver]

from compcare.claim  clm (nolock)
inner join compcare.PersonEvent  pev (nolock) on pev.PersonEventID = clm.PersonEventID
left join  compcare.Earnings ern (nolock) on ern.PersonEventID = pev.PersonEventID 
												and EarningsTypeID = 4 -- TO DO: Verify earningsType
inner join compcare.[Event] evt (nolock) on evt.EventID = pev.EventID
INNER JOIN compcare.Person per (nolock) ON per.PersonID = pev.PersonID  
inner join compcare.[Policy] pol (nolock) on pol.PolicyId = clm.PolicyID
inner join compcare.Productcode pc on pc.ProductCodeId = pol.ProductCodeId
outer apply (Select EstimatedValue 
			from compcare.ClaimEstimate ces (nolock) where  ces.ClaimID = clm.ClaimID and  ces.EstimateTypeID = 19 ) pdPensionEstimatedValue

inner join pension.PensionClaimMap pcm (nolock) on pcm.ClaimId = clm.claimid 

where pcm.PensionCaseId = @pensionId

END