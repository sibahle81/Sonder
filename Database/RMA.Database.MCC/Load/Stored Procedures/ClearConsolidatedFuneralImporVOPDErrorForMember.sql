CREATE PROCEDURE [Load].[ClearConsolidatedFuneralImporVOPDErrorForMember] 
(
	@MemberIdNumber VARCHAR(20),
	@DeceasedStatusMessage VARCHAR(500),
	@FileIdentifier VARCHAR(40)
)
AS 
BEGIN
DECLARE @ConsolidatedFuneralErrorTemp TABLE 
(
	Id INT IDENTITY(1,1),
	FileIdentifier VARCHAR(50),
	MainMemberName VARCHAR(50) NULL,
	MainMemberIdNumber VARCHAR(50) NULL,
	MemberType VARCHAR(50) NULL
)

	/*
		EXEC [Load].[ClearConsolidatedFuneralImporVOPDErrorForMember] @MemberIdNumber = '8701300435083'
	*/ 

	--1. get VOPD status, then either update or insert for this ID Number

	DECLARE @MemberType varchar (50);

	select @MemberType =rt.[Name]	 
	from [Load].[ConsolidatedFuneralMember] m with (nolock)
		inner join [client].[RolePlayerType] rt with (nolock) on rt.[RolePlayerTypeId] = m.[RolePlayerTypeId]
		left join [client].[UserVopdResponse] vr with (nolock) on vr.[IdNumber] = m.[IdNumber]		 
	where m.FileIdentifier = @FileIdentifier and (m.IdNumber= @MemberIdNumber) -- OR m.DateOfBirth = @MemberIdNumber)

	INSERT @ConsolidatedFuneralErrorTemp
	select 
	m.[FileIdentifier],  
	m.MemberName,
	m.MainMemberIdNumber,
	rt.[Name]	 
	from [Load].[ConsolidatedFuneralMember] m with (nolock)
		inner join [client].[RolePlayerType] rt with (nolock) on rt.[RolePlayerTypeId] = m.[RolePlayerTypeId]
		left join [client].[UserVopdResponse] vr with (nolock) on vr.[IdNumber] = m.[IdNumber]		 
		where m.FileIdentifier = @FileIdentifier and (m.IdNumber= @MemberIdNumber)-- or m.DateOfBirth = @MemberIdNumber)

	DELETE [Load].ConsolidatedFuneralError
	WHERE ErrorCategory = 'VOPD' AND 
	(ErrorMessage LIKE '%' + @MemberIdNumber +' could not be VOPD verified%' 
	OR ErrorMessage LIKE '%' + @MemberIdNumber +' does not match VOPD%'
	OR ErrorMessage LIKE '%' + @MemberIdNumber +' did not pass VOPD check%'
	 )	  
	--TO DO, GET FILEID, SET WIZARD TO INPROGRESS

	IF (@DeceasedStatusMessage != '' AND @MemberType != 'Spouse')
	BEGIN
		INSERT [Load].ConsolidatedFuneralError (FileIdentifier,MainMemberIdNumber, MainMemberName, ErrorCategory, ErrorMessage, ErrorDate, NotificationStatusId)
		SELECT FileIdentifier,MainMemberIdNumber, MainMemberName, 'VOPD', '('+ MemberType +')'+ @DeceasedStatusMessage, GETDATE(), 1
		FROM @ConsolidatedFuneralErrorTemp
	END
	SELECT @@ROWCOUNT;
end

/*
select * from [Load].ConsolidatedFuneralError where ErrorMessage like '%dece%'
order by 1 desc

select * from client.UserVopdResponse where IdNumber ='8701300435083'
select * from client.Person where IdNumber ='8701300435083'

select * from [Load].ConsolidatedFuneralError where ErrorMessage like '%6704280000089%'
order by 1 desc
*/