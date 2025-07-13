CREATE PROCEDURE [commission].[CommissionPoolSearch] 
(
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='HeaderId',
	@SortType AS VARCHAR(100) = 'DESC',
	@SearchCreatia as VARCHAR(150) = '',
	@ReAllocate		    AS	bit	= 0,
	@UserLoggedIn		AS	int	= 0,
	@WorkPoolId		    AS	int	= 0,
	@StartDate AS varchar(10),
	@EndDate AS varchar(10),
	@CommissionStatusId as Int,
	@RecordCount INT = 0 OUTPUT
	--execute [commission].[CommissionPoolSearch] 1, 500, 'HeaderId', 'desc', '',0,2935,21, 0
	--execute [commission].[CommissionPoolSearch] 1, 500, 'HeaderId', 'desc', '',0,164,21, '2019-05-05', '2023-07-20', 0
)
AS 
BEGIN
	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)
	Declare @WhereDate As NVARCHAR(MAX) = ''
	Declare @CommissionStatusCheck As NVARCHAR(MAX) = ''
	Declare @WorkpoolCheck As NVARCHAR(MAX) = ''
	Declare @UserLoggedCheck As NVARCHAR(MAX) = ''
	Declare @SearchCreatiaCheck As NVARCHAR(MAX) = ''
		
		BEGIN
			SET @WhereDate = ' Where (Cast(C.CreatedDate as Date) BETWEEN '''+ @startDate +''' AND ''' + @enddate +''')'
		END
		
		IF(@CommissionStatusId > 0)
			BEGIN
				SET @CommissionStatusCheck = ' AND (HeaderStatusId = '+ Cast(@CommissionStatusId as varchar) +')' 
			END
		IF(@WorkPoolId > 0)
			BEGIN
				SET @WorkpoolCheck = ' AND (PW.WORKPOOLID = '+ Cast(@WorkPoolId as varchar) +')' 
			END
		IF(@UserLoggedIn > 0 AND @ReAllocate = 0)
			BEGIN
				SET @UserLoggedCheck = ' AND (PW.AssignedToUserId is null OR PW.AssignedToUserId = '+ Cast(@UserLoggedIn as varchar) +')' 
			END
		PRINT @UserLoggedIn
		IF(@SearchCreatia != '')
			BEGIN
				SET @SearchCreatiaCheck = ' AND (([RecepientCode] like ''%'+@SearchCreatia+'%'')
				            OR ([RecepientName] like ''%'+@SearchCreatia+'%'')
							OR ([Comment] like ''%'+@SearchCreatia+'%''))'
			END
    --END

	SET @whereStatement = @whereDate
	SET @whereStatement = @whereStatement + @WorkpoolCheck
	SET @whereStatement = @whereStatement + @UserLoggedCheck
	IF(len(@CommissionStatusCheck) > 0) set @whereStatement = @whereStatement + @CommissionStatusCheck      
	IF(len(@SearchCreatiaCheck) > 0) set @whereStatement = @whereStatement + @SearchCreatiaCheck

	PRINT @whereStatement
	DECLARE @orderQuery AS NVARCHAR(MAX) 
	SET @orderQuery = ' ORDER BY '
	IF (@SortingCol = 'HeaderId')
	  BEGIN
		  SET @orderQuery = @orderQuery + ' HeaderId '
		  SET @orderQuery = @orderQuery + @SortType
	END

   SET @Select = 'SELECT DISTINCT
				   [HeaderId]
				  ,[PeriodId]
				  ,[RecepientTypeId]
				  ,[RecepientId]
				  ,[RecepientCode]
				  ,[RecepientName]
				  ,[IsFitAndProper]
				  ,[FitAndProperCheckDate]
				  ,[TotalHeaderAmount]
				  ,[HeaderStatusId]
				  ,[WithholdingReasonId]
				  ,[Comment]
				  ,C.[IsDeleted]
				  ,C.[CreatedBy]
				  ,C.[CreatedDate]
				  ,C.[ModifiedBy]
				  ,C.[ModifiedDate]
				  ,PW.AssignedToUserID AS AssignedTo
				  ,us.id AS UserId,
				RANK() OVER (PARTITION BY HeaderId ORDER BY PW.CreatedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	[commission].[Header]			AS C	ON PW.ITEMID				    = C.HeaderId  
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
	'+@whereStatement+'	'+@orderQuery +'
	OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
	FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY'

	SET @SelectCount = 'Select @RecordCount = (SELECT 
		COUNT(*)
		from (SELECT DISTINCT
				   [HeaderId]
				  ,[PeriodId]
				  ,[RecepientTypeId]
				  ,[RecepientId]
				  ,[RecepientCode]
				  ,[RecepientName]
				  ,[IsFitAndProper]
				  ,[FitAndProperCheckDate]
				  ,[TotalHeaderAmount]
				  ,[HeaderStatusId]
				  ,[WithholdingReasonId]
				  ,[Comment]
				  ,C.[IsDeleted]
				  ,C.[CreatedBy]
				  ,C.[CreatedDate]
				  ,C.[ModifiedBy]
				  ,C.[ModifiedDate]
				  ,PW.AssignedToUserID AS AssignedTo
				  ,us.id AS UserId,
				RANK() OVER (PARTITION BY HeaderId ORDER BY PW.CreatedDate DESC) AS RowNum
																							     		
				FROM        COMMON.POOLWORKFLOW				AS PW	
				INNER JOIN	[commission].[Header]			AS C	ON PW.ITEMID				    = C.HeaderId   
				LEFT JOIN	[Security].[User]				AS us	ON PW.AssignedToUserId = us.id
		'+@whereStatement+')s)'
	 
	
	Print @Select
	Print @SelectCount

	EXEC SP_EXECUTESQL @Select

	DECLARE @ParamDefinition AS NVARCHAR(50)	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	
END