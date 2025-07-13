CREATE PROC client.GetPolicyholdersCelebratingBirthdayToday
AS
BEGIN
/*
EXEC client.GetPolicyholdersCelebratingBirthdayToday
*/
select 
DISTINCT TOP 1
rp.RolePlayerId, 
DisplayName = [dbo].[InitCap](LOWER(rp.DisplayName)), 
rp.CellNumber, 
rp.EmailAddress, 
per.DateOfBirth,
'Message' = ''
from [policy].[Policy] (nolock) pol
inner join client.Person (nolock) per on per.RolePlayerId = pol.PolicyOwnerId
inner join client.RolePlayer (nolock) rp on rp.RolePlayerId = per.RolePlayerId
--LEFT JOIN TO SMS TABLE WHERE WE'VE NOT SENT BIRTHDAY SMS
WHERE pol.PolicyStatusId  IN (1,3,8,11,12,14,15,20)
AND LEN(ISNULL(rp.CellNumber,'')) = 10 
AND PER.DateOfDeath IS NULL
AND (DATEPART(d, DateOfBirth) = DATEPART(d, GETDATE()) AND DATEPART(m, DateOfBirth) = DATEPART(m, GETDATE()))
END