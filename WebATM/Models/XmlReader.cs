using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;

namespace WebATM.Models
{
   public class XmlReader
   {
      public List<Flight> ReadFromFile()
      {
         List<Flight> flightList;

         //changed the absolute path to a relative path  @"~/Flights.xml".
         //The file Flights.xml needs to be included in the project for
         //the relative path to work
         flightList = ( from e in XDocument.Load( System.Web.HttpContext.Current.Server.MapPath( @"~/Flights.xml" ) ).
                            Root.DescendantsAndSelf( "flight" )
                        select new Flight
                        {
                           ID = (string)e.Element( "id" ),
                           callSign = (string)e.Element( "callsign" ),
                           ADEP = (string)e.Element( "adep" ),
                           ADES = (string)e.Element( "ades" ),
                           ACType = (string)e.Element( "actype" ),
                           WTC = (string)e.Element( "wtc" ),
                           Plots = (
                                from o in e.Elements( "plots" ).Elements( "plot" )
                                select new Plot
                                {
                                   latitude = (double)o.Element( "latitude" ),
                                   longitude = (double)o.Element( "longitude" ),
                                   altitude = (double)o.Element( "altitude" ),
                                   speed = (double)o.Element( "speed" ),
                                   ModeS = (String)o.Element( "modescode" ),
                                } )
                                .ToArray()
                        } ).ToList();
         return flightList;
      }
   }
}