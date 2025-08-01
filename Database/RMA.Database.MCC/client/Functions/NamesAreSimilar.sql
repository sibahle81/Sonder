CREATE FUNCTION [client].[NamesAreSimilar] (@name1 varchar(256), @name2 varchar(256), @required int)
RETURNS BIT
AS BEGIN
	declare @count int = 0
	declare @similar int = 0

	set @name1 = lower(replace(replace(trim(@name1), ' ', '|'), '||', '|'))
	set @name2 = lower(replace(replace(trim(@name2), ' ', '|'), '||', '|'))

	if (@name1 = @name2) return cast(1 as bit)

	set @name1 = concat('["',replace(@name1, '|', '","'), '"]')
	set @name2 = concat('["',replace(@name2, '|', '","'), '"]')

	declare @table1 table ([Key] int, [Value] varchar(50), [Match] bit)
	declare @table2 table ([Key] int, [Value] varchar(50))

	insert into @table1 select [Key], [Value], 0 from openjson(@name1) where trim([Value]) <> ''
	insert into @table2 select [Key], [Value] from openjson(@name2) where trim([Value]) <> ''

	update t1 set t1.[Match] = 1 from @table1 t1 inner join @table2 t2 on t1.[Value] = t2.[Value]
	update t1 set t1.[Match] = 1 from @table1 t1 inner join @table2 t2 on soundex(t1.[Value]) = soundex(t2.[Value]) where t1.[Match] = 0
	update t1 set t1.[Match] = 1 from @table1 t1 inner join @table2 t2 on dbo.LevenshteinDistance(t1.[Value], t2.[Value]) <= @required where t1.[Match] = 0

	select @similar = sum(case [Match] when 1 then 1 else 0 end), @count = count(*) from @table1

	declare @match float = cast(@similar as float) / cast(@count as float)

	return cast(iif(@match >= 0.5, 1, 0) as bit)

END