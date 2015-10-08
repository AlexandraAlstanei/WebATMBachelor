using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Models
/// <summary>
/// The Flight model is created in this class.
/// This class is public, so it can be accesible for the XmlReader class.
/// It includes an array of Plots, as a Flight can have multiple plots.
/// </summary>
{
    public class Flight
   {
        public List<Plot> Plots;
        public String SSRCode;
        public String CallSign;
        public String ADEP;
        public String ADES;
        public String ACType;
        public String WTC;
        public int TrackNumber;
        public double TimeOfTrack;
        public String AircraftType;
        public int MeasuredFlightLevel;
    }
}