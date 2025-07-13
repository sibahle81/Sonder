CREATE   Procedure [marketing].[GetMarketingGroupConditionEntity]
AS
select 0 id, 
' Select ' EntityName
,'' EntityDataType ,
'' EntityCondition  
union all 
select 
[marketing].MarketingGroupCondition.MarketingGroupConditionId Id, 
[marketing].MarketingGroupCondition.EntityName,
EntityDataType , 
EntityCondition  
from [marketing].[MarketingGroupCondition] 
where [marketing].[MarketingGroupCondition].IsDeleted = 0 
order by EntityName

--exec [marketing].[GetMarketingGroupConditionEntity]