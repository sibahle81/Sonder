


CREATE  PROCEDURE [pension].[GetPensionLedgersById] @LedgerId int
AS
BEGIN
select Distinct ldg.PensionLedgerId [LedgerId]
,ldg.PensionLedgerStatusId [Status]
,cm.PensionCaseId
,pc.PensionCaseNumber
,cm.ClaimReferenceNumber
,per.FirstName [BeneficiaryFirstName]
,per.Surname	[BeneficiarySurname]
,per.DateOfBirth
,ldg.ModifiedDate
,ldg.StartAmount
,ldg.StartDate
,ldg.ProductClassName
,ldg.ProductCode
,ldg.BenefitCode
,ldg.Earnings
,ldg.DateOfStabilisation
,FLOOR(DATEDIFF(DAY, per.DateOfBirth , ldg.DateOfStabilisation) / 365.25) AS AgeAtDateOfStabilization
,ldg.CapitalValue
,isnull(ldg.BenefitCode,'Unknown') as 'BenefitCode'
,ldg.PensionLedgerId as 'LedgerId'
,isnull(ben.BeneficiaryId,0) as 'BeneficiaryId'
,isnull(rec.PensionRecipientId,0) as 'RecipientId'
,ben.BeneficiaryTypeId
,cm.PensionClaimMapId as 'PensionClaimMapId'
,isnull(ldg.CurrentMonthlyPension,ldg.NormalMonthlyPension) as 'CurrentMonthlyPension'
,ldg.NormalMonthlyPension
from [pension].[PensionClaimMap] cm
inner join [pension].[PensionCase] pc
on cm.PensionCaseId = pc.PensionCaseId
inner join [pension].Ledger ldg
on ldg.[PensionClaimMapId]=cm.PensionClaimMapId
inner join [pension].[Beneficiary] ben
on ldg.BeneficiaryId = ben.BeneficiaryId
left join [pension].PensionRecipient rec
on cm.PensionClaimMapId = rec.PensionClaimMapId
inner join [client].[Person] per
on ben.PersonId = per.RolePlayerId
where ldg.PensionLedgerId=@LedgerId
and cm.IsDeleted=0
END