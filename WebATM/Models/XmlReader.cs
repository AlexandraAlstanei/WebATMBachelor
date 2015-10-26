using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;

namespace WebATM.Models
{
    /// <summary>
    /// The flights are being read from file in this class.
    /// The class uses Linq technology for reading all the files in the class.
    /// </summary>
    public class XmlReader
    {
        //the method returns a list of flights.
        public List<Flight> ReadFromFile()
        {
            List<Flight> flightList;

            //Uses a relative path  @"~/Flights.xml".
            flightList = (from e in XDocument.Load(System.Web.HttpContext.Current.Server.MapPath(@"~/Flights.xml")).
                              Root.DescendantsAndSelf("flight")
                          select new Flight
                          {
                             // TrackNumber = (string)e.Element("id"),
                             // callSign = (string)e.Element("callsign"),
                              ADEP = (string)e.Element("adep"),
                              ADES = (string)e.Element("ades"),
                             // ACType = (string)e.Element("actype"),
                              WTC = (string)e.Element("wtc"),
                              //Plots = (
                              //    from o in e.Elements("plots").Elements("plot")
                              //    select new Plot
                              //    {
                              //        Latitude = (double)o.Element("latitude"),
                              //        Longitude = (double)o.Element("longitude"),
                              //        CurrentFlightLevel = (double)o.Element("altitude"),
                              //       // speed = (double)o.Element("speed"),
                              //       // ModeS = (String)o.Element("modescode"),
                              //    })
                              //    .ToArray()
                          }).ToList();
            return flightList;
        }
    }
}