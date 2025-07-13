


CREATE     PROCEDURE [pension].[GetChildToAdultPensionLedgers]  
( 
@PageIndex	INT,
@PageSize	INT,
@recordCount INT OUTPUT)
AS
declare @offset as int
set @offset = CAST((@PageIndex - 1) * @PageSize AS NVARCHAR)

declare @fetch as int
declare @DisabledCount as int
declare @NotDisabledCount as int
set @fetch = CAST(@PageSize AS NVARCHAR)
BEGIN


SELECT distinct
      p.FirstName as 'BeneficiaryName'
      ,p.Surname   as 'BeneficiarySurname'
      ,p.DateOfBirth as 'DateOfBirth'
      ,DATEADD(yyyy,17 + 1, p.dateOfBirth) as 'ExpiryDate'
	  ,pc.PensionCaseNumber as 'PensionCaseNumber'
	  ,pl.PensionLedgerId as 'LedgerId'
	  ,pb.PensionBeneficiaryId as 'BeneficiaryRolePlayerId'
	  ,pb.PersonId as 'RecipientRolePlayerId'
	  ,pc.PensionCaseId as 'PensionCaseId' 
	 
	
	  , case WHEN (CONVERT(int,CONVERT(char(8),dateadd(mm,1,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 18 then
					3 
		     WHEN (CONVERT(int,CONVERT(char(8),dateadd(mm,2,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 18 THEN
					2
			 WHEN (CONVERT(int,CONVERT(char(8),dateadd(mm,3,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 18 THEN
					1
			 WHEN 1 = 1 THEN
					1
	   end as 'SlaRAGIndicatorId' 
	   
		
  FROM client.Person p 
  inner join pension.PensionBeneficiary pb
	
  on p.RolePlayerId = pb.PersonId
  inner join pension.Ledger pl
  on pl.PensionClaimMapId = pb.PensionClaimMapId
  inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  
  where  
  (CONVERT(int,CONVERT(char(8),dateadd(mm,1,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
   and (CONVERT(int,CONVERT(char(8),dateadd(mm,2,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
   and (CONVERT(int,CONVERT(char(8),dateadd(mm,3,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
  and pl.PensionLedgerId not in (select LedgerId from [pension].LedgerExtension)
  and pl.PensionLedgerId not in (select LinkedItemId from [bpm].[Wizard] where [WizardConfigurationId] = 108)
  and DATEDIFF(hour,p.DateOfBirth,GETDATE())/8766 >= 17
  and pb.BeneficiaryTypeId = 23
  and pb.PensionBeneficiaryId = pl.BeneficiaryId
  and p.IsDeleted=0
  and p.IsDisabled = 0
  

  UNION ALL

  SELECT distinct
      p.FirstName as 'BeneficiaryName'
      ,p.Surname   as 'BeneficiarySurname'
      ,p.DateOfBirth as 'DateOfBirth'
      ,DATEADD(yyyy,39 + 1, p.dateOfBirth) as 'ExpiryDate'
	  ,pc.PensionCaseNumber as 'PensionCaseNumber'
	  ,pl.PensionLedgerId as 'LedgerId'
	  ,pb.PensionBeneficiaryId as 'BeneficiaryRolePlayerId'
	  ,pb.PersonId as 'RecipientRolePlayerId'
	  ,pc.PensionCaseId as 'PensionCaseId' 
	
	  , case WHEN (CONVERT(int,CONVERT(char(8),dateadd(mm,1,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 40 then
					3 
		     WHEN (CONVERT(int,CONVERT(char(8),dateadd(mm,2,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 40 THEN
					2
			 WHEN (CONVERT(int,CONVERT(char(8),dateadd(mm,3,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 >= 40 THEN
					1
			 WHEN 1 = 1 THEN
					1
	   end as 'SlaRAGIndicatorId' 
	   
		
  FROM client.Person p 
  inner join pension.PensionBeneficiary pb
	
  on p.RolePlayerId = pb.PersonId
  inner join pension.Ledger pl
  on pl.PensionClaimMapId = pb.PensionClaimMapId
  inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  
  where  
 
   DATEDIFF(hour,p.DateOfBirth,GETDATE())/8766 > 39
   and pl.PensionLedgerId not in (select LedgerId from [pension].LedgerExtension)
    and pl.PensionLedgerId not in (select LinkedItemId from [bpm].[Wizard] where [WizardConfigurationId] = 108)
  and pb.BeneficiaryTypeId = 23
  and pb.PensionBeneficiaryId = pl.BeneficiaryId
  and p.IsDeleted=0
  and p.IsDisabled = 1
  order by p.DateOfBirth desc
  OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY

BEGIN
Set @NotDisabledCount = (select count(*)
FROM client.Person p 
  inner join pension.PensionBeneficiary pb
	
  on p.RolePlayerId = pb.PersonId
  inner join pension.Ledger pl
  on pl.PensionClaimMapId = pb.PensionClaimMapId
  inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  where  (CONVERT(int,CONVERT(char(8),dateadd(mm,1,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
   and (CONVERT(int,CONVERT(char(8),dateadd(mm,2,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
   and (CONVERT(int,CONVERT(char(8),dateadd(mm,3,getdate()),112))-CONVERT(char(8),p.DateOfBirth,112))/10000 <= 18
  and pl.PensionLedgerId not in (select LedgerId from [pension].LedgerExtension)
   and pl.PensionLedgerId not in (select LinkedItemId from [bpm].[Wizard] where [WizardConfigurationId] = 108)
  and pb.BeneficiaryTypeId = 23
   and DATEDIFF(hour,p.DateOfBirth,GETDATE())/8766 > 17
  and p.IsDeleted=0
  and p.IsDisabled = 0
   and pb.PensionBeneficiaryId = pl.BeneficiaryId)

   Set @DisabledCount = (select count(*)
FROM client.Person p 
  inner join pension.PensionBeneficiary pb
	
  on p.RolePlayerId = pb.PersonId
  inner join pension.Ledger pl
  on pl.PensionClaimMapId = pb.PensionClaimMapId
  inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  where  
   pl.PensionLedgerId not in (select LedgerId from [pension].LedgerExtension)
    and pl.PensionLedgerId not in (select LinkedItemId from [bpm].[Wizard] where [WizardConfigurationId] = 108)
  and pb.BeneficiaryTypeId = 23
   and DATEDIFF(hour,p.DateOfBirth,GETDATE())/8766 > 40
  and p.IsDeleted=0
  and p.IsDisabled = 1

   and pb.PensionBeneficiaryId = pl.BeneficiaryId)

   Set @recordCount = @DisabledCount + @NotDisabledCount
  END
  END