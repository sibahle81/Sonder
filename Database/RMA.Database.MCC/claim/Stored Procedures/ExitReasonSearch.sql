CREATE PROCEDURE [claim].[ExitReasonSearch] 
(
	@PageNumber AS INT,
	@RowsOfPage AS INT,
	@SortingCol AS VARCHAR(100) ='CreatedDate',
	@SortType AS VARCHAR(100) = 'DESC',
	@SearchCreatia as VARCHAR(150) = '',
	@ExitReasonId as INT,
	@RecordCount INT = 0 OUTPUT
	--execute [claim].[ExitReasonSearch] 1, 500, 'CreatedDate', 'desc', 'scanner' ,27
)
AS 
BEGIN
	DECLARE @Select AS NVARCHAR(MAX)
	DECLARE @SelectCount As NVARCHAR(MAX)
	DECLARE @whereStatement As NVARCHAR(MAX)

	if(@SearchCreatia = '')
		BEGIN
		SET @whereStatement = ' Where ER.stpExitReasonId'  + ' = ' + Cast(@ExitReasonId as varchar)
		END
	ELSE
		BEGIN
		SET @whereStatement = ' Where ER.stpExitReasonId'  + ' = ' + Cast(@ExitReasonId as varchar) + '
		                    AND ((PE.PersonEventReferenceNumber like ''%'+@SearchCreatia+'%'')
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
	 
	SET @Select = 'Select distinct PE.PersonEventId as PersonEventNumber, 
	               CL.ClaimReferenceNumber AS ClaimNumber,
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
				   ER.StpExitReasonId as STPExitReason,
				   SER.Description as STPDescription,
				   P.dateOfBirth as DOB,
				   PEM.EmployeeNumber as EmployeeNumber,
				   PEM.EmployeeIndustryNumber as EmployeeIndustryNumber
	from claim.PersonEvent as PE 
	inner Join claim.Event as E on pE.EventId = E.EventId 
	inner Join claim.claim as CL on PE.PersonEventId = CL.PersonEventId
	left  Join claim.PersonEventSTPExitReasons as ER on ER.PersonEventId = PE.PersonEventId
	left  Join claim.StpExitReason as SER on SER.stpExitReasonId = ER.stpExitReasonId
	inner Join client.RolePlayer as R on PE.CompanyRolePlayerId = r.RolePlayerId
	inner Join client.Company as C on R.RolePlayerId = C.RolePlayerId
	inner JOIN client.Person as P on PE.InsuredLifeId = P.RolePlayerId
	inner Join client.FinPayee as FP on R.RolePlayerId = FP.RolePlayerId
	left join (SELECT * FROM (SELECT *, ROW_NUMBER() OVER (Partition BY EmployeeRolePlayerId ORDER BY PersonEmpoymentId DESC) RNum FROM client.personemployment) S 
								WHERE RNum = 1) as PEM on P.RolePlayerId = PEM.EmployeeRolePlayerId
	'+@whereStatement+'	'+@orderQuery +'
	OFFSET ('+CAST(@PageNumber as nvarchar(15))+'-1) * '+CAST(@RowsOfPage as nvarchar(15))+' ROWS
	FETCH NEXT '+CAST(@RowsOfPage as nvarchar(15))+' ROWS ONLY'

	SET @SelectCount = 'Select @RecordCount = (SELECT 
		COUNT(*)
		from (Select distinct PE.PersonEventId as PersonEventNumber, 
	               CL.ClaimReferenceNumber AS ClaimNumber,
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
				   ER.StpExitReasonId as STPExitReason,
				   SER.Description as STPDescription,
				   P.dateOfBirth as DOB,
				   PEM.EmployeeNumber as EmployeeNumber,
				   PEM.EmployeeIndustryNumber as EmployeeIndustryNumber
	from claim.PersonEvent as PE 
	inner Join claim.Event as E on pE.EventId = E.EventId 
	inner Join claim.claim as CL on PE.PersonEventId = CL.PersonEventId
	left  Join claim.PersonEventSTPExitReasons as ER on ER.PersonEventId = PE.PersonEventId
	left  Join claim.StpExitReason as SER on SER.stpExitReasonId = ER.stpExitReasonId
	inner Join client.RolePlayer as R on PE.CompanyRolePlayerId = r.RolePlayerId
	inner Join client.Company as C on R.RolePlayerId = C.RolePlayerId
	inner JOIN client.Person as P on PE.InsuredLifeId = P.RolePlayerId
	inner Join client.FinPayee as FP on R.RolePlayerId = FP.RolePlayerId
	left join (SELECT * FROM (SELECT *, ROW_NUMBER() OVER (Partition BY EmployeeRolePlayerId ORDER BY PersonEmpoymentId DESC) RNum FROM client.personemployment) S 
								WHERE RNum = 1) as PEM on P.RolePlayerId = PEM.EmployeeRolePlayerId
	'+@whereStatement+') s)'

	Print @Select
	Print @SelectCount

	EXEC SP_EXECUTESQL @Select

	DECLARE @ParamDefinition AS NVARCHAR(50)	
	SET @ParamDefinition = N'@RecordCount INT OUTPUT'

	EXEC SP_EXECUTESQL @SelectCount , @ParamDefinition, @RecordCount OUTPUT	
END

