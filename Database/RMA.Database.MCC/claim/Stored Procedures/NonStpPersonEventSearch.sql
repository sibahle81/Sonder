GO
--SET ANSI_NULLS ON
GO
--SET QUOTED_IDENTIFIER ON
GO

	-- =========================EXECUTE==================
	-- EXEC	[claim].[NonStpPersonEventSearch] 1, 50, 'DateCreated', 'DESC', ''
	-- ==================================================

CREATE PROCEDURE [claim].[NonStpPersonEventSearch] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100)	= 'DateCreated',
	@SortType			AS	VARCHAR(100)	= 'ASC',
	@SearchCreatia		AS	VARCHAR(150)	= '',
	@RecordCount		INT = 0 OUTPUT
)
AS
BEGIN

		-- === DEBUG ========================================================= --
			--DECLARE	@PageNumber		AS INT			=	1;
			--DECLARE	@RowsOfPage		AS INT			=	5;
			--DECLARE	@SortingCol		AS VARCHAR(100) =	'DateCreated';
			--DECLARE	@SortType		AS VARCHAR(100) =	'ASC';
			--DECLARE	@SearchCreatia	AS VARCHAR(150) =	''; -- Should this be @SearchCriteria?
			--DECLARE @RecordCount	INT				=	0 ;
		-- =================================================================== --

		BEGIN -- DECLARE AND INITIALIZE PARAMETERS

			DECLARE @Select				AS NVARCHAR(MAX)
			DECLARE @SelectCount		As NVARCHAR(MAX)
			DECLARE @WhereStatement		AS NVARCHAR(MAX)

			DECLARE @Priority			AS NVARCHAR(MAX) = 'P1'
			DECLARE @ApplicationA		AS NVARCHAR(MAX) = 'CompCare'
			DECLARE @ApplicationB		AS NVARCHAR(MAX) = 'Modernization'

		END

		BEGIN -- CLEAN UP

			IF OBJECT_ID('tempdb..#CADPool') IS NOT NULL DROP TABLE #CADPool;

		END

		BEGIN -- CREATE TEMP TABLE
			
			CREATE TABLE #CADPool  
			(
				PersonEventId			INT,
				ClaimNumber				VARCHAR(250),  
				[Description]			VARCHAR(250),
				EventNumber				VARCHAR(250),
				DateCreated				DATETIME,
				LifeAssured				VARCHAR(150),
				PersonEventStatusId		INT, 
				PersonEventStatusName	VARCHAR(50),
				IdentificationNumber	VARCHAR(50),
				PersonEventCreatedBy	VARCHAR(150),
				PersonEventAssignedTo	VARCHAR(150),
				UserName				VARCHAR(150),
				NUserSLA				VARCHAR(50),
				UserSLAHours			VARCHAR(50),
				OverAllSLAHours			VARCHAR(50),
				LastModifiedBy			VARCHAR(150),
				BucketClassName			VARCHAR(150),
				ClaimTypeName			INT,
				IndustryClassName		INT,
				IsRoadAccident			BIT,
				STPExitReason			INT,
				[Priority]				VARCHAR(50),
				[Application]			VARCHAR(50),
				[ClaimId]				INT,
				LastWorkedOnUserId		INT,
				workPoolId				INT,
				WizardUserId			INT,
				PersonEventReference	VARCHAR(50),
				WizardId				INT,
				WizardConfigurationId	INT,
				WizardStatusId			INT,
				ClaimStatusId			INT,
				AssignedToUserId		INT,
				UserId					INT,
				DiseaseTypeID			INT,
				DiseaseDescription		VARCHAR(250),
				LiabilityStatus			INT,
				EventType				INT,
				IsTopEmployer			BIT
			);

			DECLARE @Records TABLE (RecordsSelectedCount	INT);

		END

		BEGIN -- DEFINE WHERE CONDITIONS
			
			IF (@SearchCreatia != '' or @SearchCreatia != Null)
			BEGIN
				SET @WhereStatement =  'WHERE 
										(
											(pe.IsStraightThroughProcess = 0) 
										AND (pe.PersonEventReferenceNumber	LIKE ''%'+@SearchCreatia+'%'')
										OR	(p.FirstName					LIKE ''%'+@SearchCreatia+'%'') 
										OR	(p.Surname						LIKE ''%'+@SearchCreatia+'%'') 
										OR	(p.[IdNumber]					LIKE ''%'+@SearchCreatia+'%'')
										OR	(cl.[ClaimReferenceNumber]		LIKE ''%'+@SearchCreatia+'%'')
										OR	(ec.Description					LIKE ''%'+@SearchCreatia+'%'')
										)'
			END
			ELSE
			BEGIN
				SET @WhereStatement = 'WHERE (pe.IsStraightThroughProcess = 0)'
			END

		END

		BEGIN -- SORTING LOGIC

			DECLARE @OrderQuery AS NVARCHAR(MAX) 
			SET		@OrderQuery = ' ORDER BY '
		
			IF(@SortingCol = 'DateCreated')
			BEGIN
			  SET @OrderQuery = @OrderQuery + ' pe.CreatedDate '
			  SET @OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF (@SortingCol = 'PersonEventId')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' pe.PersonEventId '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END

			ELSE IF(@SortingCol = 'LifeAssured')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' p.FirstName '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF(@SortingCol = 'PersonEventStatusId')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' pe.PersonEventStatusId '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF(@SortingCol = 'PersonEventStatusName')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' pes.name '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF(@SortingCol = 'PersonEventCreatedBy')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' pe.createdBy '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF(@SortingCol = 'LastModifiedBy')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' pe.modifiedBy '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF(@SortingCol = 'claimNumber')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' cl.[ClaimReferenceNumber] '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			ELSE IF(@SortingCol = 'IdentificationNumber')
			BEGIN
			  SET	@OrderQuery = @OrderQuery + ' p.IdNumber '
			  SET	@OrderQuery = @OrderQuery + @SortType
			END
			
			

		END
		
		BEGIN -- SET THE MAIN SCRIPT

			SET @Select = 'SELECT  
								pe.PersonEventId					AS PersonEventId,
								cl.[ClaimReferenceNumber]			AS ClaimNumber,
								''''								AS Description,
								''''								AS EventNumber,
								pe.CreatedDate						AS DateCreated,
								p.FirstName + '' '' + p.Surname		AS LifeAssured,
								pe.PersonEventStatusId				AS PersonEventStatusId,
								pes.[Name]							AS PersonEventStatusName,

								p.IdNumber							AS IdentificationNumber,

								pe.CreatedBy						AS PersonEventCreatedBy,
								''''								AS PersonEventAssignedTo,

								CASE 
									WHEN ClaimId IS NULL THEN
										(
											SELECT 
												us.DisplayName
											FROM 
												[Security].[User] us 
											WHERE
												us.Id = pe.AssignedToUserID)
									ELSE 
										(
											SELECT 
												us.DisplayName
											FROM 
												[Security].[User] us 
											WHERE 
												us.Id = cl.AssignedToUserId) 
								END									AS UserName,
								0									AS NUserSLA,
								0									AS UserSLAHours,
								0									AS OverAllSLAHours,
								pe.ModifiedBy						AS LastModifiedBy,
								cb.[Name]							AS BucketClassName,
								ct.id								AS ClaimTypeName,
								i.id								AS IndustryClassName,
								0									AS IsRoadAccident,
								(
									SELECT 
										TOP 1 STPExitReasonID 
									FROM 
										claim.PersonEventSTPExitReasons 
									WHERE 
										PersonEventId = pe.PersonEventId 
									ORDER BY 
										ClaimSTPExitReasonID DESC)	AS STPExitReason,
								''' + @Priority + '''				AS [Priority],
								CASE
									WHEN pe.[CompCarePersonEventId] IS NOT NULL THEN ''' + @ApplicationA + ''' 
									ELSE ''' + @ApplicationB + ''' 
								END									AS [Application],
								cl.[ClaimId]						AS ClaimId,
								0									AS LastWorkedOnUserId,
								11									AS workPoolId,
								0									AS WizardUserId,
								pe.PersonEventReferenceNumber		AS PersonEventReference,
								CASE 
									WHEN Wizard.ID IS NULL THEN 0
									ELSE Wizard.Id
								END									AS WizardId,
								Wizard.WizardConfigurationId		AS WizardConfigurationId,
								Wizard.WizardStatusId				AS WizardStatusId,
								cl.ClaimStatusId					AS ClaimStatusId,
								cl.AssignedToUserId					AS AssignedToUserId,
								cl.AssignedToUserId					AS UserId,
								pedd.TypeOfDiseaseId				AS DiseaseTypeID,
								ec.Description						AS DiseaseDescription,
								cl.claimLiabilityStatusId           AS LiabilityStatus,
							    e.eventtypeId							AS EventType,
								c.IsTopEmployer	
		
							FROM		claim.PersonEvent			AS pe 
							INNER JOIN	claim.Claim					AS cl	ON pe.PersonEventId				= cl.PersonEventId
							INNER JOIN	claim.claimBucketClass		AS cb	ON pe.personEventBucketclassid	= cb.claimBucketClassId
							LEFT JOIN	common.ClaimType			AS ct	WITH (NOLOCK) ON pe.claimTypeId	= ct.id
							INNER JOIN	common.personEventStatus	AS pes	ON pes.id						= pe.PersonEventStatusId
							INNER JOIN	claim.Event					AS e	ON pE.EventId					= e.EventId 
							INNER JOIN	client.RolePlayer			AS r	ON pe.CompanyRolePlayerId		= r.RolePlayerId
							INNER JOIN	client.Company				AS c	ON r.RolePlayerId				= c.RolePlayerId
							INNER JOIN	common.IndustryClass		AS i	ON c.industryClassId			= i.Id
							INNER JOIN	client.Person				AS p	ON pe.InsuredLifeId				= p.RolePlayerId
							LEFT JOIN	bpm.Wizard					wizard WITH (NOLOCK) ON pe.EventId = wizard.LinkedItemId
							LEFT JOIN	bpm.WizardConfiguration		WConfig WITH (NOLOCK) ON WConfig.Id = wizard.WizardConfigurationId
							INNER JOIN  CLAIM.PersonEventDiseaseDetail	AS pedd  ON pe.PersonEventId= pedd.PersonEventId  
							INNER join claim.DiseaseType  as ec on pedd.TypeOfDiseaseId = ec.DiseaseTypeID
							'+@WhereStatement+' ' +@OrderQuery +'
							OFFSET ('+CAST(@PageNumber AS NVARCHAR(15))+'-1) * '+CAST(@RowsOfPage AS NVARCHAR(15))+' ROWS
							FETCH NEXT '+CAST(@RowsOfPage AS NVARCHAR(15))+' ROWS ONLY'

		END

		BEGIN -- GET THE RECORD COUNT
			
			SET @SelectCount = 'SELECT 
									COUNT(*)
								FROM		claim.PersonEvent	AS pe 
								INNER JOIN	claim.Claim			AS cl	ON pe.PersonEventId			= cl.PersonEventId
								INNER JOIN  CLAIM.PersonEventDiseaseDetail	AS pedd  ON pe.PersonEventId = pedd.PersonEventId  
								INNER JOIN	claim.Event			AS e	ON pe.EventId				= e.EventId 
								INNER JOIN	client.RolePlayer	AS r	ON pe.CompanyRolePlayerId	= r.RolePlayerId
								INNER JOIN	client.Company		AS c	ON r.RolePlayerId			= c.RolePlayerId
								INNER JOIN	client.Person		AS p	ON pe.InsuredLifeId			= p.RolePlayerId
								INNER join claim.DiseaseType  as ec on pedd.TypeOfDiseaseId = ec.DiseaseTypeID
								'+@WhereStatement + ''
			INSERT INTO @Records (RecordsSelectedCount) EXEC SP_EXECUTESQL @SelectCount

		END

		BEGIN -- EXECUTE

			INSERT INTO #CADPool EXEC SP_EXECUTESQL @Select
		
			DECLARE @FinalQuery AS NVARCHAR(MAX)
			SET		@FinalQuery = 'SELECT  * FROM #CADPool';

			SET		@RecordCount = (SELECT SUM(RecordsSelectedCount) FROM @Records)

			DECLARE @ParamDefinition AS NVARCHAR(50)	
			SET		@ParamDefinition = N'@RecordCount INT OUTPUT'

			EXEC SP_EXECUTESQL @FinalQuery , @ParamDefinition, @RecordCount OUTPUT

		END

		BEGIN -- CLEAN UP

			IF OBJECT_ID('tempdb..#CADPool') IS NOT NULL DROP TABLE #CADPool;

		END
END

