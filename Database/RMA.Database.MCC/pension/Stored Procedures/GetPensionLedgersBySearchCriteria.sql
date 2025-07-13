


CREATE     PROCEDURE [pension].[GetPensionLedgersBySearchCriteria] @searchCriteria varchar(100)
AS
BEGIN

IF(@searchCriteria='')

SELECT ldg.[PensionLedgerId]
      ,ldg.[PensionClaimMapId]
      ,ldg.[StartDate]
      ,ldg.[StartAmount]
      ,ldg.[ExpectedEndDate]
      ,ldg.[IsAutoLedger]
      ,ldg.[IsActive]
      ,ldg.[IsDeleted]
      ,ldg.[CreatedBy]
      ,ldg.[CreatedDate]
      ,ldg.[ModifiedBy]
      ,ldg.[ModifiedDate]
      ,ldg.[BeneficiaryIdNumber]
      ,ldg.[BeneficiaryFirstName]
      ,ldg.[BeneficiarySurname]
      ,ldg.[RecipientFirstName]
      ,ldg.[RecipientSurname]
      ,ldg.[ClaimReferenceNumber]
      ,ldg.[DateOfAccident]
      ,ldg.[DateOfStabilisation]
      ,ldg.[ProductCode]
      ,ldg.[BenefitCode]
      ,ldg.[ProductOptionName]
      ,ldg.[ProductClassName]
      --,ldg.[Status]
      ,ldg.[NormalMonthlyPension]
      ,ldg.[CurrentMonthlyPension]
      ,ldg.[CapitalValue]
      ,ldg.[Earnings]
      ,ldg.[BeneficiaryPercentage]
      ,ldg.[EarningsAllocation]
      ,ldg.[AV]
      ,ldg.[BeneficiaryType]
      ,ldg.[PensionCaseNumber]
      ,ldg.[IndustryNumber]
      ,ldg.[BeneficiaryLastName]
      ,ldg.[PensionCaseType]
      ,ldg.[BenefitType]
      --,ldg.[Reason]
	  ,cm.[PensionCaseId]
from [pension].[PensionClaimMap] cm
inner join [pension].PensionLedger ldg
inner join [common].[BeneficiaryType] bent
on ldg.BeneficiaryType = bent.Id
inner join [common].[BenefitType] bt
on ldg.BenefitType = bt.Id
on ldg.[PensionClaimMapId]=cm.PensionClaimMapId
where ldg.IsDeleted=0

ELSE

SELECT ldg.[PensionLedgerId]
      ,ldg.[PensionClaimMapId]
      ,ldg.[StartDate]
      ,ldg.[StartAmount]
      ,ldg.[ExpectedEndDate]
      ,ldg.[IsAutoLedger]
      ,ldg.[IsActive]
      ,ldg.[IsDeleted]
      ,ldg.[CreatedBy]
      ,ldg.[CreatedDate]
      ,ldg.[ModifiedBy]
      ,ldg.[ModifiedDate]
      ,ldg.[BeneficiaryIdNumber]
      ,ldg.[BeneficiaryFirstName]
      ,ldg.[BeneficiarySurname]
      ,ldg.[RecipientFirstName]
      ,ldg.[RecipientSurname]
      ,ldg.[ClaimReferenceNumber]
      ,ldg.[DateOfAccident]
      ,ldg.[DateOfStabilisation]
      ,ldg.[ProductCode]
      ,ldg.[BenefitCode]
      ,ldg.[ProductOptionName]
      ,ldg.[ProductClassName]
     -- ,ldg.[Status]
      ,ldg.[NormalMonthlyPension]
      ,ldg.[CurrentMonthlyPension]
      ,ldg.[CapitalValue]
      ,ldg.[Earnings]
      ,ldg.[BeneficiaryPercentage]
      ,ldg.[EarningsAllocation]
      ,ldg.[AV]
      ,ldg.[BeneficiaryType]
      ,ldg.[PensionCaseNumber]
      ,ldg.[IndustryNumber]
      ,ldg.[BeneficiaryLastName]
      ,ldg.[PensionCaseType]
      ,ldg.[BenefitType]
      --,ldg.[Reason]
	  ,cm.[PensionCaseId]
from [pension].[PensionClaimMap] cm
inner join [pension].PensionLedger ldg
inner join [common].[BeneficiaryType] bent
on ldg.BeneficiaryType = bent.Id
inner join [common].[BenefitType] bt
on ldg.BenefitType = bt.Id
on ldg.[PensionClaimMapId]=cm.PensionClaimMapId
where ldg.PensionCaseNumber = @searchCriteria 
or ldg.BeneficiaryFirstName like ('%'+@searchCriteria+'%')
or ldg.BeneficiarySurname like ('%'+@searchCriteria+'%') 
or ldg.IndustryNumber like ('%'+@searchCriteria+'%')
or bent.Name like ('%'+@searchCriteria+'%')
or bt.Name like ('%'+@searchCriteria+'%')
and  ldg.IsDeleted=0
END