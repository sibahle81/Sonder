-- =================================================================
-- Author: Ryan Maree
-- Created date: 2020/07/15
-- =================================================================
CREATE PROCEDURE [policy].[ClientReferenceExists]
	@ClientReference AS VARCHAR(50)
AS 
BEGIN  

SELECT * 
FROM bpm.Wizard 
WHERE data LIKE '%"clientReference":'+@ClientReference+'%' 
	AND WizardConfigurationId in (22,23)
END  
