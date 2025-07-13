


--EXEC  POPI.USP_AddRMADataOwnerDepartmentEP
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: Column Extended Properties (DataOwnerDepartment)
-- =============================================

CREATE PROCEDURE [POPI].[USP_AddRMADataOwnerDepartmentEP]
	-- Add the parameters for the stored procedure here
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.


	SET NOCOUNT ON;

	--IF DAY(GETDATE()) <> 1
	--	RETURN;

	DECLARE	 @RowCount				INT = 1
			,@TotalCount			INT = 0
			,@SQLCommand			VARCHAR(8000)
			,@TableID				INT
			,@ColumnID				INT

	DROP TABLE IF EXISTS #TempRMADataOwnerDepartment

SELECT
DISTINCT
S.name as [Schema],
O.object_id AS [TableID],
O.name AS [Table],
c.column_id AS [ColumnID],
c.name AS [Column],
ep.name AS [ExtendedPropertyName],
ep.value AS [CurrentExtendedPropertyValue],
--dc.RMADataClassification_Name,
--dc.RMADataInformationType,
--dc.RMAIsPOPI_Name,
dc.DataOwnerDepartment,
 'DataOwnerDepartment' AS NewExtendedPropertyName,

CASE
WHEN (dc.DataOwnerDepartment IS NOT NULL) THEN dc.DataOwnerDepartment

--ELSE ep.value
ELSE 'UnClassified'
END AS [NewExtendedPropertyValue],
--ep.value as [OldExtendedPropertyValue],

 CASE
WHEN (ISNULL(ep.name,'') <> 'DataOwnerDepartment')-- AND ep.major_id IS NULL AND ep.minor_id IS NULL)
THEN
'
EXECUTE sp_addextendedproperty @name = N''DataOwnerDepartment''
,@value = N''' + CASE WHEN (dc.DataOwnerDepartment IS NOT NULL) THEN dc.DataOwnerDepartment ELSE 'UnClassified' END + '''
,@level0type = N''SCHEMA''
,@level0name = ''' + S.name + '''
,@level1type = N''Table''
,@level1name = ''' + O.name + '''
,@level2type = ''Column''
,@level2name = ''' + c.name + ''';
'
ELSE
'
EXECUTE sp_updateextendedproperty @name = N''DataOwnerDepartment''
,@value = N''' + CASE WHEN (dc.DataOwnerDepartment IS NOT NULL) THEN dc.DataOwnerDepartment ELSE 'UnClassified' END + '''
,@level0type = N''SCHEMA''
,@level0name = ''' + S.name + '''
,@level1type = N''Table''
,@level1name = ''' + O.name + '''
,@level2type = ''Column''
,@level2name = ''' + c.name + ''';
'
END AS [TSQL_DataOwnerDepartment]


	INTO #TempRMADataOwnerDepartment

 
 --,dc.*
--FROM sys.extended_properties EP
-- SELECT o.name AS Tablename,c.name AS ColumnName,c.column_id,ep.name AS EpName,ep.*,dc.RMADataClassification_Name,dc.RMADataInformationType,dc.RMAIsPOPI_Name
FROM sys.all_objects O --ON ep.major_id = O.object_id
LEFT JOIN sys.schemas S on O.schema_id = S.schema_id
--LEFT JOIN sys.columns AS c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
LEFT JOIN sys.columns AS c ON o.[object_id] = c.[object_id]

LEFT JOIN sys.extended_properties EP ON (O.[object_id] = ep.major_id) AND (c.[object_id] = ep.major_id) AND (c.column_id = ep.minor_id)
AND (ep.name = 'DataOwnerDepartment')
--AND (ep.name NOT LIKE 'sys%')

LEFT JOIN  [dbo].[PopiMaster] dc ON (S.[name] = dc.Table_Schema) AND (O.[name] = dc.[Table_Name]) AND (c.[name] = dc.[Column_Name])

WHERE  (o.[type] = 'U')
--and (((DataOwnerDepartment is not null) and (ep.value <> dc.DataOwnerDepartment) and ISNULL(ep.name,'') = 'DataOwnerDepartment') or ( ISNULL(ep.name,'')=''))

AND (((dc.[DataOwnerDepartment] IS NOT NULL) AND (ep.[value] <> dc.[DataOwnerDepartment]) AND ISNULL(ep.[name],'') = 'DataOwnerDepartment') OR ( ISNULL(ep.[name],'')='') OR ( ISNULL(dc.[DataOwnerDepartment],'')='' AND ISNULL(ep.[name],'') = 'DataOwnerDepartment' AND ep.[value] NOT IN ('None','UnClassified')))


AND (S.name <>'sys')

ORDER BY 1,2,3



	SELECT @TotalCount = (SELECT COUNT(1) FROM #TempRMADataOwnerDepartment)

	IF @TotalCount > 0
	BEGIN

		WHILE @RowCount <= @TotalCount
		BEGIN

			SELECT
					 TOP 1
					 @TableID = [TableID]
					,@ColumnID = [ColumnID]
					,@SQLCommand = [TSQL_DataOwnerDepartment]
			FROM #TempRMADataOwnerDepartment
			ORDER BY
						 [TableID]
						,[ColumnID]

			--SELECT @TableID, @ColumnID, @SQLCommand

			--PRINT @SQLCommand
			EXEC (@SQLCommand)

			DELETE FROM #TempRMADataOwnerDepartment
			WHERE ([TableID] = @TableID)
			AND ([ColumnID] = @ColumnID)

			SELECT @RowCount = @RowCount + 1
		END
	END

	DROP TABLE IF EXISTS #TempRMADataOwnerDepartment

END