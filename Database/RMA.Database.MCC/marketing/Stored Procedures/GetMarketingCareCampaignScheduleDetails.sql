CREATE   PROCEDURE [marketing].[GetMarketingCareCampaignScheduleDetails] 
(
	@CampaignScheduleId int	
	, @TemplateId int 
	,@MultiGroupCondition varchar(max) 
)
AS
BEGIN 
	
Declare @TargetAud varchar(20)
Declare @MCampaignCId Int 
Declare @MChannelId varchar(50)
Declare @MCampaignTemplateId varchar(50)
Declare @MCampaignScheduleid int

set @TargetAud= (select top(1) common.MarketingAudienceType.Name from [marketing].CampaignSchedule inner join common.MarketingAudienceType on common.MarketingAudienceType.Id = [marketing].CampaignSchedule.MarketingAudienceTypeId where [marketing].CampaignSchedule.Id = @CampaignScheduleId and [marketing].CampaignSchedule.IsDeleted=0) 
set @MCampaignCId = (select top(1) [marketing].CampaignSchedule.CampaignId from [marketing].CampaignSchedule where [marketing].CampaignSchedule.Id =@CampaignScheduleId  and [marketing].CampaignSchedule.IsDeleted=0)
set @MCampaignTemplateId= (select stuff((select distinct ', '+  convert(varchar,[marketing].[TemplatesInformation].CampaignTemplatesId)  
			from [marketing].Campaign 
			Left Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId = [marketing].Campaign.Id 
			where [marketing].Campaign.Id=@MCampaignCId and [marketing].Campaign.IsDeleted =0 and [marketing].[TemplatesInformation].IsDeleted =0 for XML PATH('')),1,1,''))

			--	(select top(1) [marketing].[TemplatesInformation].CampaignTemplatesId  from [marketing].Campaign 
			--				Left Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId = [marketing].Campaign.Id 
			--				where [marketing].Campaign.Id=@MCampaignCId  and [marketing].Campaign.IsDeleted =0 and [marketing].[TemplatesInformation].IsDeleted =0 )  				
			
set @MChannelId=  (select stuff((select distinct ', '+  convert(varchar,[marketing].Channel.Id)  
  from [marketing].CampaignSchedule 
inner join [marketing].Campaign on [marketing].Campaign.id=[marketing].CampaignSchedule.CampaignId 
inner join [marketing].TemplatesInformation on [marketing].TemplatesInformation.CampaignId =[marketing].Campaign.id
inner join [marketing].CampaignTemplateChannels on [marketing].CampaignTemplateChannels.CampaignTemplateId =[marketing].TemplatesInformation.CampaignTemplatesId 
inner join [marketing].Channel on [marketing].Channel.Id = [marketing].CampaignTemplateChannels.ChannelId 
where [marketing].CampaignSchedule.Id = @CampaignScheduleId  and [marketing].CampaignSchedule.IsDeleted =0 and [marketing].Channel.IsDeleted =0 for XML PATH('')),1,1,'')) 

set @MCampaignScheduleid= (select top(1) [marketing].CampaignSchedule.Id from [marketing].CampaignSchedule  where [marketing].CampaignSchedule.CampaignId=@MCampaignCId and [marketing].CampaignSchedule.IsDeleted=0)

