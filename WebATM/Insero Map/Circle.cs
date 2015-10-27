using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Insero_Map
{
    

    public class Circle : Shape
    {
        public List<Coordinates> centerCoordinates { get; set; }
        public double Radius { get; set; }

        public Circle()
        {
            centerCoordinates = new List<Coordinates>();
        }
    }
}