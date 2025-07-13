CREATE Procedure [marketing].[GetCampaignNameForDD]
(
@SearchCreatia varchar(200)
)
AS
Begin
	Select [marketing].Campaign.Id,
	[marketing].Campaign.Name [CampaignName]
	From	
	[marketing].Campaign
	where 
	[marketing].Campaign.IsDeleted =0 
	and  [marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%')
	order by [marketing].[Campaign].Name
END

--[marketing].[GetCampaignNameForDD] 'a'  -- Parameter  @SearchCreatia= a