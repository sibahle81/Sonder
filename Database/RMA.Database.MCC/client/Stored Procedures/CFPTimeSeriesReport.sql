CREATE    PROC [client].[CFPTimeSeriesReport]
as
begin

/*
	EXEC [client].[CFPTimeSeriesReport]
*/
  
 
SELECT 
DISTINCT
mainmember.PolicyHolderFullName,
mainmember.PolicyHolderIdNumber,
wd.Id as WorkflowReferenceNumber, 
WorkflowUniqueIdentifier = cfm.FileIdentifier,
WorkFlowDescription = wd.[Name],
tlead.created_at as LeadCreateDate,
ltt.LeadSubmitDate as LeadUpdateDate,
ltt.LeadSubmitDate,
ltt.LeadApiReceivedDate,
ltt.LeadServiceBusQueuedDate,
WorkFlowStartDate = wd.StartDateAndTime,
WorkFlowCompletedDate = wd.EndDateAndTime,
ws.[Name] as 'Status',
pol.PolicyNumber,
pol.CreatedDate as PolicyCreationDate, 
PolicyInceptiondate,
qt.CreatedDate as QLinkTransactionDate,
CASE WHEN qt.StatusCode = 200 then 'SUCCESS' ELSE CASE when qt.CreatedDate is null then NULL else 'FAILED' END END as QlinkStatus,
QLinkErrorMessage = CONVERT(VARCHAR(250), json_value(lower(qt.[Response]), '$.message')) ,
TotalTimeTaken = CONVERT(TIME,LeadSubmitDate -  pol.CreatedDate) ,
CONVERT(varchar(10),  FLOOR( DATEDIFF(ss, [ltt].[LeadSubmitDate], COALESCE( [qt].[CreatedDate],[pol].[CreatedDate] ,[wd].[EndDateAndTime],[wd].[StartDateAndTime] ,[ltt].[LeadServiceBusQueuedDate]))  / 3600 / 24 )) + ' day(s) ' +	
CONVERT(varchar(10),  FLOOR( DATEDIFF(ss,  [ltt].[LeadSubmitDate], COALESCE( [qt].[CreatedDate],[pol].[CreatedDate] ,[wd].[EndDateAndTime],[wd].[StartDateAndTime] ,[ltt].[LeadServiceBusQueuedDate] )) % (3600 * 24) /3600  )) + ' hour(s) ' +	
CONVERT(varchar(10),  FLOOR( DATEDIFF(ss, [ltt].[LeadSubmitDate], COALESCE( [qt].[CreatedDate],[pol].[CreatedDate] ,[wd].[EndDateAndTime],[wd].[StartDateAndTime] ,[ltt].[LeadServiceBusQueuedDate] )) %3600/60  )) + ' minute(s) ' + 
CONVERT(varchar(10),   DATEDIFF(ss,  [ltt].[LeadSubmitDate], COALESCE( [qt].[CreatedDate],[pol].[CreatedDate] ,[wd].[EndDateAndTime],[wd].[StartDateAndTime] ,[ltt].[LeadServiceBusQueuedDate] )) %60  ) + ' second(s)' AS [TimeLapsed]


FROM [Load].[LeadTimeTracker] (nolock) ltt
INNER JOIN [dbo].[TabletLead] (nolock) tlead on tlead.policy_request_guid = ltt.LeadClaimReference
INNER JOIN [Load].[ConsolidatedFuneralMember] (nolock) cfm ON ltt.LeadClaimReference =  CAST(cfm.[FileIdentifier] AS VARCHAR(50))
INNER JOIN bpm.Wizard wd on wd.Id = ltt.WizardId
inner join common.WizardStatus ws on ws.Id = wd.WizardStatusId
INNER JOIN load.ConsolidatedFuneral (nolock) cf on cf.FileIdentifier = cfm.FileIdentifier
OUTER APPLY(Select TOP 1 MainMemberIdNumber PolicyHolderIdNumber, MemberName PolicyHolderFullName  FROM [Load].[ConsolidatedFuneralMember] (nolock) cfm  where cf.FileIdentifier = cfm.FileIdentifier and RolePlayerTypeId = 10 )mainmember
LEFT JOIN [policy].[Policy] (nolock) pol on pol.PolicyId = ltt.PolicyId
LEFT JOIN [client].QlinkTransaction (nolock) qt on qt.ItemId = pol.PolicyId AND qt.ItemType = 'Policy'
--where pol.PolicyId = 290086
end