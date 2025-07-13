 
CREATE  PROCEDURE [Load].[GetCFPSummaryByProductOptionIdBrogerageId] 
(
 @productOptionId int = 133,
 @brokerageId int = 96
)
as 
begin
/*

EXEC [Load].[GetCFPSummaryByProductOptionIdBrogerageId] @productOptionId = 133, @brokerageId  = 96

*/
declare @brokerEmail varchar(50) = '';
select @brokerEmail = ISNULL([value],'gmocwiri@gmail.com') 
from common.Settings 
where [Key] = 'MatlaEmailAddress';

select 
TOP 10
pol.PolicyId,  
PolicyNumber, 
ClientName = DisplayName,
ClientEmail = EmailAddress,
ClientCellNo = CellNumber,
BrokerEmail = @brokerEmail,
PreferredCommunicationType = ISNULL(PreferredCommunicationTypeId,3)
from [policy].[Policy] (NOLOCK) pol 
inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = pol.PolicyOwnerId
left join campaign.EmailAudit ea (nolock) on ea.ItemId = pol.PolicyId and ea.ItemType = 'Policy'
left join campaign.SmsAudit sa (nolock) on sa.ItemId = pol.PolicyId and sa.ItemType = 'Policy'
WHERE ProductOptionId = @productOptionId 
and BrokerageId = @brokerageId
and ea.ItemId is null
and sa.ItemId is null


END