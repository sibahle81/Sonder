


CREATE   PROCEDURE [pension].[GetChildrenToSuspend]  

AS
BEGIN


SELECT 
      p.FirstName as 'BeneficiaryName'
      ,p.Surname   as 'BeneficiarySurname'
      ,pl.ExpectedEndDate as 'ExpiryDate'
	  ,pc.PensionCaseNumber as 'PensionCaseNumber'
	 ,pl.PensionLedgerId as 'LedgerId'
	  ,pb.PersonId as 'BeneficiaryRolePlayerId'
	  ,pb.PersonId as 'RecipientRolePlayerId'
	  ,p.DateOfBirth
	  ,pl.PensionLedgerStatusId
		
  FROM client.Person p 
  inner join pension.PensionBeneficiary pb
  
  on p.RolePlayerId = pb.PersonId
  --inner join pension.PensionRecipient pr
  --on pr.PersonId = p.RolePlayerId
  
   inner join pension.Ledger pl
  on pl.PensionClaimMapId = pb.PensionClaimMapId
  inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  
 
  
  where (CONVERT(int,CONVERT(char(8),getdate(),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 18
  and pl.PensionLedgerId not in (select le.LedgerId from pension.LedgerExtension le where le.EndDate <= getdate())
   and pb.BeneficiaryTypeId = 23
  and p.IsDeleted=0
   and pb.PensionBeneficiaryId = pl.BeneficiaryId
   and pl.PensionLedgerStatusId <> 4

END