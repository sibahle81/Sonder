
CREATE   PROCEDURE [Load].[GetConsolidatedFuneralSummary] @fileIdentifier uniqueidentifier
AS BEGIN

	declare @brokerEmail varchar(50) = '';
	select @brokerEmail = ISNULL([value],'gmocwiri@gmail.com') from common.Settings where [Key] = 'MatlaEmailAddress';

	select  cfm.PolicyId,  
		pol.PolicyNumber, 
		ClientName = cfm.MemberName,
		ClientEmail = cfm.Email,
		ClientCellNo = cfm.CelNo,
		BrokerEmail = @brokerEmail,
		PreferredCommunicationType = cfm.PreferredCommunication
	from [Load].[ConsolidatedFuneralMember] (NOLOCK) cfm
		INNER JOIN [policy].[Policy] (NOLOCK) pol on pol.PolicyId = cfm.PolicyId
	where [FileIdentifier] = @fileIdentifier
		and [CoverMemberTypeId] = 1

END