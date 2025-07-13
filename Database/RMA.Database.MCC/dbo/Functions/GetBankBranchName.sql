CREATE   FUNCTION [dbo].[GetBankBranchName] (@bankBranchId int)
RETURNS varchar(50)
AS
BEGIN
	declare @bankBranchName varchar(50)
	select @bankBranchName = (select [Name] from common.BankBranch where Id = @bankBranchId)
	return isnull(@bankBranchName, '')
END