
-- =========================EXECUTE==================
-- EXEC	[claim].[CMCPoolSearch] 1, 50, 'DateCreated', 'DESC', ''
-- ==================================================

CREATE PROCEDURE [claim].[SCAPoolSearch] 
(
	@PageNumber		AS INT,
	@RowsOfPage		AS INT,
	@SortingCol		AS VARCHAR(100) = 'DateCreated',
	@SortType		AS VARCHAR(100) = 'ASC',
	@SearchCreatia	AS VARCHAR(150) = '',
	@RecordCount	INT = 0 OUTPUT
)
AS 
BEGIN
	-- === DEBUG ========================================================= --
		--DECLARE	@PageNumber		AS INT			=	1;
		--DECLARE	@RowsOfPage		AS INT			=	50;
		--DECLARE	@SortingCol		AS VARCHAR(100) =	'DateCreated';
		--DECLARE	@SortType		AS VARCHAR(100) =	'ASC';
		--DECLARE	@SearchCreatia	AS VARCHAR(150) =	''; -- Should this be @SearchCriteria?
		--DECLARE @RecordCount	INT				=	0 ;
	-- =================================================================== --

	BEGIN -- DECLARE AND INITIALIZE PARAMETERS

		DECLARE @SelectDiseases				AS NVARCHAR(MAX)
		DECLARE @WhereDiseaseStatement		AS NVARCHAR(MAX)
		DECLARE @SelectAccidents			AS NVARCHAR(MAX)
		DECLARE @WhereAccidentStatement		AS NVARCHAR(MAX)
		DECLARE @SelectCount				AS NVARCHAR(MAX)

		DECLARE @IndustryClassTypeMining	AS NVARCHAR(MAX)
		DECLARE @IndustryClassTypeMetals	AS NVARCHAR(MAX)

		DECLARE @InsuranceTypeAccident		AS NVARCHAR(MAX)
		DECLARE @InsuranceTypeDisease		AS NVARCHAR(MAX)
		DECLARE @DiagnosticGroupId			AS NVARCHAR(MAX)
		DECLARE @ClaimTypeCOID				AS NVARCHAR(MAX)
		DECLARE @ClaimTypeCOIDInt			AS NVARCHAR(MAX)
		DECLARE @ClaimBucketClassId			AS NVARCHAR(MAX)

		DECLARE @ClaimRef			AS NVARCHAR(MAX) = '%???'
		DECLARE @DescriptionA		AS NVARCHAR(MAX) = 'Acknowledgment needed on claim(Fatal)'
		DECLARE @DescriptionB		AS NVARCHAR(MAX) = 'Liability Decision needed on claim(Fatal)'
		DECLARE @Priority			AS NVARCHAR(MAX) = 'P1'
		DECLARE @ApplicationA		AS NVARCHAR(MAX) = 'CompCare'
		DECLARE @ApplicationB		AS NVARCHAR(MAX) = 'Modernization'

		-- COMMON CONDITIONS
		SET @IndustryClassTypeMining = (SELECT Id FROM common.IndustryClass	WHERE	[name] = 'Mining')
		SET @IndustryClassTypeMetals = (SELECT Id FROM common.IndustryClass	WHERE	[name] = 'Metals')

		-- ACCIDENT CONDITIONS
		SET	@ClaimTypeCOID			= (SELECT Id					 FROM common.ClaimType				WHERE	[name] = 'IOD-COID')
		SET	@ClaimTypeCOIDInt		= (SELECT Id					 FROM common.ClaimType				WHERE	[name] = 'IOD-COID International')
		SET	@InsuranceTypeAccident	= (SELECT ParentInsuranceTypeID	 FROM claim.ParentInsuranceType		WHERE	[Code] = 'IOD COID'	AND IsActive = 1 AND IsDeleted = 0)	--Injury On Duty COID
		SET	@ClaimBucketClassId		= (SELECT ClaimBucketClassId	 FROM claim.ClaimBucketClass		WHERE	[name] = 'Fatals')
		
		--DISEASE CONDITIONS
		SET	@InsuranceTypeDisease	= (SELECT ParentInsuranceTypeID	 FROM claim.ParentInsuranceType		WHERE Code	 = 'COIDA O/D'	AND IsActive = 1 AND IsDeleted = 0)	--COIDA Occupational Disease
		SET	@DiagnosticGroupId		= (SELECT ICD10DiagnosticGroupId FROM medical.ICD10DiagnosticGroup	WHERE Code	 = 'DRG00'		AND IsActive = 1 AND IsDeleted = 0) --Fatal Pensions

	END

	BEGIN -- CREATE TEMP TABLE

		CREATE TABLE #CMCPool  
		(
				PersonEventId			INT,
				ClaimNumber				VARCHAR(250),  
				[Description]			VARCHAR(250),
				EventNumber				VARCHAR(250),
				DateCreated				DATETIME,
				LifeAssured				VARCHAR(150),
				IdentificationNumber	VARCHAR(50),
				PersonEventStatusId		INT, 
				PersonEventStatusName	VARCHAR(50),
				PersonEventCreatedBy	VARCHAR(150),
				PersonEventAssignedTo	VARCHAR(150),
				LastModifiedBy			VARCHAR(150),
				bucketClassName			VARCHAR(150),
				claimTypeName			INT,
				IndustryClassName		INT,
				IsRoadAccident			BIT,
				STPExitReasonID			INT,
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
				UserName				VARCHAR(150),
				);
		
		DECLARE @Records TABLE (RecordsSelectedCount	INT);

	END

	BEGIN -- BUILD CONDITIONS
		
		-- ACCIDENT CONDITIONS
		IF (@SearchCreatia != '' OR @SearchCreatia != NULL)
			BEGIN 
 				SET @WhereAccidentStatement =  'WHERE 
													(
														--IOD-COID
														(pe.ClaimTypeId = ''' + @ClaimTypeCOID + ''')
														OR
														--IOD-COID International
														(pe.ClaimTypeId = ''' + @ClaimTypeCOIDInt + ''')
													)
												AND (pe.InsuranceTypeId = '''+ @InsuranceTypeAccident + ''')
												AND	
													(
														--INDUSTRY CONDITIONS
														(c.IndustryClassId = ''' + @IndustryClassTypeMining + ''')
														OR
														(c.IndustryClassId = ''' + @IndustryClassTypeMetals + ''')
													)
												AND (pe.PersonEventBucketClassId	= '''	 + @ClaimBucketClassId + ''')
												AND (pe.IsDeleted	= 0)
												AND (e.IsDeleted	= 0)
												AND (cl.IsDeleted	= 0)
												AND (c.IsDeleted	= 0)
												AND	
												(
														(pe.PersonEventReferenceNumber	LIKE ''%'+ @SearchCreatia +'%'')
													OR	(p.FirstName					LIKE ''%'+ @SearchCreatia +'%'') 
													OR	(p.Surname						LIKE ''%'+ @SearchCreatia +'%'') 
													OR	(p.[IdNumber]					LIKE ''%'+ @SearchCreatia +'%'')
													OR	(cl.[ClaimReferenceNumber]		LIKE ''%'+ @SearchCreatia +'%'')
												)
												'
			END
		ELSE
			BEGIN
				SET @WhereAccidentStatement =  'WHERE 
													(
														--IOD-COID
														(pe.ClaimTypeId = ''' + @ClaimTypeCOID + ''')
														OR
														--IOD-COID International
														(pe.ClaimTypeId = ''' + @ClaimTypeCOIDInt + ''')
													)
												AND (pe.InsuranceTypeId = '''+ @InsuranceTypeAccident + ''')
												AND	
													(
														--INDUSTRY CONDITIONS
														(c.IndustryClassId = ''' + @IndustryClassTypeMining + ''')
														OR
														(c.IndustryClassId = ''' + @IndustryClassTypeMetals + ''')
													)
												AND (pe.PersonEventBucketClassId	= '''	 + @ClaimBucketClassId + ''')
												AND (pe.IsDeleted	= 0)
												AND (e.IsDeleted	= 0)
												AND (cl.IsDeleted	= 0)
												AND (c.IsDeleted	= 0)
											'
			END

		--DISEASE CONDITIONS
		IF (@SearchCreatia != '' OR @SearchCreatia != NULL)
			BEGIN 
 				SET @WhereDiseaseStatement =	'WHERE 
													(pe.InsuranceTypeId = '''+ @InsuranceTypeDisease + ''')
												AND	
													(
														--INDUSTRY CONDITIONS
														(c.IndustryClassId = ''' + @IndustryClassTypeMining + ''')
														OR
														(c.IndustryClassId = ''' + @IndustryClassTypeMetals + ''')
													)
												AND (pd.ICD10DiagnosticGroupId = '''	+ @DiagnosticGroupId + ''')
												AND (pe.IsDeleted	= 0)
												AND (e.IsDeleted	= 0)
												AND (cl.IsDeleted	= 0)
												AND (c.IsDeleted	= 0)
												AND	
												(
														(pe.PersonEventReferenceNumber	LIKE ''%'+ @SearchCreatia +'%'')
													OR	(p.FirstName					LIKE ''%'+ @SearchCreatia +'%'') 
													OR	(p.Surname						LIKE ''%'+ @SearchCreatia +'%'') 
													OR	(p.[IdNumber]					LIKE ''%'+ @SearchCreatia +'%'')
													OR	(cl.[ClaimReferenceNumber]		LIKE ''%'+ @SearchCreatia +'%'')
												)
												'
			END
		ELSE
			BEGIN
				SET @WhereDiseaseStatement =	'WHERE
													(pe.InsuranceTypeId = '''+ @InsuranceTypeDisease + ''')
												 AND	
													(
														--INDUSTRY CONDITIONS
														(c.IndustryClassId = ''' + @IndustryClassTypeMining + ''')
														OR
														(c.IndustryClassId = ''' + @IndustryClassTypeMetals + ''')
													)
												 AND 
													(pd.ICD10DiagnosticGroupId = ''' + @DiagnosticGroupId + ''')
												 AND (pe.IsDeleted	= 0)
												 AND (e.IsDeleted	= 0)
												 AND (cl.IsDeleted	= 0)
												 AND (c.IsDeleted	= 0)
												'
			END

	END

	BEGIN -- SET SQL STATEMENT

		BEGIN -- DISEASE CONDITIONS
			
			SET @SelectDiseases = 
					'SELECT  
							pe.PersonEventId			AS PersonEventId,
							cl.[ClaimReferenceNumber]	AS ClaimNumber,
							CASE 
								WHEN cl.[ClaimReferenceNumber] LIKE '''+ @ClaimRef + ''' THEN ''' + @DescriptionA + '''
								ELSE ''' + @DescriptionB + '''
							END AS [Description],
							e.[EventReferenceNumber]	AS EventNumber,
							pe.CreatedDate				AS DateCreated,
							p.FirstName + '' '' + p.Surname 
														As LifeAssured,
							p.IdNumber					AS IdentificationNumber,
							pe.PersonEventStatusId		AS PersonEventStatusId,
							pes.name					AS PersonEventStatusName,
							pe.createdBy				AS PersonEventCreatedBy,
							CASE 
									WHEN ClaimId IS NULL THEN
										(SELECT us.DisplayName FROM  [Security].[User] us  WHERE us.Id = pe.AssignedToUserID)
									ELSE 
										(SELECT  us.DisplayName FROM  [Security].[User] us  WHERE  us.Id = cl.AssignedToUserId) 
									END
														AS PersonEventAssignedTo,
							pe.modifiedBy				AS LastModifiedBy,
							NULL						AS bucketClassName,
							NULL						AS claimTypeName,
							i.id						AS IndustryClassName,
							0							AS IsRoadAccident,
							(
								SELECT 
										TOP 1 STPExitReasonID 
								FROM 
										claim.PersonEventSTPExitReasons 
								WHERE	
										PersonEventId = pe.PersonEventId 
								ORDER BY 
										ClaimSTPExitReasonID DESC
							)							AS STPExitReason,
							'''+ @Priority+'''			AS [Priority],
							CASE	
								WHEN pe.[CompCarePersonEventId] IS NOT NULL THEN ''' + @ApplicationA + ''' 
								ELSE '''+ @ApplicationB + ''' 
							END							AS [Application],
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
							CASE 
									WHEN ClaimId IS NULL THEN
										(SELECT us.DisplayName FROM  [Security].[User] us  WHERE us.Id = pe.AssignedToUserID)
									ELSE 
										(SELECT  us.DisplayName FROM  [Security].[User] us  WHERE  us.Id = cl.AssignedToUserId) 
									END									
																AS UserName

					FROM	claim.PersonEvent				AS pe 
							INNER JOIN	claim.PersonEventDiseaseDetail	AS acc	ON pe.PersonEventId = acc.PersonEventId
							INNER JOIN	claim.PhysicalDamage			AS pd	ON pe.PersonEventId = pd.PersonEventId
							INNER JOIN	claim.[EventCause]				AS ec	ON acc.[CauseOfDiseaseId] = ec.[EventCauseID]
							INNER JOIN	claim.Claim						AS cl	ON pe.PersonEventId = cl.PersonEventId
							INNER JOIN	common.PersonEventStatus		AS pes	ON pes.id = pe.PersonEventStatusId
							INNER JOIN	claim.[Event]					AS e	ON pe.EventId = e.EventId 
							INNER JOIN	client.RolePlayer				AS r	ON pe.CompanyRolePlayerId = r.RolePlayerId
							INNER JOIN	client.Company					AS c	ON r.RolePlayerId = c.RolePlayerId
							INNER JOIN	common.IndustryClass			AS i	ON c.industryClassId = i.Id
							INNER JOIN	client.Person					AS p	ON pe.InsuredLifeId = p.RolePlayerId 
							LEFT JOIN	bpm.Wizard					wizard WITH (NOLOCK) ON pe.EventId = wizard.LinkedItemId
							LEFT JOIN	bpm.WizardConfiguration		WConfig WITH (NOLOCK) ON WConfig.Id = wizard.WizardConfigurationId
					'+@WhereDiseaseStatement+''

		END

		BEGIN -- ACCIDENT CONDITIONS
			
			SET @SelectAccidents = 
					'SELECT  
							pe.PersonEventId			AS PersonEventId,
							cl.[ClaimReferenceNumber]	AS ClaimNumber,
							CASE 
								WHEN cl.[ClaimReferenceNumber] LIKE '''+ @ClaimRef + ''' THEN '''+ @DescriptionA + '''
								ELSE ''' + @DescriptionB + '''
							END							AS [Description],
							e.[EventReferenceNumber]	AS EventNumber,
							pe.CreatedDate				AS DateCreated,
							p.FirstName + '' '' + p.Surname 
														AS LifeAssured,
							p.IdNumber					AS IdentificationNumber,
							pe.PersonEventStatusId		AS PersonEventStatusId,
							pes.name					AS PersonEventStatusName,
							pe.createdBy				AS PersonEventCreatedBy,
							CASE 
									WHEN ClaimId IS NULL THEN
										(SELECT us.DisplayName FROM  [Security].[User] us  WHERE us.Id = pe.AssignedToUserID)
									ELSE 
										(SELECT  us.DisplayName FROM  [Security].[User] us  WHERE  us.Id = cl.AssignedToUserId) 
									END							
														AS PersonEventAssignedTo,
							pe.modifiedBy				AS LastModifiedBy,
							cb.[Name]					AS bucketClassName,
							ct.id						AS claimTypeName,
							i.id						AS IndustryClassName,
							acc.isRoadAccident			AS IsRoadAccident,
							(
								SELECT 
									TOP 1 STPExitReasonID 
								FROM 
									claim.PersonEventSTPExitReasons 
								WHERE 
									PersonEventId = pe.PersonEventId 
								ORDER BY 
									ClaimSTPExitReasonID DESC
							)							AS STPExitReason,
							'''+@Priority+'''			AS [Priority],
							CASE 
								WHEN pe.[CompCarePersonEventId] IS NOT NULL THEN '''+ @ApplicationA + ''' 
								ELSE ''' + @ApplicationB + ''' 
							END							AS [Application],
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
							CASE 
									WHEN ClaimId IS NULL THEN
										(SELECT us.DisplayName FROM  [Security].[User] us  WHERE us.Id = pe.AssignedToUserID)
									ELSE 
										(SELECT  us.DisplayName FROM  [Security].[User] us  WHERE  us.Id = cl.AssignedToUserId) 
									END									
																AS UserName

					FROM	claim.PersonEvent				AS pe 
						INNER JOIN	claim.PersonEventAccidentDetail AS acc	ON pe.PersonEventId = acc.PersonEventId
						INNER JOIN	claim.PhysicalDamage			AS pd	ON pe.PersonEventId = pd.PersonEventId
						INNER JOIN	claim.Claim						AS cl	ON pe.PersonEventId = cl.PersonEventId
						INNER JOIN	claim.claimBucketClass			AS cb	ON pe.personEventBucketclassid = cb.claimBucketClassId
						INNER JOIN	common.ClaimType				AS ct	ON pe.claimTypeId = ct.id
						INNER JOIN	common.personEventStatus		AS pes	ON pes.id = pe.PersonEventStatusId
						INNER JOIN	claim.[Event]					AS e	ON pe.EventId = e.EventId 
						INNER JOIN	client.RolePlayer				AS r	ON pe.CompanyRolePlayerId = r.RolePlayerId
						INNER JOIN	client.Company					AS c	ON r.RolePlayerId = c.RolePlayerId
						INNER JOIN	common.industryClass			AS i	ON c.industryClassId = i.Id
						INNER JOIN	client.Person					AS p	ON pe.InsuredLifeId = p.RolePlayerId
						LEFT JOIN	bpm.Wizard					wizard WITH (NOLOCK) ON pe.EventId = wizard.LinkedItemId
						LEFT JOIN	bpm.WizardConfiguration		WConfig WITH (NOLOCK) ON WConfig.Id = wizard.WizardConfigurationId
					'+@WhereAccidentStatement+'' 

		END

		BEGIN -- COUNT RECORDS FOR BOTH CONDITIONS
			
			SET @SelectCount = '
						SELECT 
							COUNT(*)
						FROM			claim.PersonEvent				AS pe 
							INNER JOIN	claim.PersonEventDiseaseDetail	AS acc	ON pe.PersonEventId = acc.PersonEventId
							INNER JOIN	claim.PhysicalDamage			AS pd	ON pe.PersonEventId = pd.PersonEventId
							INNER JOIN	claim.[EventCause]				AS ec	ON acc.[CauseOfDiseaseId] = ec.[EventCauseID]
							INNER JOIN	claim.Claim						AS cl	ON pe.PersonEventId = cl.PersonEventId
							INNER JOIN	common.PersonEventStatus		AS pes	ON pes.id = pe.PersonEventStatusId
							INNER JOIN	claim.[Event]					AS e	ON pe.EventId = e.EventId 
							INNER JOIN	client.RolePlayer				AS r	ON pe.CompanyRolePlayerId = r.RolePlayerId
							INNER JOIN	client.Company					AS c	ON r.RolePlayerId = c.RolePlayerId
							INNER JOIN	common.IndustryClass			AS i	ON c.industryClassId = i.Id
							INNER JOIN	client.Person					AS p	ON pe.InsuredLifeId = p.RolePlayerId 
				'+@WhereDiseaseStatement+''
			INSERT INTO @Records (RecordsSelectedCount) EXEC SP_EXECUTESQL @SelectCount
			
			SET @SelectCount = '
						SELECT 
							COUNT(*)
						FROM			claim.PersonEvent				AS pe 
							INNER JOIN	claim.PersonEventAccidentDetail AS acc	ON pe.PersonEventId = acc.PersonEventId
							INNER JOIN	claim.PhysicalDamage			AS pd	ON pe.PersonEventId = pd.PersonEventId
							INNER JOIN	claim.Claim						AS cl	ON pe.PersonEventId = cl.PersonEventId
							INNER JOIN	claim.claimBucketClass			AS cb	ON pe.personEventBucketclassid = cb.claimBucketClassId
							INNER JOIN	common.ClaimType				AS ct	ON pe.claimTypeId = ct.id
							INNER JOIN	common.personEventStatus		AS pes	ON pes.id = pe.PersonEventStatusId
							INNER JOIN	claim.[Event]					AS e	ON pe.EventId = e.EventId 
							INNER JOIN	client.RolePlayer				AS r	ON pe.CompanyRolePlayerId = r.RolePlayerId
							INNER JOIN	client.Company					AS c	ON r.RolePlayerId = c.RolePlayerId
							INNER JOIN	common.industryClass			AS i	ON c.industryClassId = i.Id
							INNER JOIN	client.Person					AS p	ON pe.InsuredLifeId = p.RolePlayerId
				'+@WhereAccidentStatement+''
			INSERT INTO @Records (RecordsSelectedCount) EXEC SP_EXECUTESQL @SelectCount

		END

	END

	BEGIN -- PRE COMBINING SORT & ORDER LOGIC
		
		DECLARE @OrderQuery AS NVARCHAR(MAX) 
		SET		@OrderQuery = NULL;
		SET		@OrderQuery = ' ORDER BY ';

		IF(@SortingCol = 'DateCreated')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' DateCreated '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'PersonEventId')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' PersonEventId '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF(@SortingCol = 'LifeAssured')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' LifeAssured '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF(@SortingCol = 'PersonEventStatusId')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' PersonEventStatusId '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF(@SortingCol = 'PersonEventStatusName')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' PersonEventStatusName '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF(@SortingCol = 'PersonEventCreatedBy')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' PersonEventCreatedBy '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF(@SortingCol = 'LastModified')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' LastModifiedBy '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'assignedTo')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' PersonEventAssignedTo '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'description')
		BEGIN
		  SET @OrderQuery = @OrderQuery + 'Description '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'dateSent')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' DateCreated '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'dateDue')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' DateCreated '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'priority')
		BEGIN
		  SET @OrderQuery = @OrderQuery + 'Priority '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'eventNumber')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' EventNumber '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'identificationNumber')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' IdentificationNumber '
		  SET @OrderQuery = @OrderQuery + @SortType
		END
		ELSE IF (@SortingCol = 'sourceApplication')
		BEGIN
		  SET @OrderQuery = @OrderQuery + ' Application '
		  SET @OrderQuery = @OrderQuery + @SortType
		END

	END

	BEGIN -- EXECUTE

		INSERT INTO #CMCPool EXEC SP_EXECUTESQL @SelectDiseases
		INSERT INTO #CMCPool EXEC SP_EXECUTESQL @SelectAccidents

		DECLARE @FinalQuery AS NVARCHAR(MAX)
		SET		@FinalQuery = 'SELECT  * FROM #CMCPool '  + @orderQuery + '
					OFFSET ('+CAST(@PageNumber AS NVARCHAR(15))+'-1) * '+ CAST(@RowsOfPage AS NVARCHAR(15))+' ROWS
					FETCH NEXT '+CAST(@RowsOfPage AS NVARCHAR(15))+' ROWS ONLY'
	
		SET		@RecordCount = (SELECT SUM(RecordsSelectedCount) FROM @Records)

		DECLARE @ParamDefinition AS NVARCHAR(50)	
		SET		@ParamDefinition = N'@RecordCount INT OUTPUT'

		EXEC SP_EXECUTESQL @FinalQuery , @ParamDefinition, @RecordCount OUTPUT
			
	END

	BEGIN -- CLEAN UP

		IF OBJECT_ID('tempdb..#CMCPool') IS NOT NULL DROP TABLE #CMCPool;

	END

END