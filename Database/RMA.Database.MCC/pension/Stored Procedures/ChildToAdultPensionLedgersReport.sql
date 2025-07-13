CREATE PROCEDURE [pension].[ChildToAdultPensionLedgersReport]
				@FromDate	DATETIME = NULL,
				@ToDate		DATETIME = NULL
AS

 BEGIN
		DECLARE @ResultTable2 TABLE (
				Beneficiary varchar(50),
				DateOfBirth varchar(50),
				ExpiryDate varchar(50),
				PensionCaseNumber varchar(50),
				LedgerId int,
				LedgerStatus varchar(50),
				Amount decimal,
				BeneficiaryRolePlayerId int,
				RecipientRolePlayerId int,
				PensionCaseId INT);

	   
		-- Insert data into temporary table
     	INSERT @ResultTable2
			SELECT distinct
			  CONCAT(p.FirstName,' ', p.Surname)  as 'Beneficiary'
			  ,CONVERT(varchar,p.DateOfBirth,6) as [DD MMM YYYY]
			  ,CONVERT(varchar, DATEADD(yyyy,17 + 1, p.DateOfBirth), 6) as [DD MMM YYYY]
			  ,pc.PensionCaseNumber as 'PensionCaseNumber'
			  ,pl.PensionLedgerId as 'LedgerId'
			  ,pls.Name as 'LedgerStatus'
			  ,pl.CurrentMonthlyPension as 'Amount'
			  ,pb.PersonId as 'BeneficiaryRolePlayerId'
			  ,pb.PersonId as 'RecipientRolePlayerId'
			  ,pc.PensionCaseId as 'PensionCaseId' 
			
		  FROM client.Person p 
		  inner join pension.PensionBeneficiary pb
		  on p.RolePlayerId = pb.PersonId
		  inner join pension.Ledger pl
		  on pl.PensionClaimMapId = pb.PensionClaimMapId
		  inner join common.PensionLedgerStatus pls
		  on pls.[Id]=pl.pensionLedgerStatusId
		  inner join pension.PensionClaimMap pcm
		  on pl.PensionClaimMapId = pcm.PensionClaimMapId
		  inner join pension.PensionCase pc
		  on pc.PensionCaseId = pcm.PensionCaseId
		  
		  where  
		  (CONVERT(int,CONVERT(char(8),dateadd(mm,1,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
		   and (CONVERT(int,CONVERT(char(8),dateadd(mm,2,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
		   and (CONVERT(int,CONVERT(char(8),dateadd(mm,3,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
		  and pl.PensionLedgerId not in (select LedgerId from [pension].LedgerExtension)
		  and DATEDIFF(hour,p.DateOfBirth,GETDATE())/8766 > 17
		  and pb.BeneficiaryTypeId = 23
		  and p.IsDeleted=0
		  and CAST(pl.CreatedDate AS DATE) BETWEEN CAST(@FromDate AS DATE) AND CAST(@ToDate AS DATE)
		  order by pc.PensionCaseId desc
		
			
		select * FROM @ResultTable2

		
END