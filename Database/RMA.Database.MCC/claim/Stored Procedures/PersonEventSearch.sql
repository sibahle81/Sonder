
CREATE PROCEDURE [claim].[PersonEventSearch] 
(
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='CreatedDate',
	@SortType AS VARCHAR(100) = 'DESC',
	@SearchCreatia as VARCHAR(150) = '',
	@StartDate AS varchar(10),
	@EndDate AS varchar(10),
	@IsStp as int,
	@Stm as Int,
	@claimStatus as Int,
	@liabilityStatus as Int,
	@ViewAll as Bit,
	@Filter as Bit,
	@RecordCount INT = 0 OUTPUT
	--execute [claim].[PersonEventSearch] 1, 500, 'PersonEventNumber', 'desc', '', '2022-05-05', '2022-05-05', 3,3,-1,-1, 0 ,0
)
AS 
BEGIN
	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)
	Declare @WhereDate As NVARCHAR(MAX) = ''
	Declare @stpCheck As NVARCHAR(MAX) = ''
	Declare @stmCheck As NVARCHAR(MAX) = ''
	Declare @claimStatusCheck As NVARCHAR(MAX) = ''
	Declare @liabilityStatusCheck As NVARCHAR(MAX) = ''
	Declare @SearchCreatiaCheck As NVARCHAR(MAX) = ''

 IF(@Filter = 0 AND @ViewAll = 0)
	BEGIN
	   SET @WhereDate =' Where (PE.CreatedDate > DATEADD(MONTH, -3, GETDATE()))'
	END	

 IF (@Filter = 1) 
	BEGIN
	    IF(@ViewAll = 1)  
	        BEGIN 	
			    SET @WhereDate =' Where (PE.CreatedDate > DATEADD(Year, -5, GETDATE()))'
			END	
		ELSE
			BEGIN
				SET @WhereDate = ' Where (Cast(PE.CreatedDate as Date) BETWEEN '''+ @startDate +''' AND ''' + @enddate +''')'
			END

		IF(@IsStp < 3)
			BEGIN
				SET @stpCheck = ' AND (PE.isStraightThroughProcess = '+ Cast(@IsStp as varchar) +')'
			END
		IF(@Stm < 3)
			BEGIN
				SET @stmCheck = ' AND (PE.suspiciousTransactionStatusId = '+ Cast(@Stm as varchar) +')' 
			END
		IF(@claimStatus > -1)
			BEGIN
				SET @claimStatusCheck = ' AND (CL.ClaimStatusId = '+ Cast(@claimStatus as varchar) +')'
			END
		IF(@liabilityStatus > -1)
			BEGIN
				SET @liabilityStatusCheck = ' AND (CL.ClaimLiabilityStatusId = '+ Cast(@liabilityStatus as varchar) +')' 
			END
		IF(@SearchCreatia != '')
			BEGIN
				SET @SearchCreatiaCheck = ' AND ((PE.PersonEventReferenceNumber like ''%'+@SearchCreatia+'%'')
				            OR (P.[DateOfBirth] like ''%'+@SearchCreatia+'%'')
							OR (PEM.EmployeeNumber like ''%'+@SearchCreatia+'%'')
							OR (PEM.EmployeeIndustryNumber like ''%'+@SearchCreatia+'%'')
							OR (C.[Name] like ''%'+@SearchCreatia+'%'')
							OR (P.[firstname] like ''%'+@SearchCreatia+'%'')
							OR (P.[surname] like ''%'+@SearchCreatia+'%'')
							OR (E.EventReferenceNumber like ''%'+@SearchCreatia+'%'')
							OR (P.[IdNumber] like ''%'+@SearchCreatia+'%'')
							OR (CL.ClaimReferenceNumber like ''%'+@SearchCreatia+'%'')
							OR (FP.FinPayeNumber like ''%'+@SearchCreatia+'%''))'
			END
    END

	SET @whereStatement = @whereDate
	IF(len(@stpCheck) > 0) set @whereStatement = @whereStatement + @stpCheck
	IF(len(@stmCheck) > 0) set @whereStatement = @whereStatement + @stmCheck
	IF(len(@claimStatusCheck) > 0) set @whereStatement = @whereStatement + @claimStatusCheck
	IF(len(@liabilityStatusCheck) > 0) set @whereStatement = @whereStatement + @liabilityStatusCheck      
	IF(len(@SearchCreatiaCheck) > 0) set @whereStatement = @whereStatement + @SearchCreatiaCheck

	PRINT @whereStatement

    DECLARE @orderQuery AS NVARCHAR(MAX) 
	SET @orderQuery = ' ORDER BY '
	IF (@SortingCol = 'PersonEventNumber')
	  BEGIN
		  SET @orderQuery = @orderQuery + ' PE.PersonEventId '
		  SET @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'EventType')
	BEGIN
		  SET @orderQuery = @orderQuery + ' E.EventTypeId '
		  SET @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'MemberNumber')
	BEGIN
		  SET @orderQuery = @orderQuery + ' FP.FinPayeNumber '
		  SET @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'MemberName')
	BEGIN
		  SET @orderQuery = @orderQuery + ' C.[Name] '
		  SET @orderQuery = @orderQuery + @SortType
	END
	ELSE IF(@SortingCol = 'CreatedDate')
	BEGIN
		  SET @orderQuery = @orderQuery + ' PE.CreatedDate '
		  SET @orderQuery = @orderQuery + @SortType
	END
	 
	SET @Select = 'Select PE.PersonEventId as PersonEventNumber, 
				   CASE WHEN ISNULL(PE.CompCarePEVRefNumber, '''') <> '''' THEN PE.CompCarePEVRefNumber ELSE PE.PersonEventReferenceNumber END AS PersonEventReferenceNumber,
	               CL.ClaimReferenceNumber AS ClaimNumber,
				   CL.ClaimId AS ClaimId,
				   E.EventTypeId as EventType,
				   E.eventReferenceNumber as EventNumber,
				   FP.FinPayeNumber as MemberNumber,
				   C.[Name] As MemberName, 
				   P.FirstName + '' '' + P.Surname As InsuredLife, 
				   P.IdNumber AS IdentificationNumber,
				   PE.CreatedDate  as CreatedDate,
				   (Select Top 1 MedicalReportFormId from digi.MedicalReportForm where PersonEventId = PE.PersonEventId) as MedicalReportForm,
				   PE.IsStraightThroughProcess as IsStraightThroughProcess,
				   PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
				   CL.ClaimStatusId as ClaimStatus,
				   CL.ClaimLiabilityStatusId as ClaimLiabilityStatus,
				   (Select Top 1 STPExitReasonID from claim.PersonEventSTPExitReasons where PersonEventId = PE.PersonEventId AND isDeleted != 1  order by ClaimSTPExitReasonID desc) as STPExitReason,
				   (SELECT [Description] FROM [claim].[STPExitReason] WHERE [STPExitReasonID] = (Select Top 1 STPExitReasonID from claim.PersonEventSTPExitReasons where PersonEventId = PE.PersonEventId AND isDeleted != 1  order by ClaimSTPExitReasonID desc)) AS STPDescription,
				   P.dateOfBirth as DOB,
				   PEM.EmployeeNumber as EmployeeNumber,
				   PEM.EmployeeIndustryNumber as EmployeeIndustryNumber,
				   E.eventId as EventId,
				   E.EventDate as EventDate
	from claim.PersonEvent as PE 
	inner Join claim.Event as E on pE.EventId = E.EventId 
	inner Join claim.claim as CL on PE.PersonEventId = CL.PersonEventId
	inner Join client.RolePlayer as R on PE.CompanyRolePlayerId = r.RolePlayerId
	inner Join client.Company as C on R.RolePlayerId = C.RolePlayerId
	inner JOIN client.Person as P on PE.InsuredLifeId = P.RolePlayerId
	inner Join client.FinPayee as FP on R.RolePlayerId = FP.RolePlayerId
	left join (SELECT EmployeeRolePlayerId, EmployeeNumber, EmployeeIndustryNumber FROM (SELECT EmployeeRolePlayerId, EmployeeNumber, EmployeeIndustryNumber, ROW_NUMBER() OVER (Partition BY EmployeeRolePlayerId ORDER BY PersonEmpoymentId DESC) RNum FROM client.personemployment) S 
								WHERE RNum = 1) as PEM on P.RolePlayerId = PEM.EmployeeRolePlayerId
	'+@whereStatement+'	'+@orderQuery +'
	OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
	FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY'

	SET @SelectCount = 'Select @RecordCount = (SELECT 
		COUNT(*)
		from (Select PE.PersonEventId as PersonEventNumber, 
				   CASE WHEN ISNULL(PE.CompCarePEVRefNumber, '''') <> '''' THEN PE.CompCarePEVRefNumber ELSE PE.PersonEventReferenceNumber END AS PersonEventReferenceNumber,
	               CL.ClaimReferenceNumber AS ClaimNumber,
				   CL.ClaimId AS ClaimId,
				   E.EventTypeId as EventType,
				   E.eventReferenceNumber as EventNumber,
				   FP.FinPayeNumber as MemberNumber,
				   C.[Name] As MemberName, 
				   P.FirstName + '' '' + P.Surname As InsuredLife, 
				   P.IdNumber AS IdentificationNumber,
				   PE.CreatedDate  as CreatedDate,
				   (Select Top 1 MedicalReportFormId from digi.MedicalReportForm where PersonEventId = PE.PersonEventId) as MedicalReportForm,
				   PE.IsStraightThroughProcess as IsStraightThroughProcess,
				   PE.SuspiciousTransactionStatusId as SuspiciousTransactionStatus,
				   CL.ClaimStatusId as ClaimStatus,
				   CL.ClaimLiabilityStatusId as ClaimLiabilityStatus,
				   (Select Top 1 STPExitReasonID from claim.PersonEventSTPExitReasons where PersonEventId = PE.PersonEventId AND isDeleted != 1  order by ClaimSTPExitReasonID desc) as STPExitReason,
				   (SELECT [Description] FROM [claim].[STPExitReason] WHERE [STPExitReasonID] = (Select Top 1 STPExitReasonID from claim.PersonEventSTPExitReasons where PersonEventId = PE.PersonEventId AND isDeleted != 1  order by ClaimSTPExitReasonID desc)) AS STPDescription,
				   P.dateOfBirth as DOB,
				   PEM.EmployeeNumber as EmployeeNumber,
				   PEM.EmployeeIndustryNumber as EmployeeIndustryNumber,
				   E.eventId as EventId,
				   E.EventDate as EventDate
	from claim.PersonEvent as PE 
	inner Join claim.Event as E on pE.EventId = E.EventId 
	inner Join claim.claim as CL on PE.PersonEventId = CL.PersonEventId
	inner Join client.RolePlayer as R on PE.CompanyRolePlayerId = r.RolePlayerId
	inner Join client.Company as C on R.RolePlayerId = C.RolePlayerId
	inner JOIN client.Person as P on PE.InsuredLifeId = P.RolePlayerId
	inner Join client.FinPayee as FP on R.RolePlayerId = FP.RolePlayerId
	left join (SELECT EmployeeRolePlayerId, EmployeeNumber, EmployeeIndustryNumber FROM (SELECT EmployeeRolePlayerId, EmployeeNumber, EmployeeIndustryNumber, ROW_NUMBER() OVER (Partition BY EmployeeRolePlayerId ORDER BY PersonEmpoymentId DESC) RNum FROM client.personemployment) S 
								WHERE RNum = 1) as PEM on P.RolePlayerId = PEM.EmployeeRolePlayerId
		'+@whereStatement+')s)'
	Print @Select
	Print @SelectCount

	EXEC SP_EXECUTESQL @Select

	DECLARE @ParamDefinition AS NVARCHAR(50)	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	
END
