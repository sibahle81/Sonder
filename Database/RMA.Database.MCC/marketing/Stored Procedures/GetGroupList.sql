CREATE   Procedure [marketing].[GetGroupList]
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
	 [marketing].[CampaignGroups]  
			where   [marketing].[CampaignGroups].IsDeleted = 0 
			and ([marketing].[CampaignGroups] .GroupName LIKE ('%'+ @SearchCreatia +'%')))

SET @RecordCount = (select 
		Count (*)
	from 
		[marketing].[CampaignGroups]  
			where   [marketing].[CampaignGroups].IsDeleted = 0 
			and ([marketing].[CampaignGroups] .GroupName LIKE ('%'+ @SearchCreatia +'%')))
	
select 
[marketing].[CampaignGroups].Id, 
[marketing].[CampaignGroups].GroupName, 
'' Count,
[marketing].[CampaignGroups].CreatedDate [DateTime], 
[marketing].[CampaignGroups].IsActive ,
[marketing].[CampaignGroups].IsDeleted , 
[marketing].[CampaignGroups].CreatedBy , 
[marketing].[CampaignGroups].CreatedDate , 
[marketing].[CampaignGroups].ModifiedBy , 
[marketing].[CampaignGroups].ModifiedDate 
,@RecordCount 
from [marketing].[CampaignGroups] 
where   [marketing].[CampaignGroups].IsDeleted = 0 
and ([marketing].[CampaignGroups] .GroupName LIKE ('%'+ @SearchCreatia +'%')) 
order by [marketing].[CampaignGroups].CreatedDate  desc
OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

--exec [marketing].[GetGroupList] 23,1,10,'','','a' -- Parameter @SearchCreatia   = a