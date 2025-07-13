
CREATE PROCEDURE [pension].[GetMonthlyPensionLedgersBySearchCriteria]
 @MonthlyPensionId int=0,
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

select distinct per.FirstName [RecipientName]
      ,per.Surname [RecipientSurname]
      ,mp.[MonthlyPensionId]
      ,[Amount]
      ,isnull(lgr.[AdditionalTax],0) as 'AdditionalTax'
      ,[VAT]
      ,[PAYE]
      ,[LedgerId]
      ,mp.[BatchStatusId] [BatchStatus]
      ,[ChangeReasonId] [ChangeReason]
	  ,ml.ModifiedDate 
from [pension].[MonthlyPensionLedger] ml
inner join [pension].[Ledger] lgr
on lgr.PensionLedgerId = ml.[LedgerId]
inner join [pension].MonthlyPension mp
on mp.MonthlyPensionId = ml.MonthlyPensionId
inner join [pension].[PensionClaimMap] cm
on cm.PensionClaimMapId = lgr.PensionClaimMapId
inner join [pension].[PensionRecipient] rec
on rec.PensionClaimMapId = cm.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = rec.PersonId
where ml.IsDeleted=0 and ml.IsActive=1
and mp.MonthlyPensionId=@MonthlyPensionId
order by mp.[BatchStatusId]  asc
OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY

ELSE

select distinct per.FirstName [RecipientName]
      ,per.Surname [RecipientSurname]
      ,mp.[MonthlyPensionId]
      ,[Amount]
      , isnull(lgr.[AdditionalTax],0) as 'AdditionalTax'
      ,[VAT]
      ,[PAYE]
      ,[LedgerId]
      ,mp.[BatchStatusId] [BatchStatus]
      ,[ChangeReasonId] [ChangeReason]
	  ,ml.ModifiedDate 
from [pension].[MonthlyPensionLedger] ml
inner join [pension].[Ledger] lgr
on lgr.PensionLedgerId = ml.[LedgerId]
inner join [pension].MonthlyPension mp
on mp.MonthlyPensionId = ml.MonthlyPensionId
inner join [pension].[PensionClaimMap] cm
on cm.PensionClaimMapId = lgr.PensionClaimMapId
inner join [pension].[PensionRecipient] rec
on rec.PensionClaimMapId = cm.PensionClaimMapId
inner join [client].Person per
on per.RolePlayerId = rec.PersonId
where per.FirstName like ('%'+@searchCriteria+'%')
or  per.Surname like ('%'+@searchCriteria+'%')
and ml.IsDeleted=0 
and ml.IsActive=1
and ml.MonthlyPensionId=@MonthlyPensionId
order by ml.ModifiedDate 
OFFSET @offset ROWS 
FETCH NEXT @fetch ROWS ONLY


END