


CREATE  PROCEDURE [pension].[GetLedgersBySearchCriteria]
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

SELECT    
      p.FirstName as 'BeneficiaryName'
      ,p.Surname   as 'BeneficiarySurname'  
	  ,p.IdNumber   
	  ,pc.PensionCaseNumber as 'PensionCaseNumber'
	  ,pc.PensionCaseId as 'PensionCaseId'
	  ,pl.ModifiedDate as 'ModifiedDate'
	  ,isnull(pb.BeneficiaryTypeId,23) as 'BeneficiaryType'
	  ,pl.PensionLedgerStatusId as 'Status'
	  ,pc.BenefitTypeId as 'BenefitType'
	  ,pl.IndustryNumber as 'IndustryNumber'
	  ,pl.PensionLedgerId as 'Id'
	  ,pl.PensionLedgerId as 'LedgerId'
	  ,pb.PensionBeneficiaryId as 'BeneficiaryId'
	  ,pl.DateOfBirth
	  ,pl.LastPaymentDate
	  ,'Mandisa' as 'ClaimReferenceNumber'
	   --,pr.PensionRecipientId as 'RecipientidId'
	 
	   
		
  FROM pension.Ledger pl 
   inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  inner join pension.PensionBeneficiary pb
 on pb.PensionClaimMapId = pcm.PensionClaimMapId
 -- inner join pension.PensionRecipient pr
 --on pr.PensionClaimMapId = pcm.PensionClaimMapId
   inner join client.Person p
   on p.roleplayerid = pb.personid 
   AND pb.PensionBeneficiaryId = pl.BeneficiaryId
where pl.IsDeleted=0 

order by pl.ModifiedDate 
OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY



ELSE

SELECT  
      p.FirstName as 'BeneficiaryName'
      ,p.Surname   as 'BeneficiarySurname'  
	  ,p.IdNumber      
	  ,pc.PensionCaseNumber as 'PensionCaseNumber'
	  ,pc.PensionCaseId as 'PensionCaseId'
	  ,pl.ModifiedDate as 'ModifiedDate'
	  ,isnull(pb.BeneficiaryTypeId,23) as 'BeneficiaryType'
	  ,pl.PensionLedgerStatusId as 'Status'
	  ,pc.BenefitTypeId,23 as 'BenefitType'
	  ,pl.IndustryNumber as 'IndustryNumber'
	  ,pl.PensionLedgerId as 'Id'
	  ,pl.PensionLedgerId as 'LedgerId'
	  ,pb.PensionBeneficiaryId as 'BeneficiaryId'
	   ,ptyp.[Name] 'PensionType'
	   ,btyp.[Name] 'BenefitType'
	   --,pr.PensionRecipientId as 'RecipientidId'
	 	
 FROM pension.Ledger pl 
   inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  left join common.PensionType ptyp
  on ptyp.Id = pc.PensionTypeId
  inner join common.BenefitType btyp
  on btyp.Id = pc.BenefitTypeId
  left join pension.PensionBeneficiary pb
 on pb.PensionClaimMapId = pcm.PensionClaimMapId
 -- inner join pension.PensionRecipient pr
 --on pr.PensionClaimMapId = pcm.PensionClaimMapId
   inner join client.Person p
   on p.roleplayerid = pb.personid
     AND pb.PensionBeneficiaryId = pl.BeneficiaryId
where pc.PensionCaseNumber like ('%'+@searchCriteria+'%')
or p.FirstName like ('%'+@searchCriteria+'%')
or p.Surname like ('%'+@searchCriteria+'%') 
or pl.IndustryNumber like ('%'+@searchCriteria+'%')
or pb.BeneficiaryTypeId like ('%'+@searchCriteria+'%')
or btyp.Name like ('%'+@searchCriteria+'%')
or p.IdNumber like ('%'+@searchCriteria+'%')
or pcm.ClaimReferenceNumber like ('%'+@searchCriteria+'%')
or ptyp.[Name] like ('%'+@searchCriteria+'%')
and  pl.IsDeleted=0
order by pl.ModifiedDate 
OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY





IF(@searchCriteria='' or @searchCriteria is null) 
BEGIN
SET @recordCount = (SELECT   count(*) 
  	
		
  FROM pension.Ledger pl 
   inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  inner join pension.PensionBeneficiary pb
 on pb.PensionClaimMapId = pcm.PensionClaimMapId
 -- inner join pension.PensionRecipient pr
 --on pr.PensionClaimMapId = pcm.PensionClaimMapId
   inner join client.Person p
   on p.roleplayerid = pb.personid 
   AND pb.PensionBeneficiaryId = pl.BeneficiaryId )

END
ELSE

BEGIN
SET @recordCount = (SELECT   count(*) 
     
	 
 FROM pension.Ledger pl 
   inner join pension.PensionClaimMap pcm
  on pl.PensionClaimMapId = pcm.PensionClaimMapId
  inner join pension.PensionCase pc
  on pc.PensionCaseId = pcm.PensionCaseId
  left join common.PensionType ptyp
  on ptyp.Id = pc.PensionTypeId
  inner join common.BenefitType btyp
  on btyp.Id = pc.BenefitTypeId
  left join pension.PensionBeneficiary pb
 on pb.PensionClaimMapId = pcm.PensionClaimMapId
 -- inner join pension.PensionRecipient pr
 --on pr.PensionClaimMapId = pcm.PensionClaimMapId
   inner join client.Person p
   on p.roleplayerid = pb.personid
     AND pb.PensionBeneficiaryId = pl.BeneficiaryId
where pc.PensionCaseNumber like ('%'+@searchCriteria+'%')
or p.FirstName like ('%'+@searchCriteria+'%')
or p.Surname like ('%'+@searchCriteria+'%') 
or pl.IndustryNumber like ('%'+@searchCriteria+'%')
or pb.BeneficiaryTypeId like ('%'+@searchCriteria+'%')
or pc.BenefitTypeId like ('%'+@searchCriteria+'%')
or p.IdNumber like ('%'+@searchCriteria+'%')
or pcm.ClaimReferenceNumber like ('%'+@searchCriteria+'%')
or ptyp.[Name] like ('%'+@searchCriteria+'%')
or btyp.Name like ('%'+@searchCriteria+'%')
and  pl.IsDeleted=0)
END
END