CREATE PROCEDURE [medical].[GetMedicalBusinessProcesses]
	@WorkPoolId INT,
	@UserID INT = NULL,
	@PageIndex	INT ,
    @PageSize	INT = 5,
	@RecordCount	INT = 0 OUTPUT ,
	@SearchQuery    VARCHAR(200) = '',
	@SortColumn		VARCHAR(Max) = 'PA.PreAuthId',
	@SortOrder		CHAR(4) = 'ASC'
AS

--========================================================================--
--Declare @WorkPoolId INT = 10,
--	@UserID INT = 2265,
--	@PageIndex INT = 1, 
--	@PageSize   INT= 5,
--	@SortColumn		VARCHAR(30)= 'PA.PreAuthId',
--	@SortOrder		CHAR(4) = 'ASC',
--	@RecordCount	INT = 0,
--	@SearchQuery    VARCHAR(200) = ''
--========================================================================--

BEGIN
	
	SET NOCOUNT ON   

	Declare @Ticks AS BIGINT = 9999999999999
	Declare @Select AS NVARCHAR(MAX)
	Declare @Select1 AS NVARCHAR(MAX)
	Declare @Select2 AS NVARCHAR(MAX)
	Declare @Select3 AS NVARCHAR(MAX)
	Declare @Select4 AS NVARCHAR(MAX)
	Declare @Select5 AS NVARCHAR(MAX)
	Declare @SelectCount As NVARCHAR(MAX)
	Declare @SelectCount2 As NVARCHAR(MAX)
	Declare @WhereClause AS NVARCHAR(MAX)
	Declare @UserEmail Nvarchar(50) = NULL
	Declare @RoleId AS INT
	Declare @RoleName varchar(100)
	Declare @Query varchar(max) = null
	DECLARE @ParamDefinition AS NVARCHAR(50)
	Declare @MAAMedicalPoolId AS INT
	Declare @CCAMedicalPoolId AS INT
	Declare @PMCAMedicalPoolId AS INT	
	Declare @MAARoleId AS INT
	Declare @CCARoleId AS INT
	Declare @PMCARoleId AS INT	

	IF EXISTS (SELECT 1 FROM [common].[FeatureFlagSettings] WHERE [Key] = 'MedicalWorkPoolEnhancement' AND Value = 'true' AND IsActive = 1 AND IsDeleted = 0)
	BEGIN
	
	IF (@SearchQuery NOT IN ('', '0', '1', 'Role', 'User'))
	BEGIN
		SET @Query = '(PA.PreAuthNumber like ''%' + @SearchQuery + '%'' OR claim.ClaimReferenceNumber like ''%' + @SearchQuery + '%'')'
	END

	IF (@UserID IS NOT NULL)
	BEGIN
		Select @UserEmail = Email From [security].[User] where Id= @UserID
		Select @RoleName = R.[Name], @RoleId = U.RoleId from [Security].[User] U Inner Join Security.[Role] R On U.RoleId = R.Id Where U.Id=@UserID
	END

	SELECT @MAAMedicalPoolId = Id FROM security.Permission WHERE [Name] = 'MAA Medical Pool'
	SELECT @CCAMedicalPoolId = Id FROM security.Permission WHERE [Name] = 'CCA Medical Pool'
	SELECT @PMCAMedicalPoolId = Id FROM security.Permission WHERE [Name] = 'PMCA Medical Pool'
	SELECT @MAARoleId = Id FROM security.Role WHERE [Name] = 'Medical Admin Assistant'
	SELECT @CCARoleId = Id FROM security.Role WHERE [Name] = 'Clinical Claims Adjudicator: Medical'
	SELECT @PMCARoleId = Id FROM security.Role WHERE [Name] = 'Pensioner Medical Case Auditor'

	IF EXISTS (SELECT 1 FROM security.RolePermission WHERE RoleId = @RoleId AND PermissionId = @MAAMedicalPoolId)
	BEGIN
		IF (@SearchQuery = 'Role')
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@MAARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, 0) = 0 AND PA.PreAuthStatusId in (2)'
		END
		ELSE IF (@SearchQuery = 'User')
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@MAARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, 0) > 0 AND PA.PreAuthStatusId in (2)'
		END
		ELSE
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@MAARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, '+CAST(@UserID AS VARCHAR)+') = '+CAST(@UserID AS VARCHAR)+' AND PA.PreAuthStatusId in (2)'
		END
	END
	ELSE IF EXISTS (SELECT 1 FROM security.RolePermission WHERE RoleId = @RoleId AND PermissionId = @CCAMedicalPoolId)
	BEGIN
		IF (@SearchQuery = 'Role')
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@CCARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, 0) = 0 AND PA.PreAuthStatusId in (2)'
		END
		ELSE IF (@SearchQuery = 'User')
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@CCARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, 0) > 0 AND PA.PreAuthStatusId in (2)'
		END
		ELSE
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@CCARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, '+CAST(@UserID AS VARCHAR)+') = '+CAST(@UserID AS VARCHAR)+' AND PA.PreAuthStatusId in (2)'
		END
	END
	ELSE IF EXISTS (SELECT 1 FROM security.RolePermission WHERE RoleId = @RoleId AND PermissionId = @PMCAMedicalPoolId)
	BEGIN
		IF (@SearchQuery = 'Role')
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@PMCARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, 0) = 0 AND PA.PreAuthStatusId in (2)'
		END
		ELSE IF (@SearchQuery = 'User')
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@PMCARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, 0) > 0 AND PA.PreAuthStatusId in (2)'
		END
		ELSE
		BEGIN
			SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND MWF.AssignedToRoleId = '+CAST(@PMCARoleId AS VARCHAR)+' AND ISNULL(MWF.AssignedToUserId, '+CAST(@UserID AS VARCHAR)+') = '+CAST(@UserID AS VARCHAR)+' AND PA.PreAuthStatusId in (2)'
		END
	END
	ELSE
		SET @WhereClause = ' WHERE U.IsInternalUser = 0 AND ISNULL(MWF.AssignedToUserId, 0) = '+CAST(@UserID AS VARCHAR)+' AND PA.PreAuthStatusId in (2)'
		
	IF (@SortColumn = 'UserSLAHours')
	BEGIN
		SET @SortColumn = 'bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,Wizard.EndDateAndTime)'
	END

	IF (@SortColumn = 'OverAllSLAHours')
	BEGIN
		SET @SortColumn = 'bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,CASE WHEN PA.PreAuthId IS NULL THEN CASE WHEN  (select top 1 MW.EndDateTime from medical.Workflow MW where MW.ReferenceId = PA.PreAuthId order by MW.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime WHEN  (select top 1 MW.EndDateTime from medical.Workflow MW where MW.ReferenceId = PA.PreAuthId order by MW.WorkflowId desc) IS NOT NULL THEN (select top 1 MW.EndDateTime from medical.Workflow MW where MW.ReferenceId = PA.PreAuthId order by MW.ClaimWorkflowId desc) END
		ELSE (select top 1 MW.EndDateTime from [medical].[PreAuthorisation] PA0 INNER JOIN medical.Workflow MW ON PA0.PreAuthId = MW.ReferenceId where PA0.PreAuthId = PA.PreAuthId order by MW.WorkflowId desc) END)'
	END

	IF (@SortColumn = 'lastWorkedOn')
	BEGIN
		SET @SortColumn = 	'CASE WHEN PA.PreAuthId IS NOT NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW INNER JOIN security.[User] SU ON MW.AssignedToUserId = SU.Id where MW.ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
		WHEN PA.PreAuthId IS NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW INNER JOIN security.[User] SU ON MW.AssignedToUserId = SU.Id where MW.ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) END'
	END

	SET @Select = 'Select CONVERT(INT, Row - 1) AS RowIndex,
	CONVERT(INT, WP.WizardId) AS WizardId,
	CONVERT(INT, WP.ReferenceId) AS ReferenceId,
	WP.ReferenceType,
	WP.PreAuthNumber AS ReferenceNumber,
	WP.ClaimReferenceNumber,
	WP.AssignedToUserId,
	WP.AssignedToRoleId,
	WP.Name,
	WP.PreAuthStatus,	
	CONVERT(INT, WP.UserId) AS UserId,
	WP.UserEmail,
	WP.CreatedBy,
	CONVERT(INT, WP.PreAuthCreatedById) AS PreAuthCreatedById,
	WP.StartDateAndTime AS StartDateTime,
	WP.EndDateAndTime AS EndDateTime,
	WP.UserName,
	WP.AssignedToUser,
	WP.DateCreated,
	WP.UserSLA,
	WP.OverAllSLA,
	WP.PreAuthType,
	WP.NUserSLA,
	WP.NOverAllSLA,
	WP.LastWorkedOn,
	WP.UserSLAHours,
	WP.OverAllSLAHours,
	CONVERT(INT, WP.WizardUserId) AS WizardUserId,
	WP.WizardURL,
	CONVERT(INT, WP.LastWorkedOnUserId) AS LastWorkedOnUserId,	
	CONVERT(INT, WP.WizardConfigurationId) AS WizardConfigurationId,
	CONVERT(INT, WP.WizardStatusId) AS WizardStatusId,
	WP.WizardStatus,
	WP.Data,
	' + CONVERT(VARCHAR, @WorkPoolId) +' AS WorkPoolId,
	WP.Description,
	WP.CurrentStepIndex,
	WP.PersonEventId,
	ISNULL(WP.LockedToUserId, 0) AS LockedToUserId,
	ISNULL(WP.LockedToUser, '''') AS LockedToUser

	From
	(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY ' + @SortColumn + ' ' + @SortOrder + ') AS Row,
	PA.PreAuthId,
	PA.PreAuthNumber,
	ISNULL(PA.PreAuthStatusId, 0) AS PreAuthStatusId,
	claim.ClaimReferenceNumber,
	MWF.AssignedToUserId AS AssignedToUserId,
	Wizard.CustomRoutingRoleId AS AssignedToRoleId,
	Wizard.Name,
	U.Id AS UserId,
	ISNULL(Wizard.LockedToUser, '''') as UserEmail,
	PA.CreatedBy,
	U.Id AS PreAuthCreatedById,	
	Wizard.StartDateAndTime,
	ISNULL(Wizard.EndDateAndTime, GETDATE()) EndDateAndTime,
	PA.CreatedBy AS UserName,
	U2.Email AS AssignedToUser,
	PA.CreatedDate AS DateCreated,
	ISNULL(PA.PreAuthStatusId, 0) AS PreAuthStatus,	
	WS.[Name] AS WizardStatus,
	''PreAuthorisation'' AS ReferenceType,
	'

	Set @Select1 = '
	CAST(DATEADD(SECOND, 0, ''1900-01-01'') AS TIME) As UserSLA,
	CAST(DATEADD(SECOND, 360, ''1900-01-01'') AS TIME) As OverAllSLA,
	0 As NUserSLA,
	bpm.CalculateOverAllSLA(Wizard.StartDateAndTime,CASE WHEN PA.PreAuthId IS NULL THEN CASE WHEN  (select top 1 MW.EndDateTime from [medical].[Workflow] MW where MW.ReferenceId = PA.PreAuthId order by MW.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime END ELSE (select top 1 MW2.EndDateTime from [medical].[PreAuthorisation] PA1 INNER JOIN [medical].[Workflow] MW2 ON PA1.PreAuthId = MW2.ReferenceId where PA1.PreAuthId = PA.PreAuthId order by MW2.WorkflowId desc) END,WConfig.SLAWarning,WConfig.SLAEscalation) As NOverAllSLA,
	CASE WHEN PA.PreAuthId IS NOT NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW3 INNER JOIN security.[User] SU ON MW3.AssignedToUserId = SU.Id where ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW3.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	WHEN PA.PreAuthId IS NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW4 INNER JOIN security.[User] SU ON MW4.AssignedToUserId = SU.Id where ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW4.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	END as LastWorkedOn, 
	bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,Wizard.EndDateAndTime) As UserSLAHours,
	bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,CASE WHEN PA.PreAuthId IS NULL THEN CASE WHEN  (select top 1 MW5.EndDateTime from medical.Workflow MW5 where MW5.ReferenceId = PA.PreAuthId order by MW5.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime WHEN  (select top 1 MW6.EndDateTime from medical.Workflow MW6 where MW6.ReferenceId = PA.PreAuthId order by MW6.WorkflowId desc) IS NOT NULL THEN (select top 1 MW7.EndDateTime from medical.Workflow MW7 where MW7.ReferenceId = PA.PreAuthId order by MW7.WorkflowId desc) END
	ELSE (select top 1 MW8.EndDateTime from [medical].[PreAuthorisation] PA3 INNER JOIN medical.Workflow MW8 ON PA3.PreAuthId = MW8.ReferenceId where PA3.PreAuthId = PA.PreAuthId order by MW8.WorkflowId desc) END) As OverAllSLAHours,
	0 As WizardUserId,	
	'

	Set @Select2 ='
	(select Top 1 MW9.AssignedToUserId from medical.Workflow MW9 INNER JOIN security.[User] SU ON MW9.AssignedToUserId = SU.Id where MW9.ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW9.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) as LastWorkedOnUserId, 
	Wizard.id As WizardId,
	Wizard.WizardConfigurationId,
	Wizard.WizardStatusId,
	Wizard.Data,
	MWF.WorkpoolId,
	MWF.Description,
	Wizard.CurrentStepIndex,
	PA.PreAuthId AS ReferenceId,	
	ISNULL(PA.PreAuthTypeId, 0) AS PreAuthType,
	PA.PersonEventId,
	ISNULL(MWF.WizardURL, '''') AS WizardURL,
	MWF.LockedToUserId,
	U3.Email AS LockedToUser
	FROM claim.Claim claim WITH (NOLOCK)
	INNER JOIN [medical].PreAuthorisation PA WITH (NOLOCK) ON claim.PersonEventId = PA.PersonEventId
	INNER JOIN [common].[PreAuthStatus] PAS ON PA.PreAuthStatusId = PAS.Id
	INNER JOIN [common].[PreAuthType] PAT ON PA.PreAuthTypeId = PAT.Id
	INNER JOIN [security].[User] U WITH (NOLOCK) ON U.Email = PA.CreatedBy
	INNER JOIN [security].[Role] Role ON U.[RoleId] = Role.[Id]
	LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid = claim.claimstatusid 
	LEFT JOIN claim.PersonEvent personevent ON claim.PersonEventId = personevent.PersonEventId   
	LEFT JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid   
	LEFT JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN bpm.Wizard Wizard WITH (NOLOCK) ON PA.PreAuthId = Wizard.LinkedItemId   
	INNER JOIN [common].[WizardStatus] WS ON Wizard.WizardStatusId = WS.Id
	INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = Wizard.WizardConfigurationId	
	INNER JOIN [medical].[Workflow] MWF ON Wizard.Id = MWF.WizardId
	LEFT JOIN [security].[User] U2 WITH (NOLOCK) ON MWF.AssignedToUserId = U2.Id
	LEFT JOIN [security].[User] U3 WITH (NOLOCK) ON MWF.LockedToUserId = U3.Id
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId 
	' + @WhereClause + COALESCE(' And ' + @Query, '') + ' ) WP '

	SET @SelectCount = 'SELECT DISTINCT @RecordCount = COUNT(PA.PreAuthId) 
	FROM claim.Claim claim WITH (NOLOCK)
	INNER JOIN [medical].PreAuthorisation PA WITH (NOLOCK) ON claim.PersonEventId = PA.PersonEventId
	INNER JOIN [common].[PreAuthStatus] PAS ON PA.PreAuthStatusId = PAS.Id
	INNER JOIN [common].[PreAuthType] PAT ON PA.PreAuthTypeId = PAT.Id
	INNER JOIN [security].[User] U WITH (NOLOCK) ON U.Email = PA.CreatedBy
	INNER JOIN [security].[Role] Role ON U.[RoleId] = Role.[Id]
	LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid = claim.claimstatusid 
	LEFT JOIN claim.PersonEvent personevent ON claim.PersonEventId = personevent.PersonEventId   
	LEFT JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid   
	LEFT JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN bpm.Wizard Wizard WITH (NOLOCK) ON PA.PreAuthId = Wizard.LinkedItemId   
	INNER JOIN [common].[WizardStatus] WS ON Wizard.WizardStatusId = WS.Id
	INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = Wizard.WizardConfigurationId	
	INNER JOIN [medical].[Workflow] MWF ON Wizard.Id = MWF.WizardId
	LEFT JOIN [security].[User] U2 WITH (NOLOCK) ON MWF.AssignedToUserId = U2.Id
	LEFT JOIN [security].[User] U3 WITH (NOLOCK) ON MWF.LockedToUserId = U3.Id
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId 
	' + @WhereClause + COALESCE(' And ' + @Query, '') + '' 
	--select @SelectCount	
	--print @Select1
	--print @Select2

	SET @Select = @Select + @Select1 + @Select2 + ' WHERE Row BETWEEN ' + CAST((@PageIndex - 1) * @PageSize + 1 AS NVARCHAR) + ' AND ' + CAST(@PageIndex*@PageSize AS NVARCHAR)
	--SET @Select = @Select + @Select3 + @Select4 + @Select5 + ' WHERE Row BETWEEN ' + CAST((@PageIndex - 1) * @PageSize + 1 AS NVARCHAR) + ' AND ' + CAST(@PageIndex*@PageSize AS NVARCHAR)
	--SELECT @Select
	EXEC SP_EXECUTESQL @Select

	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount, @ParamDefinition, @RecordCount OUTPUT

	END
	ELSE
	BEGIN

	if(@SearchQuery <> '')
	 Begin
		set @Query = '(PA.PreAuthId like ''%' + @SearchQuery + '%''
		OR PA.PreAuthNumber like ''%' + @SearchQuery + '%''
		OR claim.ClaimReferenceNumber like ''%' + @SearchQuery + '%''
		OR personevent.personeventId like ''%' + @SearchQuery + '%'' 
		OR roleplayer.DisplayName like ''%' + @SearchQuery + '%''
		OR Role.[Name] like ''%' + @SearchQuery + '%''
		OR U2.[Email] like ''%' + @SearchQuery + '%''
		OR PA.CreatedBy like ''%' + @SearchQuery + '%'')'
	 End

	if(@UserID IS NOT NULL)
		Begin
			Select @UserEmail = Email From [security].[User] where Id= @UserID
			Select @RoleName = R.[Name] from [Security].[User] U Inner Join Security.[Role] R On U.RoleId = R.Id Where U.Id=@UserID
		End

	IF (@WorkPoolId = 10) 
	BEGIN
		IF (@RoleName = 'Medical Manager')
			SET @WhereClause = ' WHERE U.IsInternalUser = 1 AND Wizard.WizardConfigurationId IN(67,70,74,80,81) AND PA.PreAuthStatusId in (1,2,3,6)'
		ELSE
		IF (@RoleName = 'Claims Manager')
			SET @WhereClause = ' WHERE U.IsInternalUser = 1 AND Wizard.WizardConfigurationId IN(67,70,74,80,81) AND PA.PreAuthStatusId in (1,2,3,6)'
		ELSE
			SET @WhereClause = ' WHERE U.IsInternalUser = 1 AND Wizard.WizardConfigurationId IN(67,70,74,80,81) AND PA.PreAuthStatusId in (1,2,3,6)'
		SET @SelectCount = @SelectCount + ' WHERE Wizard.LockedToUser IS NULL AND PA.PreAuthStatusId in (1,2,3,6)'
	END

	if(@SortColumn = 'UserSLAHours')
	Begin
	set @SortColumn = 'bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,Wizard.EndDateAndTime)'
	End

	if(@SortColumn = 'OverAllSLAHours')
	Begin
	set @SortColumn = 'bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,CASE WHEN PA.PreAuthId IS NULL THEN CASE WHEN  (select top 1 MW.EndDateTime from medical.Workflow MW where MW.ReferenceId = PA.PreAuthId order by MW.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime WHEN  (select top 1 MW.EndDateTime from medical.Workflow MW where MW.ReferenceId = PA.PreAuthId order by MW.WorkflowId desc) IS NOT NULL THEN (select top 1 MW.EndDateTime from medical.Workflow MW where MW.ReferenceId = PA.PreAuthId order by MW.ClaimWorkflowId desc) END
	ELSE (select top 1 MW.EndDateTime from [medical].[PreAuthorisation] PA0 INNER JOIN medical.Workflow MW ON PA0.PreAuthId = MW.ReferenceId where PA0.PreAuthId = PA.PreAuthId order by MW.WorkflowId desc) END)'
	End

	if(@SortColumn = 'lastWorkedOn')
	BEGIN
	SET @SortColumn = 	'CASE WHEN PA.PreAuthId IS NOT NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW INNER JOIN security.[User] SU ON MW.AssignedToUserId = SU.Id where MW.ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	WHEN PA.PreAuthId IS NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW INNER JOIN security.[User] SU ON MW.AssignedToUserId = SU.Id where MW.ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) END'
	END

	SET @Select = 'Select 
	CONVERT(INT, WP.WizardId) AS WizardId,
	CONVERT(INT, WP.ReferenceId) AS ReferenceId,
	WP.ReferenceType,
	WP.PreAuthNumber AS ReferenceNumber,
	WP.ClaimReferenceNumber,
	WP.AssignedToUserId,
	WP.AssignedToRoleId,
	WP.Name,
	WP.PreAuthStatus,
	
	CONVERT(INT, WP.UserId) AS UserId,
	WP.UserEmail,
	WP.CreatedBy,
	CONVERT(INT, WP.PreAuthCreatedById) AS PreAuthCreatedById,
	WP.StartDateAndTime AS StartDateTime,
	WP.EndDateAndTime AS EndDateTime,
	WP.UserName,
	WP.AssignedToUser,
	WP.DateCreated,
	WP.UserSLA,
	WP.OverAllSLA,
	WP.PreAuthType,
	WP.NUserSLA,
	WP.NOverAllSLA,
	WP.LastWorkedOn,
	WP.UserSLAHours,
	WP.OverAllSLAHours,
	CONVERT(INT, WP.WizardUserId) AS WizardUserId,
	WP.WizardURL,
	CONVERT(INT, WP.LastWorkedOnUserId) AS LastWorkedOnUserId,	
	CONVERT(INT, WP.WizardConfigurationId) AS WizardConfigurationId,
	CONVERT(INT, WP.WizardStatusId) AS WizardStatusId,
	WP.WizardStatus,
	WP.Data,
	' + CONVERT(VARCHAR, @WorkPoolId) +' AS WorkPoolId,
	WP.CurrentStepIndex
	From
	(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY ' + @SortColumn + ' ' + @SortOrder + ')AS Row,
	PA.PreAuthId,
	PA.PreAuthNumber,
	ISNULL(PA.PreAuthStatusId, 0) AS PreAuthStatusId,
	claim.ClaimReferenceNumber,
	MWF.AssignedToUserId AS AssignedToUserId,
	Wizard.CustomRoutingRoleId AS AssignedToRoleId,
	Wizard.Name,
	U.Id AS UserId,
	Wizard.LockedToUser as UserEmail,
	PA.CreatedBy,
	U.Id AS PreAuthCreatedById,	
	Wizard.StartDateAndTime,
	ISNULL(Wizard.EndDateAndTime, GETDATE()) EndDateAndTime,
	PA.CreatedBy AS UserName,
	U2.Email AS AssignedToUser,
	PA.CreatedDate AS DateCreated,
	ISNULL(PA.PreAuthStatusId, 0) AS PreAuthStatus,
	
	WS.[Name] AS WizardStatus,
	''PreAuthorisation'' AS ReferenceType,
	'

	Set @Select1 = '
	CAST(DATEADD(SECOND, 0, ''1900-01-01'') AS TIME) As UserSLA,
	CAST(DATEADD(SECOND, 360, ''1900-01-01'') AS TIME) As OverAllSLA,
	0 As NUserSLA,
	bpm.CalculateOverAllSLA(Wizard.StartDateAndTime,CASE WHEN PA.PreAuthId IS NULL THEN CASE WHEN  (select top 1 MW.EndDateTime from [medical].[Workflow] MW where MW.ReferenceId = PA.PreAuthId order by MW.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime END ELSE (select top 1 MW2.EndDateTime from [medical].[PreAuthorisation] PA1 INNER JOIN [medical].[Workflow] MW2 ON PA1.PreAuthId = MW2.ReferenceId where PA1.PreAuthId = PA.PreAuthId order by MW2.WorkflowId desc) END,WConfig.SLAWarning,WConfig.SLAEscalation) As NOverAllSLA,
	CASE WHEN PA.PreAuthId IS NOT NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW3 INNER JOIN security.[User] SU ON MW3.AssignedToUserId = SU.Id where ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW3.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	WHEN PA.PreAuthId IS NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW4 INNER JOIN security.[User] SU ON MW4.AssignedToUserId = SU.Id where ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW4.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	END as LastWorkedOn, 
	bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,Wizard.EndDateAndTime) As UserSLAHours,
	bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,CASE WHEN PA.PreAuthId IS NULL THEN CASE WHEN  (select top 1 MW5.EndDateTime from medical.Workflow MW5 where MW5.ReferenceId = PA.PreAuthId order by MW5.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime WHEN  (select top 1 MW6.EndDateTime from medical.Workflow MW6 where MW6.ReferenceId = PA.PreAuthId order by MW6.WorkflowId desc) IS NOT NULL THEN (select top 1 MW7.EndDateTime from medical.Workflow MW7 where MW7.ReferenceId = PA.PreAuthId order by MW7.WorkflowId desc) END
	ELSE (select top 1 MW8.EndDateTime from [medical].[PreAuthorisation] PA3 INNER JOIN medical.Workflow MW8 ON PA3.PreAuthId = MW8.ReferenceId where PA3.PreAuthId = PA.PreAuthId order by MW8.WorkflowId desc) END) As OverAllSLAHours,
	0 As WizardUserId,
	''/medicare/preauth-manager/review-preauth/continue/''+ CAST(Wizard.id AS VARCHAR(50)) As WizardURL,	
	'
	Set @Select2 ='
	(select Top 1 MW9.AssignedToUserId from medical.Workflow MW9 INNER JOIN security.[User] SU ON MW9.AssignedToUserId = SU.Id where MW9.ReferenceId = PA.PreAuthId and EndDateTime IS NOT NULL AND MW9.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) as LastWorkedOnUserId, 
	Wizard.id As WizardId,
	Wizard.WizardConfigurationId,
	Wizard.WizardStatusId,
	Wizard.Data,
	MWF.WorkpoolId,
	Wizard.CurrentStepIndex,
	PA.PreAuthId AS ReferenceId,
	
	ISNULL(PA.PreAuthTypeId, 0) AS PreAuthType
	FROM claim.Claim claim WITH (NOLOCK)
	INNER JOIN [medical].PreAuthorisation PA WITH (NOLOCK) ON claim.PersonEventId = PA.PersonEventId
	INNER JOIN [common].[PreAuthStatus] PAS ON PA.PreAuthStatusId = PAS.Id
	INNER JOIN [common].[PreAuthType] PAT ON PA.PreAuthTypeId = PAT.Id
	INNER JOIN [security].[User] U WITH (NOLOCK) ON U.Email = PA.CreatedBy
	INNER JOIN [security].[Role] Role ON U.[RoleId] = Role.[Id]
	LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid = claim.claimstatusid 
	LEFT JOIN claim.PersonEvent personevent ON claim.PersonEventId = personevent.PersonEventId   
	LEFT JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid   
	LEFT JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN bpm.Wizard Wizard WITH (NOLOCK) ON PA.PreAuthId = Wizard.LinkedItemId   
	INNER JOIN [common].[WizardStatus] WS ON Wizard.WizardStatusId = WS.Id
	INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = Wizard.WizardConfigurationId	
	INNER JOIN [medical].[Workflow] MWF ON Wizard.Id = MWF.WizardId
	LEFT JOIN [security].[User] U2 WITH (NOLOCK) ON MWF.AssignedToUserId = U2.Id
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId 
	' + @WhereClause + COALESCE(' And ' + @Query, '') + ' ) WP '

	SET @SelectCount = 'SELECT DISTINCT @RecordCount = COUNT(PA.PreAuthId) 
	FROM claim.Claim claim WITH (NOLOCK)
	INNER JOIN [medical].PreAuthorisation PA WITH (NOLOCK) ON claim.PersonEventId = PA.PersonEventId
	INNER JOIN [common].[PreAuthStatus] PAS ON PA.PreAuthStatusId = PAS.Id
	INNER JOIN [common].[PreAuthType] PAT ON PA.PreAuthTypeId = PAT.Id
	INNER JOIN [security].[User] U WITH (NOLOCK) ON U.Email = PA.CreatedBy
	INNER JOIN [security].[Role] Role ON U.[RoleId] = Role.[Id]
	LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid = claim.claimstatusid 
	LEFT JOIN claim.PersonEvent personevent ON claim.PersonEventId = personevent.PersonEventId   
	LEFT JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid   
	LEFT JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN bpm.Wizard Wizard WITH (NOLOCK) ON PA.PreAuthId = Wizard.LinkedItemId   
	INNER JOIN [common].[WizardStatus] WS ON Wizard.WizardStatusId = WS.Id
	INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = Wizard.WizardConfigurationId	
	INNER JOIN [medical].[Workflow] MWF ON Wizard.Id = MWF.WizardId
	LEFT JOIN [security].[User] U2 WITH (NOLOCK) ON MWF.AssignedToUserId = U2.Id
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId 
	' + @WhereClause + COALESCE(' And ' + @Query, '') + '' 
	--select @SelectCount
	--print @Select 
	--print @Select1
	--print @Select2

	----Invoice Workflows---------------------------------------------------------------------------------------------------------------------------

	if(@SearchQuery <> '')
	 Begin
		set @Query = '(INV.InvoiceId like ''%' + @SearchQuery + '%''
		OR INV.InvoiceNumber like ''%' + @SearchQuery + '%''
		OR claim.ClaimReferenceNumber like ''%' + @SearchQuery + '%''
		OR personevent.personeventId like ''%' + @SearchQuery + '%'' 
		OR roleplayer.DisplayName like ''%' + @SearchQuery + '%''
		OR Role.[Name] like ''%' + @SearchQuery + '%''
		OR U2.[Email] like ''%' + @SearchQuery + '%''
		OR INV.CreatedBy like ''%' + @SearchQuery + '%'')'
	 End

	 SET @WhereClause = ' WHERE U.IsInternalUser = 1 AND Wizard.WizardConfigurationId IN(67,70,74,80,81) AND INV.InvoiceStatusId in (1,2,3,6)'


	SET @Select3 = 'UNION ALL Select DISTINCT
	CONVERT(INT, WP.WizardId) AS WizardId,
	CONVERT(INT, WP.ReferenceId) AS ReferenceId,
	WP.ReferenceType,
	WP.InvoiceNumber AS ReferenceNumber,
	WP.ClaimReferenceNumber,
	WP.AssignedToUserId,
	WP.AssignedToRoleId,
	WP.Name,
	WP.InvoiceStatus,
	
	CONVERT(INT, WP.UserId) AS UserId,
	WP.UserEmail,
	WP.CreatedBy,
	0 AS InvoiceCreatedById,
	WP.StartDateAndTime AS StartDateTime,
	WP.EndDateAndTime AS EndDateTime,
	WP.UserName,
	WP.AssignedToUser,
	WP.DateCreated,
	WP.UserSLA,
	WP.OverAllSLA,
	WP.InvoiceType,
	WP.NUserSLA,
	WP.NOverAllSLA,
	WP.LastWorkedOn,
	WP.UserSLAHours,
	WP.OverAllSLAHours,
	CONVERT(INT, WP.WizardUserId) AS WizardUserId,
	WP.WizardURL,
	CONVERT(INT, WP.LastWorkedOnUserId) AS LastWorkedOnUserId,	
	CONVERT(INT, WP.WizardConfigurationId) AS WizardConfigurationId,
	CONVERT(INT, WP.WizardStatusId) AS WizardStatusId,
	WP.WizardStatus,
	WP.Data,
	' + CONVERT(VARCHAR, @WorkPoolId) +' AS WorkPoolId,
	WP.CurrentStepIndex
	From
	(SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY ' + @SortColumn + ' ' + @SortOrder + ')AS Row,
	INV.InvoiceId,
	INV.InvoiceNumber,
	ISNULL(INV.InvoiceStatusId, 0) AS InvoiceStatusId,
	claim.ClaimReferenceNumber,
	MWF.AssignedToUserId AS AssignedToUserId,
	Wizard.CustomRoutingRoleId AS AssignedToRoleId,
	Wizard.Name,
	U.Id AS UserId,
	Wizard.LockedToUser as UserEmail,
	INV.CreatedBy,
	U.Id AS PreAuthCreatedById,	
	Wizard.StartDateAndTime,
	ISNULL(Wizard.EndDateAndTime, GETDATE()) EndDateAndTime,
	INV.CreatedBy AS UserName,
	U2.Email AS AssignedToUser,
	INV.CreatedDate AS DateCreated,
	ISNULL(INV.InvoiceStatusId, 0) AS InvoiceStatus,
	
	WS.[Name] AS WizardStatus,
	''Invoice'' AS ReferenceType,
	'

	Set @Select4 = '
	CAST(DATEADD(SECOND, 0, ''1900-01-01'') AS TIME) As UserSLA,
	CAST(DATEADD(SECOND, 360, ''1900-01-01'') AS TIME) As OverAllSLA,
	0 As NUserSLA,
	bpm.CalculateOverAllSLA(Wizard.StartDateAndTime,CASE WHEN INV.InvoiceId IS NULL THEN CASE WHEN  (select top 1 MW.EndDateTime from [medical].[Workflow] MW where MW.ReferenceId = INV.InvoiceId order by MW.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime END ELSE (select top 1 MW2.EndDateTime from [medical].[Invoice] INV1 INNER JOIN [medical].[Workflow] MW2 ON INV1.InvoiceId = MW2.ReferenceId where INV1.InvoiceId = INV.InvoiceId order by MW2.WorkflowId desc) END,WConfig.SLAWarning,WConfig.SLAEscalation) As NOverAllSLA,
	CASE WHEN INV.InvoiceId IS NOT NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW3 INNER JOIN security.[User] SU ON MW3.AssignedToUserId = SU.Id where ReferenceId = INV.InvoiceId and EndDateTime IS NOT NULL AND MW3.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	WHEN INV.InvoiceId IS NULL THEN (select Top 1 SU.DisplayName from medical.Workflow MW4 INNER JOIN security.[User] SU ON MW4.AssignedToUserId = SU.Id where ReferenceId = INV.InvoiceId and EndDateTime IS NOT NULL AND MW4.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) 
	END as LastWorkedOn, 
	bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,Wizard.EndDateAndTime) As UserSLAHours,
	bpm.CalculateOverAllSLATimeElapsed(Wizard.StartDateAndTime,CASE WHEN INV.InvoiceId IS NULL THEN CASE WHEN  (select top 1 MW5.EndDateTime from medical.Workflow MW5 where MW5.ReferenceId = INV.InvoiceId order by MW5.WorkflowId desc) IS NULL THEN Wizard.EndDateAndTime WHEN  (select top 1 MW6.EndDateTime from medical.Workflow MW6 where MW6.ReferenceId = INV.InvoiceId order by MW6.WorkflowId desc) IS NOT NULL THEN (select top 1 MW7.EndDateTime from medical.Workflow MW7 where MW7.ReferenceId = INV.InvoiceId order by MW7.WorkflowId desc) END
	ELSE (select top 1 MW8.EndDateTime from [medical].[Invoice] INV3 INNER JOIN medical.Workflow MW8 ON INV3.InvoiceId = MW8.ReferenceId where INV3.InvoiceId = INV.InvoiceId order by MW8.WorkflowId desc) END) As OverAllSLAHours,
	0 As WizardUserId,
	''/medicare/preauth-manager/review-preauth/continue/''+ CAST(Wizard.id AS VARCHAR(50)) As WizardURL,	
	'
	Set @Select5 ='
	(select Top 1 MW9.AssignedToUserId from medical.Workflow MW9 INNER JOIN security.[User] SU ON MW9.AssignedToUserId = SU.Id where MW9.ReferenceId = INV.InvoiceId and EndDateTime IS NOT NULL AND MW9.AssignedToUserId IS NOT NULL Order by WorkFlowId desc) as LastWorkedOnUserId, 
	Wizard.id As WizardId,
	Wizard.WizardConfigurationId,
	Wizard.WizardStatusId,
	Wizard.Data,
	MWF.WorkpoolId,
	Wizard.CurrentStepIndex,
	INV.InvoiceId AS ReferenceId,
	
	0 AS InvoiceType
	FROM claim.Claim claim WITH (NOLOCK)
	INNER JOIN [medical].Invoice INV WITH (NOLOCK) ON claim.PersonEventId = INV.PersonEventId
	INNER JOIN [common].[InvoiceStatus] INVS ON INV.InvoiceStatusId = INVS.Id
	INNER JOIN [security].[User] U WITH (NOLOCK) ON U.Email = INV.CreatedBy
	INNER JOIN [security].[Role] Role ON U.[RoleId] = Role.[Id]
	LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid = claim.claimstatusid 
	LEFT JOIN claim.PersonEvent personevent ON claim.PersonEventId = personevent.PersonEventId   
	LEFT JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid   
	LEFT JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN bpm.Wizard Wizard WITH (NOLOCK) ON INV.InvoiceId = Wizard.LinkedItemId   
	INNER JOIN [common].[WizardStatus] WS ON Wizard.WizardStatusId = WS.Id
	INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = Wizard.WizardConfigurationId	
	INNER JOIN [medical].[Workflow] MWF ON Wizard.Id = MWF.WizardId
	LEFT JOIN [security].[User] U2 WITH (NOLOCK) ON MWF.AssignedToUserId = U2.Id
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId 
	' + @WhereClause + COALESCE(' And ' + @Query, '') + ' ) WP '

	SET @SelectCount2 = 'SELECT DISTINCT @RecordCount = COUNT(INV.PreAuthId) 
	FROM claim.Claim claim WITH (NOLOCK)
	INNER JOIN [medical].PreAuthorisation INV WITH (NOLOCK) ON claim.PersonEventId = INV.PersonEventId
	INNER JOIN [common].[PreAuthStatus] INVS ON INV.InvoiceStatusId = INVS.Id
	INNER JOIN [security].[User] U WITH (NOLOCK) ON U.Email = INV.CreatedBy
	INNER JOIN [security].[Role] Role ON U.[RoleId] = Role.[Id]
	LEFT JOIN claim.ClaimStatus claimstatus ON claimstatus.claimstatusid = claim.claimstatusid 
	LEFT JOIN claim.PersonEvent personevent ON claim.PersonEventId = personevent.PersonEventId   
	LEFT JOIN Claim.Event ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid   
	LEFT JOIN client.RolePlayer roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN bpm.Wizard Wizard WITH (NOLOCK) ON INV.InvoiceId = Wizard.LinkedItemId   
	INNER JOIN [common].[WizardStatus] WS ON Wizard.WizardStatusId = WS.Id
	INNER JOIN bpm.WizardConfiguration WConfig WITH (NOLOCK) ON WConfig.Id = Wizard.WizardConfigurationId	
	INNER JOIN [medical].[Workflow] MWF ON Wizard.Id = MWF.WizardId
	LEFT JOIN [security].[User] U2 WITH (NOLOCK) ON MWF.AssignedToUserId = U2.Id
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId   
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId 
	' + @WhereClause + COALESCE(' And ' + @Query, '') + ''

	---------------------------------------------------------------------------------------------------------------------------

	SET @Select = @Select + @Select1 + @Select2 + ' WHERE Row BETWEEN ' + CAST((@PageIndex - 1) * @PageSize + 1 AS NVARCHAR) + ' AND ' + CAST(@PageIndex*@PageSize AS NVARCHAR)
	--SET @Select = @Select + @Select3 + @Select4 + @Select5 + ' WHERE Row BETWEEN ' + CAST((@PageIndex - 1) * @PageSize + 1 AS NVARCHAR) + ' AND ' + CAST(@PageIndex*@PageSize AS NVARCHAR)
	--SELECT @Select
	EXEC SP_EXECUTESQL @Select	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	

	END

	SET NOCOUNT OFF  

END