If @TargetAud = 'Contacts' 
select [Name], SurName,[Phone1], EMAIL, CampaignScheduleId, CampaignId, CampaignTemplateId, ChannelId, ChannelName,TemplateName, EmailSubject, TemplateId, Message
 from (
select  distinct
[marketing].CampaignScheduleContact.ContactName [Name], 
'' SurName, 
 [marketing].CampaignScheduleContact.ContactNumber [Phone1], 
 [client].[Roleplayer].EmailAddress  EMAIL, 
 [marketing].CampaignScheduleContact.CampaignScheduleId, 
 [marketing].[CampaignSchedule].CampaignId , 
 --@MCampaignTemplateId CampaignTemplateId ,
 [marketing].CampaignTemplateChannels.CampaignTemplateId, 
 [marketing].Channel.Id [ChannelId],
 [marketing].Channel.Name [ChannelName], 
 [marketing].CampaignTemplates.Name [TemplateName], 
 [marketing].CampaignTemplateChannels.EmailSubject, 
 [marketing].CampaignTemplates.Id [TemplateId], 
 [marketing].CampaignTemplateChannels.Message 

from [marketing].CampaignScheduleContact  
Inner Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id= [marketing].CampaignScheduleContact.CampaignScheduleId   
Inner Join [Client].[FinPayee] on [Client].[FinPayee].FinPayeNumber =[marketing].CampaignScheduleContact.MemberNumber 
Inner Join [client].[Roleplayer] on [client].[Roleplayer].RolePlayerId =[Client].[FinPayee].RolePlayerId 
inner join [marketing].Campaign on [marketing].Campaign.id=[marketing].CampaignSchedule.CampaignId 
inner join [marketing].TemplatesInformation on [marketing].TemplatesInformation.CampaignId =[marketing].Campaign.id
inner join [marketing].CampaignTemplateChannels on [marketing].CampaignTemplateChannels.CampaignTemplateId =[marketing].TemplatesInformation.CampaignTemplatesId 
inner join [marketing].Channel on [marketing].Channel.Id = [marketing].CampaignTemplateChannels.ChannelId 
inner join [marketing].CampaignTemplates on [marketing].CampaignTemplates.Id = [marketing].CampaignTemplateChannels.CampaignTemplateId 	
where [marketing].CampaignScheduleContact.CampaignScheduleId= @CampaignScheduleId
and [marketing].Campaign.IsDeleted =0 and [marketing].TemplatesInformation.IsDeleted =0 and [marketing].CampaignTemplates.IsDeleted =0 
and [marketing].CampaignTemplateChannels.IsDeleted =0 and [marketing].Channel.IsDeleted=0  
and [marketing].CampaignTemplates.Id = @TemplateId 
and [marketing].CampaignScheduleContact.IsDeleted = 0 
--order by [marketing].Channel.Id ,[client].[Roleplayer].DisplayName  
) as Tmp
order by TemplateName,ChannelId,[Name]

else if @TargetAud='groups'
BEGIN 	--select '' [Name],''SurName, '' Phone1,'' [EMAIL],'' CampaignScheduleId,  0 CampaignId, 0 CampaignTemplateId, 0 ChannelId, 0 ChannelName
	
 If @MultiGroupCondition = '' 			
 	BEGIN
 		select '' [Name],''SurName, '' Phone1,'' [EMAIL],'' CampaignScheduleId,  0 CampaignId, 0 CampaignTemplateId, 0 ChannelId, 0 ChannelName	
	 	--print 'NO RECORDS'		 	
 	END
