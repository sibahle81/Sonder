create proc [client].GetGroupMemberDetailsPolicyDocumentsNotSent (@parentPolicyId as int)
as
/*
exec [client].GetGroupMemberDetailsPolicyDocumentsNotSent @parentPolicyId  = 300345
*/
begin
select 
distinct 
 PolicyId = pol.PolicyId,
 PolicyNumber = pol.PolicyNumber,
 RolePlayerId = rp.RolePlayerId,
 MemberName = rp.DisplayName,
 EmailAddress = isnull(rp.EmailAddress,''),
 IsEuropAssist = pol.IsEuropAssist,
 CellPhoneNumber = isnull(rp.CellNumber,''),
PreferredCommunicationTypeId = isnull(rp.PreferredCommunicationTypeId , 1) 
from [policy].[Policy] (nolock) pol 
inner join [client].RolePlayer (nolock) rp on rp.RolePlayerId = pol.PolicyOwnerId
left join [campaign].EmailAudit (nolock) eml on eml.ItemId   = pol.PolicyId and eml.ItemType = 'Policy' AND [Subject] like 'RMA Funeral Plan Policy Schedule%' 
where   
pol.PolicyStatusId  in (1,3,8,11,12,14,15,20)
and pol.ParentPolicyId = @parentPolicyId
 and eml.ItemId is null  
 
 end