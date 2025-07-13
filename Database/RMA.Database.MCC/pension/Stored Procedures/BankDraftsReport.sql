
CREATE PROCEDURE [pension].[BankDraftsReport]
				@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL
				
AS

WITH Monthlyledgers
AS (
SELECT   DISTINCT 
	   pc.PensionCaseNumber as [PensionCaseNumber]
	  ,prec.FirstName+' '+prec.Surname [Recipient]
	  ,grec.Name [Gender]
	  ,pl.IndustryNumber as [IndustryNumber]
	  ,ml.Amount
	  ,bd.BranchCode
	  ,bd.AccountNumber [Account]
	  ,mp.PaymentDate [Transaction Date]
	  ,prec.RolePlayerId
	  ,ag.[BranchName]
	  ,c.Name [Country]
  FROM pension.MonthlyPensionLedger ml
  INNER JOIN pension.MonthlyPension mp ON ml.MonthlyPensionId= mp.MonthlyPensionId
  INNER JOIN pension.Ledger pl ON ml.LedgerId = pl.PensionLedgerId 
  INNER JOIN pension.PensionClaimMap pcm ON pl.PensionClaimMapId = pcm.PensionClaimMapId
  INNER JOIN pension.PensionCase pc ON pc.PensionCaseId = pcm.PensionCaseId
  LEFT JOIN [common].[BenefitType] btyp ON pc.BenefitTypeId = btyp.Id
  INNER JOIN pension.Beneficiary pb ON pb.BeneficiaryId = pl.BeneficiaryId
  INNER JOIN pension.PensionRecipient pr ON pr.PensionClaimMapId = pcm.PensionClaimMapId
  INNER JOIN client.Person prec ON prec.roleplayerid = pr.personid
  LEFT JOIN common.Gender grec ON grec.Id = prec.GenderId
  INNER JOIN client.Person p ON p.roleplayerid = pb.personid
  INNER JOIN [client].[RolePlayerBankingDetails] bd ON bd.RolePlayerId = prec.RolePlayerId
  LEFT JOIN [pension].[AgencyBranch] ag ON ml.[AgencyBranchId]=ag.[AgencyBranchId]
  LEFT JOIN common.Country c ON c.Id = ag.[CountryId]
  WHERE CAST(ml.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
  )
  SELECT   DISTINCT
	   mls.PensionCaseNumber
	  ,mls.Recipient
	  ,mls.Gender
	  ,mls.IndustryNumber
	  ,mls.Amount
	  ,mls.BranchCode
	  ,mls.Account
	  ,mls.[Transaction Date]
	  ,mls.RolePlayerId
	  ,mls.BranchName
	  ,mls.Country
	  ,YTDT.YTD
  FROM MonthlyLedgers AS mls
  OUTER APPLY
	( SELECT SUM(ml.Amount) AS YTD
	FROM pension.MonthlyPensionLedger ml
  INNER JOIN pension.MonthlyPension mp ON ml.MonthlyPensionId= mp.MonthlyPensionId
  INNER JOIN pension.Ledger pl ON ml.LedgerId = pl.PensionLedgerId 
  INNER JOIN pension.PensionClaimMap pcm ON pl.PensionClaimMapId = pcm.PensionClaimMapId
  INNER JOIN pension.PensionCase pc ON pc.PensionCaseId = pcm.PensionCaseId 
  WHERE pc.PensionCaseNumber = mls.PensionCaseNumber
  AND CAST(ml.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)) AS YTDT
  GROUP BY mls.PensionCaseNumber
	  ,mls.Recipient
	  ,mls.Gender
	  ,mls.IndustryNumber
	  ,mls.Amount
	  ,mls.BranchCode
	  ,mls.Account
	  ,mls.[Transaction Date]
	  ,mls.RolePlayerId
	  ,mls.BranchName
	  ,mls.Country
	  ,YTDT.YTD