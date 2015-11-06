using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Insero_Map
{
    

    public class Circle : Shape
    {
        // An instance of the coordinates class as a circle has only one pair of coordinates.
        public Coordinates centerCoordinates { get; set; }
        // A double variable for the radius.
        public double Radius { get; set; }

        // Circle constructor. 
        public Circle()
        {
            centerCoordinates = new Coordinates();
        }
    }
}