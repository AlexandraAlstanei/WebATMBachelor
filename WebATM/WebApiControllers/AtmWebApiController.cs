using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebATM.Controllers;
using WebATM.Models;

namespace WebATM.WebApiControllers
{
   /// <summary>
   /// A new controller is created for each client request. Hence, the static business
   /// logic class: AtmController.
   /// </summary>
   [RoutePrefix( "api/webatm" )]
   public class AtmWebApiController : ApiController
   {
      [Route( "GetAllFlights" )] 
      public IEnumerable<Flight> GetAllFlights()
      {
            AtmController.startMethod();
            return AtmController.GetAllFlights();
      }

        [Route("ReadMapElements")]
        public IEnumerable<Insero_Map.Map> GetInseroMaps()
        {
            IEnumerable<Insero_Map.Map> list = Insero_Map.MapReader.ReadMapElements();
            return list;
        }
    }
}
