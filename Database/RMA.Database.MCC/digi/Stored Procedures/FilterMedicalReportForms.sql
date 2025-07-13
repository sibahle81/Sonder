CREATE PROCEDURE [digi].[FilterMedicalReportForms] @filter nvarchar(250)
 AS
  BEGIN
	declare @parts TABLE (Id int, StartIndex int, EndIndex int);
	declare @pos varchar(max)='';
	declare @index integer = 0;
	declare @top integer  = 0;

	set @filter = ',' + replace(@filter, '|', '/') + ',';

	--//--
	--// Count number of ',' within the argument provided by caller

	select @top = len(@filter) - len(replace(@filter, ',', ''))

	--//
	--//-- Get comma seperated list containing the char index of all occurrences of ','

	select
		@pos = @pos + ',' + REPLACE(STR(  cast( charindex(',',@filter, @index + LEN(cast(t.[value] as varchar(20)) ) ) as varchar(20) ) , 4), SPACE(1), '0'),
		@index = charindex(',',@filter, @index + LEN(cast(t.[value] as varchar(20)) ) )
	from
	(
		select [key],[value] from
		(
			select top 20
				[t].[rowid] [key],
				[t].[rowid] [value]
			from (

				select top 20
					ROW_NUMBER() OVER(ORDER BY c.[name] ASC) AS [rowid],
					c.[name] [Id]
				from [sys].[tables] c with (nolock)

			)[t] where t.[rowid] <= @top

		)[t]

	)[t]

	set @pos = @pos + ',';

	--//--
	--//-- Transform the comma seperated list of indexs into a table

	with commaindex ([key],[value]) as
	(
		select
			t.[key],
			cast([value] as int) [value]
		from(
			select
				t.[key] + 1 [key],
				substring(@pos,t.[index]+1,4) [value]
			from(
				select
					t.[key],
					t.[value],
					charindex(',',@pos,(5 * (t.[key] - 1))) [index]
				from
				(
					select top 20
						[t].[rowid] [key],
						[t].[rowid] [value]
					from (
						select top 20
							ROW_NUMBER() OVER(ORDER BY c.[name] ASC) AS [rowid],
							c.[name] [id]
						from [sys].[tables] c with (nolock)
					)[t] where t.[rowid] <= @top

				)[t]

			)[t] where t.[index] > 0

		)[t] where t.[value] != ''
	)

	--//--
	--//-- Extract values at index positions

	insert into @parts([Id],[StartIndex],[EndIndex])
	select
		ROW_NUMBER() OVER(ORDER BY t.[value] ASC) AS [rowid],
		t.[value] [start],
		r.[value] [end]
	from commaindex t
	join commaindex r on t.[key]+1 = r.[key]

	--//--------------

	declare @words table(
		id int,
		txt nvarchar(64)
	);
	
	insert into @words (id,txt)
	select
		ROW_NUMBER() OVER(ORDER BY [StartIndex] ASC) AS id,
		SUBSTRING(@filter, [startIndex]+1, [EndIndex]-[startIndex]-1) [txt]
	from @parts

	declare @wordcount int = (select count(*) from @words);

	--//--

	select distinct
		MedicalReportFormId
	from(
		select
			count(MedicalReportFormId) [count],
			MedicalReportFormId
		from(
			select
			w.id [wid],
			w.txt [wordstext],
			CHARINDEX(w.txt,t.txt, 1) [charindex],
			t.MedicalReportFormId,
			t.txt [medicaltext]
			from (
				select
				[MedicalReportFormId],
				([ClaimReferenceNumber] + ' ' + [name] + ' ' + [surname] + ' ' + [HealthcareProviderName] + ' ' + [HealthcareProviderPracticeNumber] + ' ' + [EmployerName] + ' ' + [ContactNumber]) [txt]
				from(
					select
						[MedicalReportFormId],
						[ClaimReferenceNumber],
						[name],
						[surname],
						[HealthcareProviderName],
						[HealthcareProviderPracticeNumber],
						[EmployerName],
						case when [ContactNumber] is null then '' else [ContactNumber] end [ContactNumber]
					from [digi].[MedicalReportForm]
				)[t]
			)[t]
			join @words w on CHARINDEX(w.txt,t.txt, 1) > 0
		)[t]
		group by MedicalReportFormId
		having count(MedicalReportFormId) >= @wordcount
	)[t]
	
  END
GO