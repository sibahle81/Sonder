
CREATE PROCEDURE [pension].[GetLedgersToClose] 
as 
begin
SELECT   distinct
        pl.PensionLedgerId as 'LedgerId'
  		 
	    	
  FROM pension.Ledger pl 
   inner join pension.PensionClaimMap pcm
	 on pl.PensionClaimMapId = pcm.PensionClaimMapId
  
   left join pension.PensionBeneficiary pb
	 on pb.PensionClaimMapId = pcm.PensionClaimMapId
   left join pension.PensionRecipient pr
	 on pr.PensionClaimMapId = pcm.PensionCaseId
   left join client.Person p
	 on p.roleplayerid = pb.personid
 where pl.IsDeleted=0 
	and p.IsAlive = 0
	and pl.PensionLedgerStatusId = 2
	--and pl.IsActive = 1

END