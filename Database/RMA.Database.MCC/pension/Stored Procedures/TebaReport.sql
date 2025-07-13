



CREATE     PROCEDURE [pension].[TebaReport]
				@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL
AS
BEGIN
select	pc.PensionCaseNumber [PensionRefNo],
		ldg.[IndustryNumber][IndustryNo],
		per.[FirstName] [Names],
		per.Surname,
		ldg.BenefitCode,
		per.DateOfBirth,
		CASE
		WHEN per.IdTypeId=1 
		THEN per.IdNumber
		ELSE ''
		END [IDNo],
		CASE
		WHEN per.IdTypeId=2
		THEN per.IdNumber
		ELSE ''
		END [PassportNo],
		CASE
		WHEN ldg.PensionLedgerStatusId=0
		THEN 'Unknown'
				WHEN ldg.PensionLedgerStatusId=1
		THEN 'Open'
				WHEN ldg.PensionLedgerStatusId=2
		THEN 'Running'
				WHEN ldg.PensionLedgerStatusId=3
		THEN '3'
				WHEN ldg.PensionLedgerStatusId=4
		THEN 'Suspended'
				WHEN ldg.PensionLedgerStatusId=5
		THEN 'Re-opened'
				WHEN ldg.PensionLedgerStatusId=6
		THEN 'Stopped'
		END [PensionStatus],
		FORMAT (getdate(), 'dd/MM/yyyy ')[ProcessedDate],
		ldg.CreatedDate
from [pension].[PensionClaimMap] cm
inner join [pension].[PensionCase] pc
on cm.PensionCaseId = pc.PensionCaseId
inner join [pension].Ledger ldg
on ldg.[PensionClaimMapId]=cm.PensionClaimMapId
inner join [pension].[PensionBeneficiary] ben
on ldg.beneficiaryid = ben.PensionBeneficiaryId
inner join [pension].PensionRecipient rec
on cm.PensionClaimMapId = rec.PensionClaimMapId
inner join [client].[Person] per
on ben.PersonId = per.RolePlayerId
inner join [client].[Person] perrec
on rec.PersonId = perrec.RolePlayerId
inner join [common].[PensionLedgerStatus] pls
on ldg.PensionLedgerStatusId = pls.Id
and cm.IsDeleted=0
where CAST(ldg.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
END