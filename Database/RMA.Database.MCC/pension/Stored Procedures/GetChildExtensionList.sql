CREATE   PROCEDURE [pension].[GetChildExtensionList]  
( 
@PageIndex	INT,
@PageSize	INT,
@recordCount INT OUTPUT)
AS
declare @offset as int
set @offset = CAST((@PageIndex - 1) * @PageSize AS NVARCHAR)

declare @fetch as int
set @fetch = CAST(@PageSize AS NVARCHAR)
BEGIN


SELECT 
	   p.FirstName as 'BeneficiaryName'
	  ,p.Surname   as 'BeneficiarySurname'
	  ,p.DateOfBirth as 'DateOfBirth'
	  ,DATEADD(yyyy,17 + 1, p.dateOfBirth) as 'ExpiryDate'
	  ,pc.PensionCaseNumber as 'PensionCaseNumber'
	  ,pl.PensionLedgerId as 'LedgerId'
	  ,pb.PensionBeneficiaryId as 'BeneficiaryRolePlayerId'
	  ,pr.PersonId as 'RecipientRolePlayerId'
	  ,pc.PensionCaseId as 'PensionCaseId' 
		
  FROM pension.LedgerExtension le
   inner  join pension.Ledger pl
  on le.LedgerId = pl.PensionLedgerId
  
	inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
	inner join pension.PensionBeneficiary pb
	on pb.PensionClaimMapId = pcm.PensionClaimMapId
 
  inner join pension.PensionRecipient pr
  on pr.PensionClaimMapId = pcm.PensionClaimMapId
  
	inner join  client.Person p 
	on p.RolePlayerId = pb.PersonId
  where le.EndDate >= getdate()
  and DATEDIFF(hour,p.DateOfBirth,GETDATE())/8766 > 17
  and p.IsDeleted=0
 order by p.DateOfBirth desc
  OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY

BEGIN
Set @recordCount = (select count(*)
	FROM pension.LedgerExtension le
   inner  join pension.Ledger pl
  on le.LedgerId = pl.PensionLedgerId
  
	inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
	inner join pension.PensionBeneficiary pb
	on pb.PensionClaimMapId = pcm.PensionClaimMapId
 
  inner join pension.PensionRecipient pr
  on pr.PensionClaimMapId = pcm.PensionClaimMapId
  
	inner join  client.Person p 
	on p.RolePlayerId = pb.PersonId
  where le.EndDate >= getdate()
  and p.IsDeleted=0)
  END

END