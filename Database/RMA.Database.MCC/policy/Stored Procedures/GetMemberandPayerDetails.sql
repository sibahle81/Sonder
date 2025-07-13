
CREATE PROCEDURE [policy].[GetMemberandPayerDetails] (@wizardId int)
AS
BEGIN
SELECT top 1
       rla.AddressLine1 as 'Main Member Address Line 1',
       rlpa.AddressLine2 + ', ' + rla.PostalCode as 'Main Member Address Line 2',
       rlpa.AddressLine1 as 'Payer Member Address Line 1',
       crpm.CellNumber as 'Main Member Cellphone',
       crpm.EmailAddress as 'Main Member Email',
       crpp.CellNumber as 'Payer Member Cellphone',
       crpp.EmailAddress as 'Payer Member Email',

       FORMAT  (pp.CreatedDate, 'yyyy-MM-dd') as 'Issue Date',
       ccp.DateOfBirth 'Main Member Date Of Birth',
       ccp.IdNumber 'Main Member ID Number',
       ccp.FirstName + ' ' + ccp.Surname as 'Payer Member Name',
       ppy.DateOfBirth 'Payer Date Of Birth',
       ppy.IdNumber 'Payer Member ID Number',
       ppy.FirstName + ' ' + ccp.Surname as 'Payer Member Name'
from policy.Policy pp
inner join broker.Representative (NOLOCK) br on pp.RepresentativeId = br.Id
inner join Client.Person ccp (NOLOCK) on ccp.RolePlayerId =  pp.PolicyOwnerId
inner join [client].[RolePlayerAddress] (NOLOCK) rla on rla.RolePlayerId = pp.PolicyOwnerId
inner join [client].[RolePlayerAddress] (NOLOCK) rlpa on rlpa.RolePlayerId = pp.PolicyPayeeId
inner join [client].[RolePlayer] (NOLOCK) crpm on crpm.RolePlayerId =  pp.PolicyOwnerId
inner join [client].[RolePlayer] (NOLOCK) crpp on crpp.RolePlayerId =  pp.PolicyPayeeId
inner join Client.Person (NOLOCK) ppy on ppy.RolePlayerId = pp.PolicyPayeeId
where pp.PolicyId  =  @wizardId
END