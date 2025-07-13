

CREATE PROCEDURE [pension].[MalawiReport]
				@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL
AS

SELECT   distinct 
      p.FirstName+' '+p.Surname [Beneficiary]
	  ,btyp.Name as [BenefitType]
	  ,pl.ModifiedDate as [ModifiedDate]
	  ,prec.FirstName+' '+prec.Surname [Recipient]
	  ,pl.IndustryNumber as [IndustryNumber]
	  ,ml.Amount
	  ,bd.BranchCode
	  , bd.AccountNumber [Account]
	  ,mp.PaymentDate [Transaction Date]
	  ,prec.RolePlayerId
  FROM pension.MonthlyPensionLedger ml
  inner join pension.MonthlyPension mp
  on ml.MonthlyPensionId= mp.MonthlyPensionId
  inner join pension.Ledger pl
  on ml.LedgerId = pl.PensionLedgerId 
  inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  inner join [common].[BenefitType] btyp
  on pc.BenefitTypeId = btyp.Id
  inner join pension.PensionBeneficiary pb
  on pb.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionRecipient pr
  on pr.PensionClaimMapId = pcm.PensionClaimMapId
  inner join client.Person prec
  on prec.roleplayerid = pr.personid
  inner join client.Person p
  on p.roleplayerid = pb.personid
  inner join [client].[RolePlayerBankingDetails] bd
  on bd.RolePlayerId = prec.RolePlayerId
  where CAST(ml.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)