
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 2020-11-04
-- EXEC [policy].[WaivedPolicyReport] 0, 0
-- =============================================

CREATE PROCEDURE [policy].[WaivedPolicyReport]
    @month AS INT = 0,
	@year AS INT = 0
AS
BEGIN
DECLARE @WaivedPolicy TABLE(
        PolicyId INT,
		PolicyNumber Varchar(100),
		PolicyOwnerId INT,
		ParentPolicyId INT,
		WaivedDate Date,
		Spouse Varchar(100),
		Child Varchar(100));
		INSERT INTO @WaivedPolicy
		SELECT PolicyId, PolicyNumber, PolicyOwnerId,ParentPolicyId,ModifiedDate,
		(SELECT TOP 1 R.DisplayName FROM [client].[RolePlayer] R INNER JOIN [client].[RolePlayerRelation] RR 
		ON R.RolePlayerId = RR.FromRolePlayerId WHERE RR.FromRolePlayerId = PolicyOwnerId AND RR.RolePlayerTypeId = 11) AS Spouse,
		(SELECT TOP 1 R.DisplayName FROM [client].[RolePlayer] R INNER JOIN [client].[RolePlayerRelation] RR 
		ON R.RolePlayerId = RR.FromRolePlayerId WHERE RR.FromRolePlayerId = PolicyOwnerId AND RR.RolePlayerTypeId = 32) AS Child
		FROM [policy].[Policy] WHERE PolicyStatusId = 16

DECLARE @GroupPolicy TABLE (
        PolicyId INT,
		PolicyOwnerId INT,
		PolicyNumber Varchar(100),
		GroupName Varchar(100));
		INSERT INTO @GroupPolicy
		SELECT P.PolicyId,P.PolicyOwnerId, P.PolicyNumber,C.DisplayName FROM [policy].[Policy] P INNER JOIN [client].[RolePlayer] C
		ON P.PolicyOwnerId = C.RolePlayerId RIGHT JOIN @WaivedPolicy WP
		ON WP.ParentPolicyId = P.PolicyId  

SELECT DISTINCT W.PolicyId,
       W.PolicyNumber AS MemberPolicy,
	   W.WaivedDate,
	   R.DisplayName AS MemberName,
	   W.PolicyOwnerId,
	   DATENAME(month,W.WaivedDate) AS [Month],
	   G.PolicyNumber AS GroupPolicyNumber,
	   G.GroupName,
	   'Premium Waivered' AS [Status],
	   W.Spouse,
	   W.Child
FROM @WaivedPolicy W INNER JOIN [client].[RolePlayer] R ON W.PolicyOwnerId = R.RolePlayerId
     INNER JOIN @GroupPolicy G ON W.ParentPolicyId = G.PolicyId
WHERE (@month = 0 OR @month = MONTH(W.WaivedDate)) AND (@year = 0 OR @year = YEAR(W.WaivedDate))
END