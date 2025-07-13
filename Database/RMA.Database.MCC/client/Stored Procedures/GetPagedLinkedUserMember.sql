
CREATE PROCEDURE [client].[GetPagedLinkedUserMember]
(
	@PageNumber		AS INT,
	@RowsOfPage		AS INT,
	@SortingCol		AS VARCHAR(100) = 'Name',
	@SortType		AS VARCHAR(100) = 'ASC',
	@SearchCreatia	AS VARCHAR(150) = '',
	@RecordCount	INT = 0 OUTPUT
)
AS 
BEGIN

--DECLARE	@PageNumber		AS INT			=	1;
--DECLARE	@RowsOfPage		AS INT			=	5;
--DECLARE	@SortingCol		AS VARCHAR(100) =	'Name';
--DECLARE	@SortType		AS VARCHAR(100) =	'ASC';
--DECLARE	@SearchCreatia	AS VARCHAR(150) =	'2935';
--DECLARE @RecordCount	INT				=	0 ;

SELECT DISTINCT [COMPANY].[RolePlayerId], [COMPANY].[Name] as 'MemberName', [FINPAYEE].FinPayeNumber, [MAP].UserCompanyMapStatusId as 'UserCompanyMapStatus', [MAP].RoleId
FROM [security].[UserCompanyMap] [MAP]
INNER JOIN [client].[Company] [COMPANY] ON [COMPANY].RolePlayerId = [MAP].CompanyId
INNER JOIN [client].[FinPayee] [FINPAYEE] ON [FINPAYEE].RolePlayerId = [MAP].CompanyId
WHERE UserId = CAST(@SearchCreatia AS int) AND [MAP].UserCompanyMapStatusId = 2 -- Active
ORDER BY [COMPANY].[Name] ASC
OFFSET (@PageNumber +-1) * @RowsOfPage 
ROWS FETCH NEXT @RowsOfPage  ROWS ONLY

SELECT @RecordCount = @@ROWCOUNT;

END