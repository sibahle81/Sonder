/*
	Get data required to process month end payments into FinCare.
	Procedure gets data for the pension month, including other scheduled payments (Overpayments)

	
	Who    When             What
	---    ----------     ----------
	LS     June-2025       Init

*/
CREATE OR ALTER PROCEDURE   INT
AS
BEGIN
	SELECT rbd.AccountNumber,
		   cb.[Name] [BankName],
		   rbd.BranchCode,
		   rbd.BankAccountTypeId,
		   cb.IsForeign [IsForeignBankAccount],
		   c.ClaimReferenceNumber,
		   CAST(mpl.MonthlyPensionLedgerId AS VARCHAR(20)) [Reference],
		   c.ClaimId,
		   pe.ClaimTypeId,
		   p.IdNumber,
		   rp.EmailAddress,
		   ISNULL(rp.ClientTypeId, 1) [ClientTypeId],
		   l.ProductCode,
		   pol.PolicyId,
		   pol.PolicyNumber,
		   mpl.Amount [PensionAmount],
		   mpl.AdditionalTax,
		   mpl.PAYE,
		   mpl.MonthlyPensionLedgerId,
		   b.PersonId,
		   rp.DisplayName [Payee],
		   l.BenefitCode,
		   pc.PensionCaseNumber
	FROM pension.MonthlyPensionV2 mp
	INNER JOIN pension.MonthlyPensionLedgerV2 mpl ON mpl.MonthlyPensionId = mp.MonthlyPensionId
		AND mpl.PensionLedgerPaymentStatusId = 1
	INNER JOIN pension.[Ledger] l ON l.PensionLedgerId = mpl.PensionLedgerId
	INNER JOIN pension.Beneficiary b ON b.BeneficiaryId = l.BeneficiaryId
	INNER JOIN client.RolePlayer rp ON rp.RolePlayerId = b.PersonId
	INNER JOIN client.RolePlayerBankingDetails rbd ON rbd.RolePlayerBankingId = mpl.RolePlayerBankingId
		AND LEN(rbd.AccountNumber) >= 6
	INNER JOIN client.Person p ON p.RolePlayerId = rp.RolePlayerId
	INNER JOIN common.BankBranch bb ON bb.Id = rbd.BankBranchId
	INNER JOIN common.Bank cb ON cb.Id = bb.BankId
	INNER JOIN pension.PensionClaimMap pcm ON pcm.PensionClaimMapId = l.PensionClaimMapId
	INNER JOIN claim.Claim c ON c.ClaimId = pcm.ClaimId
	INNER JOIN claim.PersonEvent pe ON pe.EventId = c.PersonEventId
	INNER JOIN [policy].[Policy] pol ON pol.PolicyId = c.PolicyId 
    INNER JOIN pension.PensionCase pc ON pc.PensionCaseId = pcm.PensionCaseId
	WHERE mp.MonthlyPensionId = @monthlyPensionId
	AND mp.IsDeleted = 0


END
