


--EXEC  POPI.USP_AddMaskingAllNonComputedTables
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: Column Extended Properties (MaskingAllNonComputed)
-- =============================================

CREATE PROCEDURE [POPI].[USP_AddMaskingAllNonComputedTables]
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

	DROP TABLE IF EXISTS #TempMaskingAllNonComputed


SELECT
DISTINCT
S.name as [Schema],
O.object_id AS [TableID],
O.name AS [Table],
c.column_id AS [ColumnID],
c.name AS [Column],
CASE when mc.is_masked=1 then 'Masked' else 'Not Masked' END as ISMasked,
dc.RMADataClassification,
dc.RMADataInformationType,
dc.RMAIsPOPI,


'ALTER TABLE ['+ S.name +'].['+O.name+'] ALTER COLUMN ['+c.name+'] ADD MASKED WITH (FUNCTION = ''default()'');'
AS [TSQL_Masking]
	INTO #TempMaskingAllNonComputed
 --,dc.*
--FROM sys.extended_properties EP
-- SELECT o.name AS Tablename,c.name AS ColumnName,c.column_id,ep.name AS EpName,ep.*,dc.RMADataClassification_Name,dc.RMADataInformationType,dc.RMAIsPOPI_Name
FROM sys.all_objects O --ON ep.major_id = O.object_id
LEFT JOIN sys.schemas S on O.schema_id = S.schema_id
--LEFT JOIN sys.columns AS c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
LEFT JOIN sys.columns AS c ON o.[object_id] = c.[object_id]
LEFT JOIN SYS.masked_columns mc on (O.[object_id] = mc.object_id) AND (c.[object_id] = mc.object_id) and (c.column_id = mc.column_id) AND mc.is_masked=1
--LEFT JOIN sys.extended_properties EP ON (O.[object_id] = ep.major_id) AND (c.[object_id] = ep.major_id) AND (c.column_id = ep.minor_id)

LEFT JOIN  [dbo].[PopiMaster] dc ON (S.[name] = dc.Table_Schema) AND (O.[name] = dc.[Table_Name]) AND (c.[name] = dc.[Column_Name])


WHERE  dc.RMADataClassification in ('Confidential','Sensitive') 
--and dc.RMADataInformationType='Personal'
AND (o.[type] = 'U')
 AND (S.name <>'sys')
 and O.[object_id]  not in (select distinct [object_id] from sys.computed_columns)

--AND (dc.[Schema] IS NOT NULL)

--AND dc.[Column] = 'BirthDateID'

ORDER BY 1,2,3



	SELECT @TotalCount = (SELECT COUNT(1) FROM #TempMaskingAllNonComputed)

	IF @TotalCount > 0
	BEGIN

		WHILE @RowCount <= @TotalCount
		BEGIN

			SELECT
					 TOP 1
					 @TableID = [TableID]
					,@ColumnID = [ColumnID]
					,@SQLCommand = [TSQL_Masking]
			FROM #TempMaskingAllNonComputed
			ORDER BY
						 [TableID]
						,[ColumnID]

			--SELECT @TableID, @ColumnID, @SQLCommand

			--PRINT @SQLCommand
			EXEC (@SQLCommand)

			DELETE FROM #TempMaskingAllNonComputed
			WHERE ([TableID] = @TableID)
			AND ([ColumnID] = @ColumnID)

			SELECT @RowCount = @RowCount + 1
		END
	END

	DROP TABLE IF EXISTS #TempMaskingAllNonComputed

END