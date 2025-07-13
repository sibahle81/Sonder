
CREATE PROCEDURE policy.GetAffordabilityReport
as
select 
pp.PolicyNumber,
pp.InstallmentPremium,
case when ple.AffordabilityCheckPassed = 1 then 'Affordable' else 'Not Affordable' end as 'Status',
cp.IdNumber as 'PolicyOholdeIdNumber',
--1 as 'NumberOfAffordabilityChecksDone',
 ple.CreatedDate as 'DateOfFirstAffordabilityCheck',
dk.CreatedDate as 'DateOfLastAffordabilityCheck'

--case when ple.AffordabilityCheckPassed = 1 then qlt.[Name] else ple.AffordabilityCheckFailReason end 'ReasonForStatus',
--t.[Name] as 'TransctionType',
--case when JSON_VALUE(ql.Response, '$.StatusCode') = 200 then 'Passed' else 'Failed' end as 'ApiResponseStatusCode'

 from [documents].[DocumentKeys] dk
inner join [documents].[Document]  d on d.Id = dk.DocumentId
inner join [policy].Policy pp on dk.KeyValue = CAST(pp.PolicyId AS VARCHAR(10)) 
inner join [policy].PolicyLifeExtension ple on pp.PolicyId = ple.PolicyId
inner join [client].[Person] (NOLOCK) cp on cp.RolePlayerId = pp.PolicyOwnerId
where d.DocTypeId = 2584  -- Affordability Snapshort
--and ple.AffordabilityCheckPassed = 0 -- Only Affordable Policies
and (pp.PolicyStatusId = 1  or pp.PolicyStatusId = 20)  -- Active or FreeCover