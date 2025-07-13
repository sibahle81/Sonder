
CREATE PROCEDURE [client].[GetPagedRolePlayerContacts]
(
	@PageNumber		AS INT,
	@RowsOfPage		AS INT,
	@SortingCol		AS VARCHAR(100) = 'Firstname',
	@SortType		AS VARCHAR(100) = 'ASC',
	@SearchCreatia	AS VARCHAR(150) = '',
	@RecordCount	INT = 0 OUTPUT
)
AS 
BEGIN

--DECLARE	@PageNumber		AS INT			=	1;
--DECLARE	@RowsOfPage		AS INT			=	5;
--DECLARE	@SortingCol		AS VARCHAR(100) =	'Firstname';
--DECLARE	@SortType		AS VARCHAR(100) =	'ASC';
--DECLARE	@SearchCreatia	AS VARCHAR(150) =	'137031';
--DECLARE @RecordCount	INT				=	0 ;

SELECT  RC.TitleId AS 'Title',
		RC.Firstname,
		RC.Surname,
		RC.EmailAddress,
		RC.ContactNumber,
		RC.ContactDesignationTypeId AS 'ContactDesignationType',
		RC.CommunicationTypeId AS 'CommunicationType',
		RC.RolePlayerContactId,
		RCI.ContactInformationTypeId AS 'ContactInformationType',
		RCI.RolePlayerContactId,
		RCI.RolePlayerContactInformationId
FROM [client].[RolePlayerContact] [RC]
FULL  OUTER JOIN [client].[RolePlayerContactInformation] [RCI] ON RCI.RolePlayerContactId = [RC].RolePlayerContactId
WHERE [RC].RolePlayerId = CAST(@SearchCreatia AS int)
ORDER BY [RC].Firstname ASC
OFFSET (@PageNumber +-1) * @RowsOfPage 
ROWS FETCH NEXT @RowsOfPage  ROWS ONLY

SELECT @RecordCount = @@ROWCOUNT;

END