 CREATE PROCEDURE [billing].[GetDebtorNotesAuditReport] 
	@roleplayerId int,
	@startDate date =null,
	@endDate date =null,
	@type varchar(100) = null
AS
BEGIN
	if @startdate is null and @type is null
	begin
	select * from billing.note where itemid = @roleplayerid 
	return
	end
	if @startdate is not null and @endDate is null and @type is null
	begin
	select * from billing.note where itemid = @roleplayerid  and CreatedDate between @startDate and getdate()
	return
	end

	if @startdate is not null and @endDate is  not null and @type is null
	begin
	select * from billing.note where itemid = @roleplayerid  and CreatedDate between @startDate and @endDate
	return
	end

	if @startdate is not null and @endDate is null and @type is not null
	begin
	select * from billing.note where itemid = @roleplayerid  and CreatedDate between @startDate and getdate() and ItemType =@type
	return
	end

	if @startdate is not null and @endDate is not null and @type is not null
	begin
	select * from billing.note where itemid = @roleplayerid  and CreatedDate between @startDate and @endDate and ItemType =@type
	return
	end

	if @startdate is  null and @endDate is  null and @type is not null
	begin
	select * from billing.note where itemid = @roleplayerid  and ItemType =@type
	return
	end
END