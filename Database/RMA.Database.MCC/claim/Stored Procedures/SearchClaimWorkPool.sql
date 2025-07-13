--EXEC [claim].[SearchClaimWorkPool] 1,2767,1, 100
CREATE  PROCEDURE [claim].[SearchClaimWorkPool]
	@WorkPoolId INT,
	@UserID INT = NULL,
	@PageIndex	INT ,
    @PageSize	INT = 5,
	@RecordCount	INT = 0 OUTPUT ,
	@SearchQuery    VARCHAR(200) = '',
	@SortColumn		VARCHAR(Max)= 'Wizard.Id',
	@SortOrder		CHAR(4) = 'DESC'
AS

--========================================================================--
--Declare @WorkPoolId INT,
--	@UserID INT = NULL,
--	@PageIndex INT, 
--	@PageSize   INT,
--	@SortColumn		VARCHAR(30)= 'Wizard.Id',
--	@SortOrder		CHAR(4) = 'DESC',
--	@RecordCount	INT = 0

--Set @WorkPoolId = 6
--Set @UserID = 2767
--Set @PageIndex = 1
--Set @PageSize = 600
--========================================================================--

BEGIN
	
	SET NOCOUNT ON   

	Declare @Ticks AS BIGINT = 9999999999999
	Declare @Select AS NVARCHAR(MAX)
	Declare @Select1 AS NVARCHAR(MAX)
	Declare @Select2 AS NVARCHAR(MAX)
	Declare @SelectCount As NVARCHAR(MAX)
	Declare @WhereClause AS NVARCHAR(MAX)
	Declare @UserEmail Nvarchar(50) = NULL
	Declare @RoleName varchar(100)
	Declare @Query varchar(max) = null

	if(@SearchQuery <> '')
	 Begin
		set @Query = '(claim.personEventId like ''%' + @SearchQuery + '%'' 
		OR claim.claimReferenceNumber like ''%' + @SearchQuery + '%'' 
		OR policy.policyNumber like ''%' + @SearchQuery + '%''
		OR roleplayer.DisplayName like ''%' + @SearchQuery + '%'')'
	 End


	if(@UserID IS NOT NULL)
		Begin
			Select @UserEmail = Email From [security].[User] where Id= @UserID
			Select @RoleName = R.Name from Security.[User] U Inner Join Security.[Role] R On U.RoleId = R.Id Where U.Id=@UserID
		End

	IF (@WorkPoolId = 1 and @SearchQuery ='') 
	BEGIN
		IF (@RoleName = 'Claims Support and Complaints Manager')
			SET @WhereClause = ' WHERE wizard.WizardConfigurationId IN(14,29) AND claim.ClaimStatusId in (26) AND (claim.AssignedToUserId = ' +  CAST(@UserID AS NVARCHAR) + ')'
		ELSE
			IF (@RoleName = 'Claims Manager')
				SET @WhereClause = ' WHERE wizard.WizardConfigurationId IN(14,29) AND wizard.wizardStatusID<>4 '
			ELSE
				SET @WhereClause = ' WHERE wizard.WizardConfigurationId IN(14,29) AND wizard.wizardStatusID<>4 AND (claim.AssignedToUserId = ' +  CAST(@UserID AS NVARCHAR) + '  Or claim.AssignedToUserId is null) '
			SET @SelectCount = @SelectCount + ' WHERE wizard.LockedToUser IS NULL AND claim.ClaimStatusId in (1) '
	END

	IF (@WorkPoolId = 2 and @SearchQuery ='') 
	BEGIN
		IF (@UserID IS NOT NULL)
		BEGIN
			SET @WhereClause = ' WHERE wizard.WizardConfigurationId IN(14,29) AND  (claim.AssignedToUserId = ' +  CAST(@UserID AS NVARCHAR) + ') And (LockedToUser Is NULL Or ev.CreatedBy =  '' +  CAST(@UserEmail AS NVARCHAR) + '') '
			SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (3,4,11) 
								AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null)'
		END
		ELSE
		BEGIN
			SET @WhereClause = ' WHERE wizard.WizardConfigurationId IN(14,29) AND  (claim.AssignedToUserId = ' +  CAST(@UserID AS NVARCHAR) + ' or ClaimId is Null) And (LockedToUser Is NULL Or ev.CreatedBy =  '' +  CAST(@UserEmail AS NVARCHAR) + '') '
			SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (3,4,11) 
								AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null)'
	
		END
	END

	--==Person who approved cannot be 2nd approver
	set @WhereClause = 'WHERE 1 = 1 ' 
	IF (@WorkPoolId = 3 and @SearchQuery ='')  
	BEGIN
		SET @WhereClause = ' AND wizard.WizardConfigurationId IN(14,29) AND claim.ClaimStatusId in (13,17) AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
		SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (13,17)
							AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
	END 

	IF (@WorkPoolId = 4 and @SearchQuery ='')  
	BEGIN
		SET @WhereClause = ' AND wizard.WizardConfigurationId IN(14,29) AND claim.ClaimStatusId in (11)  OR personevent.PersonEventStatusId in (5) AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
		SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (11)
							AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
	END

	IF (@WorkPoolId = 5 and @SearchQuery ='')   
	BEGIN
		SET @WhereClause = ' AND wizard.WizardConfigurationId IN(14,29) AND claim.ClaimStatusId in (9,14,18,22,23) AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
		SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (9,14,18,22,23)
							AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
	END

	IF (@WorkPoolId = 6 and @SearchQuery ='')   
	BEGIN
		SET @WhereClause = ' AND wizard.WizardConfigurationId IN(14,29) AND claim.ClaimStatusId in (10,26) AND (claim.AssignedToUserId = ''' + CAST(@UserID AS NVARCHAR) + ''' or claim.AssignedToUserId is null) '
		SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (10)
							AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
	END

	IF (@WorkPoolId = 7 and @SearchQuery ='')   
	BEGIN
		SET @WhereClause = ' AND wizard.WizardConfigurationId IN(14,29) AND  claim.ClaimStatusId in (5) AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
		SET @SelectCount = @SelectCount + ' WHERE claim.ClaimStatusId in (5)
							AND (wizard.LockedToUser = ''' + CONVERT(VARCHAR,@UserEmail) + ''' or wizard.LockedToUser is null) '
	END

	SET @Select = 'Select 
	WP.PersonEventId,
	WP.PersonEventReferenceNumber PersonEventReference,
	WP.ClaimReferenceNumber ClaimUniqueReference,
	WP.PersonEventReferenceNumber ClaimUniqueReference,
	WP.ClaimStatusId,
	WP.PolicyId,
	WP.AssignedToUserId,
	WP.TotalBenefitAmount,
	WP.UserId,
	WP.CreatedBy EventCreatedBy,
	WP.EventCreatedById,
	WP.ClaimId,
	UserName,
	WP.PersonEventAssignedTo,
	WP.LifeAssured,
	WP.DateCreated,
	WP.UserSLA,
	WP.OverAllSLA,
	WP.ClaimStatus,
	WP.NUserSLA,
	WP.LastWorkedOn,
	WP.WizardUserId,
	WP.WizardURL,
	WP.PolicyNumber,
	WP.PolicyStatusId,
	WP.PolicyBrokerId,
	WP.ClaimStatusDisplayName,
	WP.ClaimStatusDisplayDescription,
	WP.LastWorkedOnUserId,
	WP.InsuredLifeId,
	WP.workPoolId
	From
	(SELECT ROW_NUMBER() OVER (ORDER BY PersonEvent.PersonEventId DESC)AS Row,
	PersonEvent.PersonEventId,
	PersonEvent.PersonEventReferenceNumber,
	ClaimReferenceNumber,
	CASE WHEN claimstatus.ClaimStatusId IS NULL THEN  
	CASE WHEN PersonEvent.PersonEventStatusId In(2) THEN 6 WHEN PersonEvent.PersonEventStatusId In(4) THEN 7 WHEN PersonEvent.PersonEventStatusId In(5) THEN 11  WHEN PersonEvent.PersonEventStatusId In(6) THEN 12 WHEN PersonEvent.PersonEventStatusId In(0,1,3) THEN 1 END
	ELSE claimstatus.ClaimStatusId
	END ClaimStatusId,		
	CASE WHEN (personeventdeath.DeathTypeId = 3) THEN
		ISNULL(pil.PolicyId,NULL)
	ELSE
	ISNULL(pil.PolicyId,NULL)
	END PolicyId,

	claim.AssignedToUserId,
	0.00 as TotalBenefitAmount,
	U.Id as UserId,
	PersonEvent.CreatedBy,
	1 as EventCreatedById,
	claim.ClaimId,
	Case when ClaimId IS NULL THEN

		(select US.DisplayName from [Security].[User] (nolock) US WHERE US.Id = PersonEvent.AssignedToUserID)
	ELSE 
		(select US.DisplayName from [Security].[User] (nolock) US WHERE US.Id = claim.AssignedToUserId) END
	as UserName,
	Case when ClaimId IS NULL THEN PersonEvent.AssignedToUserID
	ELSE claim.AssignedToUserId END as PersonEventAssignedTo,'

	Set @Select1 = 'roleplayer.DisplayName LifeAssured,
	personevent.CreatedDate as DateCreated,
	CAST(DATEADD(SECOND, 0, ''1900-01-01'') AS TIME) As UserSLA,
	CAST(DATEADD(SECOND, 360, ''1900-01-01'') AS TIME) As OverAllSLA,
	CASE WHEN claimstatus.Status IS NULL THEN  
	CASE WHEN PersonEvent.PersonEventStatusId In(2) THEN ''Closed'' WHEN PersonEvent.PersonEventStatusId In(4) THEN ''Declined''  WHEN PersonEvent.PersonEventStatusId In(5,6) THEN ''Pending'' WHEN PersonEvent.PersonEventStatusId In(0,1,3) THEN ''New'' END
	ELSE claimstatus.Status END ClaimStatus,	
	0 As NUserSLA,
	CASE WHEN claim.ClaimId IS NOT NULL THEN (select Top 1 SU.DisplayName from claim.ClaimWorkflow (nolock) CW INNER JOIN security.[User] (nolock)SU ON CW.AssignedToUserId = SU.Id where ClaimId = claim.ClaimId and EndDateTime IS NOT NULL AND CW.AssignedToUserId IS NOT NULL Order by ClaimWorkFlowId desc) 
	WHEN claim.ClaimId IS NULL THEN (select Top 1 SU.DisplayName from claim.ClaimWorkflow (nolock) CW INNER JOIN security.[User] (nolock) SU ON CW.AssignedToUserId = SU.Id where PersonEventId = personevent.PersonEventId and EndDateTime IS NOT NULL AND CW.AssignedToUserId IS NOT NULL Order by ClaimWorkFlowId desc) 
	END as LastWorkedOn,
	0 As WizardUserId,
	''/claimcare/claim-manager/register-funeral-claim/continue/''+ CAST(wizard.id AS VARCHAR(50)) As WizardURL,
	CASE WHEN (personeventdeath.DeathTypeId = 3) THEN
		ISNULL(Policy2.PolicyNumber,NULL)
	ELSE
	ISNULL(Policy.PolicyNumber,NULL)
	END PolicyNumber,
	1 As PolicyStatusId,
	0 As PolicyBrokerId,
	'

	Set @Select2 ='CASE WHEN claimstatus.Name IS NULL AND 1 = 1 THEN CASE WHEN PersonEvent.PersonEventStatusId In(2) THEN ''Closed'' WHEN PersonEvent.PersonEventStatusId In(4) THEN ''Cancelled'' WHEN PersonEvent.PersonEventStatusId In(5) THEN ''Pending Investigations'' WHEN PersonEvent.PersonEventStatusId In(6) THEN ''Investigation Complete'' WHEN PersonEvent.PersonEventStatusId In(0,1,3) THEN ''New'' END
	WHEN claimstatus.Name IS NULL AND 1 != 1 THEN CASE WHEN PersonEvent.PersonEventStatusId In(2) THEN ''Closed'' WHEN PersonEvent.PersonEventStatusId In(4) THEN ''Cancelled'' WHEN PersonEvent.PersonEventStatusId In(5) THEN ''Pending Investigations'' WHEN PersonEvent.PersonEventStatusId In(6) THEN ''Investigation Complete'' WHEN PersonEvent.PersonEventStatusId In(0,1,3) THEN ''Pending Requirements'' END
	ELSE claimstatus.Name END As ClaimStatusDisplayName,
	CASE WHEN claimstatus.Description IS NULL AND 1 = 1 THEN CASE WHEN PersonEvent.PersonEventStatusId In(2) THEN ''Closed'' WHEN PersonEvent.PersonEventStatusId In(4) THEN ''Declined''  WHEN PersonEvent.PersonEventStatusId In(5) THEN ''Pending Investigations'' WHEN PersonEvent.PersonEventStatusId In(6) THEN ''Investigation Complete'' WHEN PersonEvent.PersonEventStatusId In(0,1,3) THEN ''New'' END
	WHEN claimstatus.Description IS NULL AND 1 != 1 THEN CASE WHEN PersonEvent.PersonEventStatusId In(2) THEN ''Closed'' WHEN PersonEvent.PersonEventStatusId In(4) THEN ''Declined''  WHEN PersonEvent.PersonEventStatusId In(5) THEN ''Pending Investigations'' WHEN PersonEvent.PersonEventStatusId In(6) THEN ''Investigation Complete'' WHEN PersonEvent.PersonEventStatusId In(0,1,3) THEN ''Pending'' END
	ELSE claimstatus.Status END As ClaimStatusDisplayDescription,
	(select Top 1 CW.AssignedToUserId from claim.ClaimWorkflow (nolock)CW INNER JOIN security.[User] (nolock)SU ON CW.AssignedToUserId = SU.Id where ClaimId = claim.ClaimId and EndDateTime IS NOT NULL AND CW.AssignedToUserId IS NOT NULL Order by ClaimWorkFlowId desc) as LastWorkedOnUserId, 
	roleplayer.RolePlayerId As InsuredLifeId,
	CASE
	WHEN claimstatus.ClaimStatusId = 1 THEN 1
	ELSE 1
	END workPoolId,
	0 CaseId,
	0 ClaimTypeId,
	0 PaymentId
	FROM claim.PersonEvent personevent WITH (NOLOCK)
	INNER JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid
	LEFT JOIN bpm.Wizard wizard WITH (NOLOCK) ON personevent.EventId = wizard.LinkedItemId
	INNER JOIN client.RolePlayer(nolock) roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN Claim.Event  ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.Claim claim WITH (NOLOCK) ON claim.PersonEventId = personevent.PersonEventId
	LEFT JOIN claim.ClaimStatus (nolock) claimstatus ON claimstatus.claimstatusid =claim.claimstatusid
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId
	LEFT JOIN [security].[User] U WITH (NOLOCK) ON U.Id = claim.AssignedToUserId  ' + @WhereClause + COALESCE(' AND ' + @Query, '') + ' ) WP '

	SET @SelectCount = 'SELECT @RecordCount = COUNT(*) FROM claim.PersonEvent personevent WITH (NOLOCK)
	INNER JOIN claim.PersonEventDeathDetail personeventdeath WITH (NOLOCK) ON personeventdeath.personeventid = personevent.personeventid
	LEFT JOIN bpm.Wizard wizard WITH (NOLOCK) ON personevent.EventId = wizard.LinkedItemId
	INNER JOIN client.RolePlayer(nolock) roleplayer ON roleplayer.RolePlayerId = PersonEvent.InsuredLifeId
	INNER JOIN Claim.Event  ev  WITH (NOLOCK) ON ev.EventId = personevent.EventId
	LEFT JOIN claim.Claim claim WITH (NOLOCK) ON claim.PersonEventId = personevent.PersonEventId
	LEFT JOIN claim.ClaimStatus (nolock) claimstatus ON claimstatus.claimstatusid =claim.claimstatusid
	LEFT JOIN policy.PolicyInsuredLives pil WITH (NOLOCK) ON pil.RolePlayerId = personevent.InsuredLifeId AND claim.PolicyId = pil.PolicyId
	LEFT JOIN policy.Policy [policy] WITH (NOLOCK) ON policy.policyId = pil.PolicyId AND claim.PolicyId = pil.PolicyId
	LEFT JOIN policy.Policy [policy2] WITH (NOLOCK) ON policy2.policyId = pil.PolicyId
	LEFT JOIN [security].[User] U WITH (NOLOCK) ON U.Id = claim.AssignedToUserId ' + @WhereClause 

	--print @Select 
	--print @Select1
	--print @Select2

	SET @Select = @Select + @Select1 + @Select2 + ' WHERE Row BETWEEN ' + CAST((@PageIndex - 1) * @PageSize + 1 AS NVARCHAR) + ' AND ' + CAST(@PageIndex*@PageSize AS NVARCHAR)
	 
 

	EXEC SP_EXECUTESQL @Select

	
	DECLARE @ParamDefinition AS NVARCHAR(50)	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	

	SET NOCOUNT OFF  

END