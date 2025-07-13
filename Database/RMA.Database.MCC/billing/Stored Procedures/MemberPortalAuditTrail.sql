
CREATE PROCEDURE [billing].[MemberPortalAuditTrail]
	@StartDate AS DATE,
	@EndDate AS DATE

AS
BEGIN

		select actiondate as [date],su.DisplayName as MemberName,crva.ItemType as DocumentType,crva.[Action]
		from [common].[reportviewedaudit] crva
		inner join [security].[User] su on crva.UserId = su.Id
		where crva.ActionDate between @StartDate and @EndDate

		
END