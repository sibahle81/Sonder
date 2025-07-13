
CREATE PROCEDURE [claim].[EventSearch] 
(
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='CreatedDate',
	@SortType AS VARCHAR(100) = 'DESC',
	@SearchCreatia as VARCHAR(150) = '',
	@StartDate AS varchar(10),
	@EndDate AS varchar(10),
	@EventType as int,
	@ViewAll as Bit,
	@Filter as Bit,
	@RecordCount INT = 0 OUTPUT
)
AS 
BEGIN
	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)
	Declare @WhereDate As NVARCHAR(MAX) = ''
	Declare @eventTypeCheck As NVARCHAR(MAX) = ''
	Declare @SearchCreatiaCheck As NVARCHAR(MAX) = ''
	Declare @eventDate As Date

 IF(@Filter = 0 AND @ViewAll = 0)
	BEGIN
	   SET @WhereDate =' Where (E.CreatedDate > DATEADD(MONTH, -3, GETDATE()))'
	END	

 IF (@Filter = 1) 
	BEGIN
	    IF(@ViewAll = 1)  
	        BEGIN 	
			    SET @WhereDate =' Where (E.CreatedDate > DATEADD(Year, -5, GETDATE()))'
			END	
		ELSE
			BEGIN
				SET @WhereDate = ' Where (Cast(E.CreatedDate as Date) BETWEEN '''+ @startDate +''' AND ''' + @enddate +''')'
			END

		IF(@EventType > 0)
			BEGIN
				SET @eventTypeCheck = ' AND (E.EventTypeId = '+ Cast(@EventType as varchar) +')'
			END
	
		IF(@SearchCreatia != '')
		BEGIN
			if(ISDATE(@SearchCreatia) = 1)
			begin
				set @SearchCreatiaCheck = ' AND ((Cast(E.EventDate as date) = '''+ @SearchCreatia+'''))'
			end
			else
			begin
				set @SearchCreatiaCheck = ' AND ((upper(trim(C.[Name])) like ''%' + upper(trim(@SearchCreatia)) + '%'')
								OR (E.EventReferenceNumber like ''%' + @SearchCreatia + '%'' ))'	
			end
		END
    END

	SET @whereStatement = @whereDate
	IF(len(@eventTypeCheck) > 0) set @whereStatement = @whereStatement + @eventTypeCheck     
	IF(len(@SearchCreatiaCheck) > 0) set @whereStatement = @whereStatement + @SearchCreatiaCheck


	Declare @orderQuery AS NVARCHAR(MAX) 
	set @orderQuery = ' ORDER BY '
	IF (@SortingCol = 'eventNumber')
	BEGIN
	  set @orderQuery = @orderQuery + ' E.EventReferenceNumber '
	  set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'memberNumber')
	BEGIN
	  set @orderQuery = @orderQuery + ' FP.FinPayeNumber '
	  set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'memberName')
	BEGIN
	  set @orderQuery = @orderQuery + ' C.[Name] '
	  set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'eventType')
	BEGIN
	  set @orderQuery = @orderQuery + ' E.eventTypeId '
	  set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'createdDate')
	BEGIN
	  set @orderQuery = @orderQuery + ' E.CreatedDate '
	  set @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'dateOfIncident')
	BEGIN
	  set @orderQuery = @orderQuery + ' E.EventDate '
	  set @orderQuery = @orderQuery + @SortType
	END
	 	
	SET @Select = 'Select DISTINCT 
	    PE.eventId as EventId,
	    E.EventReferenceNumber as EventNumber, 
	    FP.FinPayeNumber as MemberNumber,
		C.[Name] as MemberName,
		E.EventTypeId as EventType,
		E.CreatedDate  as CreatedDate,
		E.EventDate as DateOfIncident,	
		FP.RolePlayerId as RolePlayerId
	from claim.Event as E 
	inner Join claim.PersonEvent as PE on pE.EventId = E.EventId 
	inner Join claim.claim as CL on PE.PersonEventId = CL.PersonEventId
	inner Join client.RolePlayer as R on PE.CompanyRolePlayerId = r.RolePlayerId
	inner Join client.Company as C on R.RolePlayerId = C.RolePlayerId
	inner Join client.FinPayee as FP on R.RolePlayerId = FP.RolePlayerId
	'+@whereStatement+'	'+@orderQuery +'
	OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
	FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY'

	
	SET @SelectCount = 'Select @RecordCount = (SELECT 
		COUNT(*)
		from (Select DISTINCT 
	    PE.eventId as EventId,
	    E.EventReferenceNumber as EventNumber, 
	    FP.FinPayeNumber as MemberNumber,
		C.[Name] as MemberName,
		E.EventTypeId as EventType,
		E.CreatedDate  as CreatedDate,
		E.EventDate as DateOfIncident,
		FP.RolePlayerId as RolePlayerId
	from claim.Event as E 
	inner Join claim.PersonEvent as PE on pE.EventId = E.EventId 
	inner Join claim.claim as CL on PE.PersonEventId = CL.PersonEventId
	inner Join client.RolePlayer as R on PE.CompanyRolePlayerId = r.RolePlayerId
	inner Join client.Company as C on R.RolePlayerId = C.RolePlayerId
	inner Join client.FinPayee as FP on R.RolePlayerId = FP.RolePlayerId
	'+@whereStatement+') s)'

	EXEC SP_EXECUTESQL @Select

	DECLARE @ParamDefinition AS NVARCHAR(50)	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	

END
