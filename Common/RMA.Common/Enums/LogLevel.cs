using System.Runtime.Serialization;

namespace RMA.Common.Enums
{
    [DataContract]
    public enum LogLevel
    {
        [EnumMember] Trace = 0,
        [EnumMember] Debug = 1,
        [EnumMember] Info = 2,
        [EnumMember] Warn = 3,
        [EnumMember] Error = 4,
        [EnumMember] Fatal = 5,
        [EnumMember] Off = 6
    }
}