ELSE 
BEGIN
		--Declare @conditons varchar(max)
		--Declare @GroupCondition varchar(max)
		drop table if exists #tbltempCondition
		declare @params varchar(max) = @MultiGroupCondition --'CategoryBook = @Metals@  | ClientType = @Company@ or Country = @South Africa@ or CategoryBook = @Mining@ or City = @FTY@ | ClientType = @Company@ or Country = @South Africa@ '
		select ROW_NUMBER() OVER (ORDER BY (SELECT 1)) AS Rnumber,value  into #tbltempCondition from STRING_SPLIT(@params, '|')
		--select * from #tbltempCondition
		drop table if exists #tbltempMaster
		CREATE TABLE #tbltempMaster 
				(
				    Phone1 VARCHAR(50),   
				    Name VARCHAR(250),
				    Surname VARCHAR(50),
				    Email VARCHAR(150),  			    
					CampaignScheduleId Int,
					CampaignId Int,
					CampaignTemplateId Int,
					ChannelId Int,
					ChannelName VARCHAR(50),
					TemplateName VARCHAR(50),
					EmailSubject VARCHAR(50),
					TemplateId Int, 
					Message VARCHAR(50) 
				)
		DECLARE @i INT
		DECLARE @DCount INT
		set @DCount= (select count(*) from #tbltempCondition)
		SET @i=1
		WHILE ( @i <= @DCount)
		BEGIN
		    Declare @GroupCondition varchar(max)		    
			SELECT @GroupCondition = value from #tbltempCondition where Rnumber=@i 
			
			set @GroupCondition = Replace(@GroupCondition, 'Designation','[common].[ContactDesignationType].Name')
			set @GroupCondition = Replace(@GroupCondition, 'Gender','[client].Person.GenderId')
			set @GroupCondition = Replace(@GroupCondition, 'City','[client].[RolePlayerAddress].City')
			set @GroupCondition = Replace(@GroupCondition, 'Country','[common].Country.Name')
			set @GroupCondition = Replace(@GroupCondition, 'Province','[client].[RolePlayerAddress].Province')
			set @GroupCondition = Replace(@GroupCondition, 'CategoryBook','[common].[IndustryClass].Name')
			set @GroupCondition = Replace(@GroupCondition, 'ClientType','[common].[IndustryClass].Name')
			set @GroupCondition = Replace(@GroupCondition, 'Age','[client].[Roleplayer].RolePlayerIdentificationTypeId')		
				set @GroupCondition  = ' where' + (select Replace(@GroupCondition,'@',''''))
				
				exec ('INSERT INTO #tbltempMaster (Phone1,Name,Surname,Email,CampaignScheduleId, CampaignId, CampaignTemplateId, ChannelId, ChannelName, TemplateName, EmailSubject, TemplateId, Message) 
					SELECT distinct top(2)
					[client].[Roleplayer].CellNumber Phone1, 		
					 [client].[Roleplayer].DisplayName Name, 
					 [client].Person.Surname Surname , 
					 [client].[Roleplayer].EmailAddress [Email],
					 '+@CampaignScheduleId+',0,0,0,NULL,NULL,NULL,0,NULL 	
					  from [client].FinPayee 
				    	LEFT join [client].RolePlayer on [client].RolePlayer.RolePlayerId = [client].FinPayee.RolePlayerId    
					    LEFT join [client].[RolePlayerAddress] on [client].[RolePlayerAddress].RolePlayerId  = [client].FinPayee .RolePlayerId   
					    LEFT join [client].Person on [client].Person.RolePlayerId = [client].FinPayee.RolePlayerId  
					    Left JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
				    	Left join [common].[IndustryClass] on [common].[IndustryClass].Id = [Company].IndustryClassId  
					    LEFT join [common].[Language] on [common].[Language].Id = [client].Person.LanguageId 
					    Left join [common].Country on [common].Country.Id = [client].RolePlayerAddress.CountryId  
					    Left join [client].[RolePlayerContact] on [client].[RolePlayerContact].RolePlayerId = [client].[Roleplayer].RolePlayerId
				    	LEFT join [common].[ContactDesignationType] on [common].[ContactDesignationType].Id = [client].[RolePlayerContact].ContactDesignationTypeId 
						 
		  			  ' + @GroupCondition   +' order by [client].[Roleplayer].CellNumber desc'
					 )	
		    SET @i  = @i  + 1
		END
		drop table if exists #tbltempCondition
		select distinct #tbltempMaster.Phone1, 
				#tbltempMaster.Name, 
				isnull(#tbltempMaster.Surname,'')Surname, 
				isnull(#tbltempMaster.Email,'')Email, 
				#tbltempMaster.CampaignScheduleId, 
				 [marketing].[CampaignSchedule].CampaignId ,  
				 [marketing].CampaignTemplateChannels.CampaignTemplateId, 
				 [marketing].Channel.Id [ChannelId],
				 [marketing].Channel.Name [ChannelName], 
				 [marketing].CampaignTemplates.Name [TemplateName], 
				 [marketing].CampaignTemplateChannels.EmailSubject, 
				 [marketing].CampaignTemplates.Id [TemplateId], 
				 [marketing].CampaignTemplateChannels.Message 
		from #tbltempMaster 
			inner join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id =    #tbltempMaster.CampaignScheduleId
			--Inner join  #tbltempMaster  on  #tbltempMaster.CampaignScheduleId  = [marketing].[CampaignSchedule].Id 
			inner join [marketing].Campaign on [marketing].Campaign.id=[marketing].CampaignSchedule.CampaignId 
			inner join [marketing].TemplatesInformation on [marketing].TemplatesInformation.CampaignId =[marketing].Campaign.id
			inner join [marketing].CampaignTemplateChannels on [marketing].CampaignTemplateChannels.CampaignTemplateId =[marketing].TemplatesInformation.CampaignTemplatesId 
			inner join [marketing].Channel on [marketing].Channel.Id = [marketing].CampaignTemplateChannels.ChannelId 
			inner join [marketing].CampaignTemplates on [marketing].CampaignTemplates.Id = [marketing].CampaignTemplateChannels.CampaignTemplateId 	
			where [marketing].Campaign.IsDeleted =0 and [marketing].TemplatesInformation.IsDeleted =0 and [marketing].CampaignTemplates.IsDeleted =0 
			and [marketing].CampaignTemplateChannels.IsDeleted =0 and [marketing].Channel.IsDeleted=0   
			and [marketing].CampaignTemplates.Id = @TemplateId 
			order by [marketing].CampaignTemplates.Name,[marketing].Channel.Id,#tbltempMaster.Name 
		drop table if exists #tbltempMaster 
--ELSE 
	--BEGIN
--	print 'NO RECORDS'	
		END
END 

ELSE 
	print 'NO DATA'
END 


--exec [marketing].GetMarketingCareCampaignScheduleDetails 78, 103, ''  -- Parameter is @CampaignScheduleId=58 , @TemplateId =104  is Template Id, @MultiGroupCondition='CategoryBook = @Metals@  | ClientType = @Company@ or Country = @South Africa@ or CategoryBook = @Mining@ or City = @FTY@ | ClientType = @Company@ or Country = @South Africa@ '