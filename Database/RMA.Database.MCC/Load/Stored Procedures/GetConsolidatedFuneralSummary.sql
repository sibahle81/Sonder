CREATE PROCEDURE [Load].[GetConsolidatedFuneralSummary] @fileIdentifier uniqueidentifier
AS BEGIN

	declare @brokerEmail varchar(512) = '';
	select @brokerEmail = ISNULL([value],'gmocwiri@gmail.com') from common.Settings where [Key] = 'MatlaEmailAddress';

	select cfm.PolicyId,  
		pol.PolicyNumber, 
		ClientName = cfm.MemberName,
		ClientIdNumber = cfm.IdNumber,
		ClientEmail = cfm.Email,
		ClientCellNo = cfm.CelNo,
		BrokerEmail = @brokerEmail,
		PreferredCommunicationType = cfm.PreferredCommunication,
		PaymentMethod = pol.PaymentMethodId,
		cast(iif(abs(datediff(minute, pol.CreatedDate, pol.ModifiedDate)) < 30, 1, 0) as bit) [NewPolicy]
	from [Load].[ConsolidatedFuneralMember] (NOLOCK) cfm
		inner join [policy].[Policy] (NOLOCK) pol on pol.PolicyId = cfm.PolicyId
	where [FileIdentifier] = @fileIdentifier
		and [CoverMemberTypeId] = 1

END