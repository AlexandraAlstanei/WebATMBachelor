using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebATM.Models;

namespace WebATM.Controllers
{
   /// <summary>
   /// The business logic of the application will be placed in this class.
   /// This class is static right now for the sake of simplicity. 
   /// Could be made a sigleton as we need only one instance.
   /// </summary>
   public static class AtmController
   {
      private static XmlReader s_XmlReader;
      private static Random s_Random;

      static AtmController ()
      {
         s_XmlReader = new XmlReader();
         s_Random = new Random();
      }

      public static IEnumerable<Flight> GetAllFlights()
      {
         var flights = s_XmlReader.ReadFromFile();

         //make a small change to one of the flights (testing purposes only)
         var affectedFlight = flights.LastOrDefault();

         if ( affectedFlight != null )
         {
            affectedFlight.Plots[ affectedFlight.Plots.Count() - 1 ].latitude += s_Random.Next( 0, 10 );
         }

         return flights;
      }

      public static Flight GetFlightById( int flightId )
      {
         return null;
      }
   }
}