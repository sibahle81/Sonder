
CREATE     PROCEDURE [pension].[GetPensionLedgersByIdNumber] @IdNumber varchar(50)
AS
BEGIN
select ldg.PensionLedgerId [LedgerId]
,ldg.PensionLedgerStatusId 
,cm.PensionCaseId
,pc.PensionCaseNumber
,cm.ClaimReferenceNumber
,per.FirstName [BeneficiaryFirstName]
,per.Surname	[BeneficiarySurname]
,per.idnumber [BeneficiaryIdNumber]
,perrec.FirstName [RecipientFirstName]
,perrec.Surname [RecipientSurname]
,per.DateOfBirth
,ldg.ModifiedDate
,ldg.StartAmount
,ldg.StartDate
,ldg.ProductClassName
,ldg.ProductCode
,ldg.BenefitCode
,ldg.PensionLedgerId [LedgerId]
,ldg.NormalMonthlyPension
,ldg.CurrentMonthlyPension
,ldg.CapitalValue
,ldg.DateOfAccident
,ldg.PensionLedgerStatusId
,ldg.ProductOptionName
,pls.Name [StatusName]
,ldg.PensionLedgerStatusId [Status]
,ldg.CreatedDate
,ben.BeneficiaryId as 'BeneficiaryId'
,rec.PensionRecipientId as 'RecipientId'
,ben.BeneficiaryTypeId
from [pension].[PensionClaimMap] cm
inner join [pension].[PensionCase] pc
on cm.PensionCaseId = pc.PensionCaseId
inner join [pension].Ledger ldg
on ldg.[PensionClaimMapId]=cm.PensionClaimMapId
inner join [pension].[Beneficiary] ben
on ldg.beneficiaryid = ben.BeneficiaryId
left join [pension].PensionRecipient rec
on cm.PensionClaimMapId = rec.PensionClaimMapId

inner join [client].[Person] per
on ben.PersonId = per.RolePlayerId
inner join [client].[Person] perrec
on rec.PersonId = perrec.RolePlayerId
inner join [common].[PensionLedgerStatus] pls
on ldg.PensionLedgerStatusId = pls.Id
where per.IdNumber=@IdNumber
and cm.IsDeleted=0 and ldg.PensionLedgerStatusId =2 -- running
END