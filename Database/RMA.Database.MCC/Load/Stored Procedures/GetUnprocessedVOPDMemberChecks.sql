
CREATE   PROCEDURE [Load].[GetUnprocessedVOPDMemberChecks]
AS BEGIN	
	select FileIdentifier, rt.[Name] [MemberType],
		concat(m.[FirstName], ' ', m.[Surname]) [MemberName],
		case len(m.[IdNumber]) when 13 then m.[IdNumber] else cast(m.[DateOfBirth] as varchar(16)) end [IdNumber],
		m.[DateOfBirth],
		m.[Age],
		vs.[Name] [VopdProcessStatus],
		vr.[Reason] [VopdStatus],
		vr.[DateVerified]
	from [Load].[ConsolidatedFuneralMember] m with (nolock)
		inner join [client].[RolePlayerType] rt with (nolock) on rt.[RolePlayerTypeId] = m.[RolePlayerTypeId]
		left join [client].[UserVopdResponse] vr with (nolock) on vr.[IdNumber] = m.[IdNumber]
		left join [common].[VopdStatus] vs with (nolock) on vs.[Id] = vr.[VopdStatusId]
		 where m.CoverMemberTypeId in (1,2) 
		  AND (ISNULL(vs.[Name],'') not in ('Processed')) OR rt.RolePlayerTypeId = 41
END