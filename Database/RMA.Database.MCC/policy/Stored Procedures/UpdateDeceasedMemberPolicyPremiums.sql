CREATE PROCEDURE [policy].[UpdateDeceasedMemberPolicyPremiums]
AS BEGIN
update pil set enddate = p.DateOfDeath
from policy.PolicyInsuredLives pil,
client.Person p
where p.RolePlayerId = pil.RolePlayerId
and p.DateOfDeath is not null
and p.DateOfDeath != '';
END