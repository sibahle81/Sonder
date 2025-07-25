CREATE PROCEDURE [bpm].[GetUserWizards2]
(
	@userId int,
	@wizardConfigurations varchar(max),
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='StartDateAndTime',
	@SortType AS VARCHAR(100) = 'DESC',
	@SearchCreatia as VARCHAR(150) = '',
	@WizardStatus as VARCHAR(150),
	@LockedStatus as VARCHAR(150),
	@RecordCount INT = 0 OUTPUT
)
AS
BEGIN

	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)
	DECLARE @UserEmailAddress varchar(100)
	DECLARE @WizardStatusCriteria AS NVARCHAR(MAX)
	DECLARE @LockedStatusCriteria AS NVARCHAR(MAX) = ''

	DECLARE @xml xml = cast(cast(@wizardConfigurations as varbinary(max)) as xml)
	Create table #configuration (WizardConfigurationId int primary key)
	INSERT INTO #configuration SELECT DISTINCT x.rec.value('.', 'int') AS 'WizardConfigurationId' FROM @xml.nodes('/WizardConfiguration/Id') AS x(rec)
	SET @UserEmailAddress = (Select Email from security.[user] where id = @userId)

	IF (@WizardStatus != '0')
		SET @WizardStatusCriteria = ' AND w.[WizardStatusId] in (' + @WizardStatus + ') '
	ELSE
		SET @WizardStatusCriteria = ' AND w.[WizardStatusId] in (1,4) '	-- If no status filters are specified, only return active wizards

	IF(@LockedStatus = 'Locked')
		SET @LockedStatusCriteria = ' AND (w.[LockedToUser] like '''+@UserEmailAddress+''' ) ' 
	ELSE IF(@LockedStatus = 'Unlocked')
		SET @LockedStatusCriteria = ' AND (w.[LockedToUser] is null)'

	IF (@SearchCreatia != '' or @SearchCreatia != Null)
	BEGIN
	SET @whereStatement = 'WHERE WC.Id in (select WizardConfigurationId from #configuration) '
		+ @WizardStatusCriteria + 
		+ @LockedStatusCriteria +
	' AND w.[IsDeleted] = 0
	AND ((w.[Name] like ''%'+@SearchCreatia+'%'' or w.[LockedToUser] like ''%'+@SearchCreatia+'%'' or w.[CreatedBy] like ''%'+@SearchCreatia+'%'' or w.[ModifiedBy] like ''%'+@SearchCreatia+'%'')) '
	END
	ELSE
	BEGIN
	SET @whereStatement ='WHERE WC.Id in (select WizardConfigurationId from #configuration) '
	+ @WizardStatusCriteria + 
	+ @LockedStatusCriteria +
	' AND w.[IsDeleted] = 0 '
	END

	Declare @orderQuery AS NVARCHAR(MAX)
	set @orderQuery = ' ORDER BY '
	IF (@SortingCol = 'name')
	BEGIN
	set @orderQuery = @orderQuery + ' w.[Name] '
	set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'type')
	BEGIN
	set @orderQuery = @orderQuery + ' WC.[DisplayName] '
	set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'createdBy')
	BEGIN
	set @orderQuery = @orderQuery + ' w.[CreatedBy] '
	set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'StartDateAndTime' OR @SortingCol = 'overAllSLAHours' OR @SortingCol = 'createdDate')
	BEGIN
	set @orderQuery = @orderQuery + ' w.[StartDateAndTime] '
	set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'wizardStatusText')
	BEGIN
	set @orderQuery = @orderQuery + ' ws.[Name] '
	set @orderQuery = @orderQuery + @SortType
	END



	SET @Select = 'SELECT
	w.[Id],
	w.[TenantId],
	w.[WizardConfigurationId],
	w.[WizardStatusId] [WizardStatus],
	w.[LinkedItemId],
	w.[Name],
	'''' [Data],
	w.[CurrentStepIndex],
	w.[LockedToUser],
	w.[CustomStatus],
	w.[CustomRoutingRoleId],
	w.[IsActive],
	w.[IsDeleted],
	w.[CreatedBy],
	w.[CreatedDate],
	w.[ModifiedBy],
	w.[ModifiedDate],
	w.[StartDateAndTime],
	w.[EndDateAndTime]
	FROM [bpm].[Wizard] w WITH (nolock)
	INNER JOIN [bpm].[WizardConfiguration] wc on wc.Id = w.[WizardConfigurationId]
	INNER JOIN common.wizardStatus ws on ws.Id = w.WizardStatusId
	'+@whereStatement+' '+@orderQuery +'
	OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
	FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY'

	print(@Select)


	SET @SelectCount = 'Select @RecordCount = (SELECT
	COUNT(*)
	FROM [bpm].[Wizard] w WITH (nolock)
	INNER JOIN [bpm].[WizardConfiguration] wc on wc.Id = w.[WizardConfigurationId]
	INNER JOIN common.wizardStatus ws on ws.Id = w.WizardStatusId
	'+@whereStatement+')'

	EXEC SP_EXECUTESQL @Select

	DECLARE @ParamDefinition AS NVARCHAR(50)
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT

END
