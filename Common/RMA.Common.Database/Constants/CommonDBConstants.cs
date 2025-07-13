using System;

namespace RMA.Common.Database.Constants
{
    public static class CommonDbConstants
    {
        public static int CommandTimeout => (int)TimeSpan.FromMinutes(40).TotalSeconds;
        public static int LongCommandTimeout => (int)TimeSpan.FromMinutes(120).TotalSeconds;
        public const string DBConnectionEnvironmentVariableName = "DB";
        public const string DataMaskDBConnectionEnvironmentVariableName = "DataMaskDBConn";
    }
}