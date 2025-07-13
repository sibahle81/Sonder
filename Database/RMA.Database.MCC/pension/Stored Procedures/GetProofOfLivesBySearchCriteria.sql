



CREATE  PROCEDURE [pension].[GetProofOfLivesBySearchCriteria]
 @searchCriteria varchar(100) = '',
  @PageIndex	INT = 1,
 @PageSize	INT = 5,
 @recordCount INT = 0 OUTPUT

AS



declare @offset as int
set @offset = CAST((@PageIndex - 1) * @PageSize AS NVARCHAR)

declare @fetch as int
set @fetch = CAST(@PageSize AS NVARCHAR)

BEGIN

IF(@searchCriteria='' or @searchCriteria is null)

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
cm.PensionClaimMapId,
lgr.PensionLedgerStatusId [LedgerStatusId],
GETDATE()[ProcessedDate],
lgr.BenefitCode,
br.BeneficiaryId,
lgr.IndustryNumber,
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
order by pl.ModifiedDate 
 
OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY



ELSE

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
cm.PensionClaimMapId,
lgr.PensionLedgerStatusId [LedgerStatusId],
lgr.BenefitCode,
lgr.IndustryNumber,
GETDATE()[ProcessedDate],
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
where cm.ClaimReferenceNumber like ('%'+@searchCriteria+'%')
or  per.FirstName like ('%'+@searchCriteria+'%')
or  per.Surname like ('%'+@searchCriteria+'%')
or  rc.ContactNumber like ('%'+@searchCriteria+'%')
or  pc.PensionCaseNumber like ('%'+@searchCriteria+'%')
and per.IdTypeId = 2
and pl.IsDeleted=0 and pl.IsActive=1
order by pl.ModifiedDate  
OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY

END