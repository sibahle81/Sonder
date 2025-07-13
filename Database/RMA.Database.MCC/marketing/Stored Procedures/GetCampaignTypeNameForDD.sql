CREATE Procedure [marketing].[GetCampaignTypeNameForDD]
(
@SearchCreatia varchar(200)
)
AS
Begin
	Select [marketing].CampaignType.Id,
	[marketing].CampaignType.Name [CampaignName]
	From	
	[marketing].CampaignType 
	where 
	[marketing].CampaignType.IsDeleted =0 
	and  [marketing].CampaignType.Name LIKE ('%'+ @SearchCreatia +'%')
	order by [marketing].CampaignType.Name
END

--[marketing].[GetCampaignTypeNameForDD] 'a'  -- Parameter  @SearchCreatia= a