using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Models
{   /// <summary>
    /// The Plot model is created in this class.
    /// This class is public, so it can be accesible for the XmlReader class.
    /// </summary>
    public class Plot
    {
        public double latitude;
        public double longitude;
        public double altitude;
        public double speed;
        public String ModeS;
    }
}