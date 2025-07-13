

CREATE   Procedure [legal].[getDepartmentListForLegalTribunal]
(
@SearchCreatia varchar(100)
)
AS
Begin
select DepartmentId,DepartmentName,DisplayName from (
SELECT 0 AS DepartmentId, 'Unknown' AS DepartmentName, 'Unknown' DisplayName
UNION ALL SELECT 1 AS DepartmentId, 'Billing' AS DepartmentName, 'Billing' DisplayName
UNION ALL SELECT 2 AS DepartmentId, 'Claims' AS DepartmentName, 'Claims' DisplayName
UNION ALL SELECT 3 AS DepartmentId, 'ContactCenter' AS DepartmentName, 'Contact Center' DisplayName
UNION ALL SELECT 4 AS DepartmentId, 'Finance' AS DepartmentName, 'Finance' DisplayName
UNION ALL SELECT 5 AS DepartmentId, 'ICT' AS DepartmentName, 'ICT' DisplayName
UNION ALL SELECT 6 AS DepartmentId, 'Integration' AS DepartmentName, 'Integration' DisplayName
UNION ALL SELECT 7 AS DepartmentId, 'LifeOperations' AS DepartmentName, 'Life Operations' DisplayName
UNION ALL SELECT 8 AS DepartmentId, 'Medical' AS DepartmentName, 'Medical' DisplayName
UNION ALL SELECT 9 AS DepartmentId, 'Membership' AS DepartmentName, 'Membership' DisplayName
UNION ALL SELECT 10 AS DepartmentId, 'Pensions' AS DepartmentName, 'Pensions' DisplayName
UNION ALL SELECT 11 AS DepartmentId, 'SalesAndMarketing' AS DepartmentName, 'Sales And Marketing' DisplayName
UNION ALL SELECT 12 AS DepartmentId, 'Unspecified' AS DepartmentName, 'Unspecified' DisplayName
UNION ALL SELECT 15 AS DepartmentId, 'Legal' AS DepartmentName, 'Legal' DisplayName
UNION ALL SELECT 16 AS DepartmentId, 'Debtors' AS DepartmentName, 'Debtors' DisplayName
) as tblDepartment 
where DepartmentName LIKE ('%'+ @SearchCreatia +'%')  
END

--exec [legal].[GetDepartmentListForLegalTribunal] 'c'  -- Parameter @SearchCreatia departmentname search