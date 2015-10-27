using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Insero_Map
{
    public class Polygon : Shape
    {
       public List<Coordinates> coordinates { get; set; }

        public Polygon()
        {
            coordinates = new List<Coordinates>();
        } 
    }
}