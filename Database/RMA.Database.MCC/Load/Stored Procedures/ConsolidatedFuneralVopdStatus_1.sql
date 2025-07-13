
CREATE   PROCEDURE [Load].[ConsolidatedFuneralVopdStatus] (@fileIdentifier uniqueidentifier)
AS BEGIN

	select [MemberType],
		[MemberName],
		[IdNumber],
		[DateOfBirth],
		[Age],
		[JoinDate],
		[VopdProcessStatus],
		[VopdStatus],
		[DateVerified]
	from (
		select distinct rt.[Name] [MemberType],
			m.[CoverMemberTypeId],
			concat(m.[FirstName], ' ', m.[Surname]) [MemberName],
			case len(m.[IdNumber]) when 13 then m.[IdNumber] else cast(m.[DateOfBirth] as varchar(16)) end [IdNumber],
			m.[DateOfBirth],
			m.[Age],
			cast(m.[JoinDate] as datetime) [JoinDate],
			iif(isnull(e.[Id], 0) > 0, 'Error', vs.[Name]) [VopdProcessStatus],
			iif(isnull(e.[Id], 0) > 0, 'VOPD check failed', vr.[Reason]) [VopdStatus],
			iif(isnull(e.[Id], 0) > 0, null, vr.[DateVerified]) [DateVerified]
		from [Load].[ConsolidatedFuneralMember] m with (nolock)
			inner join [client].[RolePlayerType] rt with (nolock) on rt.[RolePlayerTypeId] = m.[RolePlayerTypeId]
			left join [client].[UserVopdResponse] vr with (nolock) on vr.[IdNumber] = m.[IdNumber]
			left join [common].[VopdStatus] vs with (nolock) on vs.[Id] = vr.[VopdStatusId]
			left join [Load].[ConsolidatedFuneralError] e with (nolock) on 
				e.[FileIdentifier] = m.[FileIdentifier] and 
				e.[ErrorCategory] = 'VOPD' and
				e.[ErrorMessage] like concat('%', m.[IdNumber], ' could not be VOPD verified%')
		where m.[FileIdentifier] = @fileIdentifier
	) t
	order by [CoverMemberTypeId]

END