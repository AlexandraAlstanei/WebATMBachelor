using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Insero_Map
{
    public class Polyline : Shape
    {
        List<Coordinates> coordinates { get; set; }

        public Polyline()
        {
            coordinates = new List<Coordinates>();
        }
    }
}