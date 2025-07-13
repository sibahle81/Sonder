using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{
    public static class SuspiciousTransactionRequest
    {
        public class Input1
        {
            public List<string> ColumnNames { get; set; }
            public List<List<string>> Values { get; set; }
        }

        public class Inputs
        {
            public Input1 input1 { get; set; }
        }

        public class GlobalParameters
        {

        }

        public class RootSuspiciousTransactionRequest
        {
            public Inputs Inputs { get; set; }
            public GlobalParameters GlobalParameters { get; set; }
        }

    }
}
