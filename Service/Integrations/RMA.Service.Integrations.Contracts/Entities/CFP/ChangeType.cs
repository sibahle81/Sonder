using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    // For potential use instead of string for MemberType field in Member class:
    public enum MemberType
    {
        Main = 1,
        Spouse,
        Child,
        Parent,
        Extended,
        Beneficiary
    }

    public enum ChangeType
    {
        NoChange = 0,
        Add,
        Update,
        Remove
    }
}