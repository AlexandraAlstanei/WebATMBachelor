using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebATM.Models;

namespace WebATM.Controllers
{
    /// <summary>
    /// The business logic of the application will be placed in this class.
    /// It was created as a singleton because we only need one instance. 
    /// </summary>
    public class AtmController
    {
        private static AtmController atmControllerInstance;

        private AtmController()
        {
        }
        public static AtmController Instance
        {
            get
            {
                if (atmControllerInstance == null)
                {
                    atmControllerInstance = new AtmController();
                }
                return atmControllerInstance;
            }

        }

        public static IEnumerable<Flight> GetAllFlights()
        {
            XmlReader s_XmlReader = new XmlReader();
            var flights = s_XmlReader.ReadFromFile();
            return flights;
        }
    }
}