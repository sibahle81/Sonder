CREATE   Procedure [marketing].[GetMarketingGroupConditionValue]
(
	@EntityName varchar(100)
)
AS
BEGIN	
select 
t.EntityName,
'' EntityDataType,
'' EntityCondition From (
SELECT  Distinct (CASE 
			WHEN @EntityName='Designation' THEN 
	  			  (             
	              	  [common].[ContactDesignationType].Name 
                  )
             when @EntityName='Gender' Then  
             	  (
		              case when isnull([client].Person.GenderId,'')='' then 'MALE' when [client].Person.GenderId=1 then 'MALE' else 'FEMALE' END               
                  ) 
        	 when @EntityName='City' Then  
        	 	  (
		               isnull([client].[RolePlayerAddress].City,'')               
                  )
             when @EntityName='Country' Then  
             	  (
		               isnull([common].Country.Name,'')               
                  )
  			 when @EntityName='Province' Then  
  			 	  (
		               isnull([client].[RolePlayerAddress].Province,'')               
                  )
             when @EntityName='CategoryBook' Then  
             	  (
		               isnull([common].[IndustryClass].Name,'')               
                  )
  			 when @EntityName='ClientType' Then  
  			 	  (
		               CASE WHEN [client].[Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company' ELSE 'Individual' END                
                  )                  
        END) AS EntityName 
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
   ) as t where isnull(t.EntityName,'') !=''  
   order by t.EntityName
END 

--exec [marketing].[GetMarketingGroupConditionValue] 'city'  --  Parameter @EntityName  = Age,CategoryBook,City,ClientType,Country,Designation,Gender,Province