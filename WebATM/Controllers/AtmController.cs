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