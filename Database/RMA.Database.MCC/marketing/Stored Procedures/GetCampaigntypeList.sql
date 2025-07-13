CREATE   Procedure [marketing].[GetCampaigntypeList]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@RecordCount INT = 0 OUTPUT
)
As
Begin 	
	DECLARE @SelectCount As NVARCHAR(MAX)	
SET @SelectCount = (select 
		Count (*)
	from 
		[marketing].[CampaignType]
INNER join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].[CampaignType].id 
where [marketing].[CampaignType].IsDeleted = 0 
and ([marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')) )

SET @RecordCount = (select count(*) From ( select count([marketing].[CampaignType].Id) CntRow
from 
[marketing].[CampaignType]
INNER join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].[CampaignType].id 
where [marketing].[CampaignType].IsDeleted = 0 
and ([marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%'))
Group By [marketing].[CampaignType].Id , [marketing].[CampaignType].Name, [marketing].[CampaignType].IsActive  , [marketing].[CampaignType].IsDeleted ,[marketing].[CampaignType].CreatedBy ,
[marketing].[CampaignType].CreatedDate , [marketing].[CampaignType].ModifiedBy, [marketing].[CampaignType].ModifiedDate
) as t 
)
	
select DISTINCT 
[marketing].[CampaignType].Id , 
[marketing].[CampaignType].Name,  
(select stuff((select ', '+  [security].[Role].Name
From [security].[Role]
inner join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].RoleId  = [security].[Role].Id  
and [marketing].[CampaignTypeApprover].ApproverType ='F' and [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].[CampaignType].Id and [marketing].[CampaignTypeApprover].IsDeleted =0 
for XML PATH('')),1,1,'') ) FinalApprover, 
(select stuff((select ', '+  [security].[Role].Name
From [security].[Role]
inner join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].RoleId  = [security].[Role].Id  
and [marketing].[CampaignTypeApprover].ApproverType ='N' and [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].[CampaignType].Id and [marketing].[CampaignTypeApprover].IsDeleted =0 
for XML PATH('')),1,1,'') ) Approvers, 
[marketing].[CampaignType].IsActive, 
[marketing].[CampaignType].IsDeleted , 
[marketing].[CampaignType].CreatedBy ,
[marketing].[CampaignType].CreatedDate , 
[marketing].[CampaignType].ModifiedBy, 
[marketing].[CampaignType].ModifiedDate, 
@RecordCount  
from 
[marketing].[CampaignType]
INNER join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].[CampaignType].id 
where [marketing].[CampaignType].IsDeleted = 0 
and ([marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%'))
order by [marketing].[CampaignType].CreatedDate  desc, [marketing].[CampaignType].ModifiedDate  desc
OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

--exec [marketing].[GetCampaigntypeList] 23,1,10,'','',''