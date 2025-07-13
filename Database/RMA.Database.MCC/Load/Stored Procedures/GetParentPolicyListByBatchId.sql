 

create proc [Load].[GetParentPolicyListByBatchId] (@batchId as int)
as
/*
exec [Load].[GetParentPolicyListByBatchId] @batchId  = 1
*/
begin
select 
distinct 
 PolicyId = 0,
 PolicyNumber = [ParentPolicyNumber] ,
 RolePlayerId = 0,
 MemberName = EmailAddress,
 EmailAddress =  EmailAddress,
 PolicyScheduleName = PolicySchedule,
 PolicyTermsAndConditions = TermsAndConditions
from [Load].[GroupPolicyScheduleBatch] (nolock)
where   [BatchId] = @batchId and [IsProcessed] = 0 
 end