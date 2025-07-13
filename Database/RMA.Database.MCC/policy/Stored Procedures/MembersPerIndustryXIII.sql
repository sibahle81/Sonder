CREATE PROCEDURE [policy].[MembersPerIndustryXIII]
 AS
  BEGIN  
	SELECT [Industry].Name AS Industry, COUNT([client].[RolePlayer].RolePlayerId )  AS NumberOfMembers, SUM([policy].[PolicyInsuredLives].RolePlayerId ) AS NumberOfLives, SUM([policy].[Policy].AnnualPremium) AS Premium
	FROM [common].[Industry] INNER JOIN 
	[common].[IndustryClass] ON [common].[IndustryClass].Id =  [common].[Industry].IndustryClassId INNER JOIN
	[client].[Company] ON [client].[Company].IndustryId = [common].[Industry].Id INNER JOIN
	[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Company].[RolePlayerId] INNER JOIN
	[policy].[Policy] ON [policy].[Policy].PolicyOwnerId = [client].[RolePlayer].RolePlayerId INNER JOIN
	[policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].PolicyId = [policy].[Policy].PolicyId 
	WHERE [common].[Industry].IndustryClassId = 13 
	GROUP BY [common].[Industry].Name
 END