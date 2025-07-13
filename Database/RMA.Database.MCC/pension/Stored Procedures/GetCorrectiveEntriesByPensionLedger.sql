CREATE procedure [pension].[GetCorrectiveEntriesByPensionLedger]
( 
@PageIndex	INT,
@PageSize	INT,
@PensionLedgerId int,
@recordCount INT OUTPUT)
as 
declare @offset as int
set @offset = CAST((@PageIndex - 1) * @PageSize AS NVARCHAR)

declare @fetch as int
set @fetch = CAST(@PageSize AS NVARCHAR)
begin
SELECT [CorrectiveEntryId]
      ,[EntryTypeId]
      ,[ScheduleTypeId]
      ,[RecipientId]
      --,[BeneficiaryId]
      ,[Amount]
      ,[VATAmount]
      ,CE.[NormalMonthlyPension]
      ,CE.[CurrentMonthlyPension]
      ,[EntryStatusId]
      ,[LedgerId]
      ,p.FirstName as 'BeneficiaryFirstName'
	  ,p.Surname as 'BeneficiarySurname'
	  ,pp.FirstName as 'RecipientFirstName'
	  ,pp.Surname as 'RecipientName'
	  ,pr.PensionRecipientId as 'RecipientId'
	  ,pb.PensionBeneficiaryId as 'BeneficiaryId'
	  ,pl.PensionLedgerId as 'LedgerId'
	  , pc.PensionCaseNumber 
      ,CE.[CreatedDate]
      ,CE.[ModifiedBy]
      ,CE.[ModifiedDate]
  FROM pension.CorrectiveEntry CE

  inner join pension.Ledger pl
  on CE.LedgerId = pl.PensionLedgerId

 

  inner join pension.PensionBeneficiary pb
  on pb.PensionBeneficiaryId = CE.BeneficiaryId

   inner join pension.PensionClaimMap pcm
  on pcm.PensionClaimMapId = pb.PensionClaimMapId

  inner join pension.PensionCase pc
  on pcm.PensionCaseId = pc.PensionCaseId

  inner join pension.PensionRecipient pr
  on pr.PensionRecipientId = CE.RecipientId

  left join client.Person p 
  on p.RolePlayerId = pb.PersonId

  left join client.Person pp
  on pp.RolePlayerId = pr.PersonId

  where pl.PensionLedgerId = @PensionLedgerId
  order by CE.[CreatedDate]
  OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY

BEGIN
SET @recordCount = (SELECT   count(*) 

FROM pension.CorrectiveEntry CE

  inner join pension.Ledger pl
  on CE.LedgerId = pl.PensionLedgerId

 

  inner join pension.PensionBeneficiary pb
  on pb.PensionBeneficiaryId = CE.BeneficiaryId

   inner join pension.PensionClaimMap pcm
  on pcm.PensionClaimMapId = pb.PensionClaimMapId

  inner join pension.PensionRecipient pr
  on pr.PensionRecipientId = CE.RecipientId

  left join client.Person p 
  on p.RolePlayerId = pb.PersonId

  left join client.Person pp
  on pp.RolePlayerId = pr.PersonId

  where pl.PensionLedgerId = @PensionLedgerId)
  END
  END