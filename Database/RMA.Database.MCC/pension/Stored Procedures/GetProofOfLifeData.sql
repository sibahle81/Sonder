
CREATE PROCEDURE [pension].[GetProofOfLifeData]
AS
BEGIN
select pc.[PensionCaseNumber],
pc.PensionCaseStatusId,
cm.ClaimReferenceNumber,
pc.PensionCaseId,
per.FirstName [Name],
per.Surname [Surname],
per.DateOfBirth,
per.IdNumber [Passport],
per.IdNumber,
pl.ExpiryDate,
lgr.IndustryNumber,
GETDATE() [ProcessedDate],
cm.PensionClaimMapId,
lgr.PensionLedgerStatusId [LedgerStatusId],
lgr.BenefitCode,
br.BeneficiaryId,
br.RecipientId,
rc.EmailAddress,
rc.ContactNumber,
rc.CommunicationTypeId,
per.RolePlayerId
from [pension].[ProofOfLife] pl
inner join[pension].[PensionCase] pc
on pc.PensionCaseId = pl.PensionCaseId
inner join [pension].[PensionClaimMap] cm
on cm.[PensionCaseId]= pc.[PensionCaseId]
inner join [pension].[Ledger] lgr
on lgr.PensionClaimMapId = cm.PensionClaimMapId
inner join [pension].BeneficiaryRecipient br
on br.BeneficiaryRecipientId = pl.BeneficiaryRecipientId
inner join [client].Person per
on per.RolePlayerId = pl.PersonId
left join client.RolePlayerContact rc
on rc.[RolePlayerId]=per.RolePlayerId
where per.IdTypeId = 2
and pl.IsDeleted=0 and pl.IsActive=1
END