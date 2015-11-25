using System;
using System.Collections.Generic;

namespace WebATM.Insero_Map
/// <summary>
/// The Shape model is created in this class.
/// It includes the common attributes for the Polygon, Polyline and Circle
/// </summary>
{
    public class Shape
    {
        public List<String> Color { get; set; }
        public Style Style { get; set; }
        public FillStyle FillStyle { get; set; }
        public String type;

        public Shape()
        {

        }
    }
}