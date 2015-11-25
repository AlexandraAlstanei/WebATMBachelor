using System.Collections.Generic;

namespace WebATM.Insero_Map
/// <summary>
/// The Polygon model is created in this class.
/// This class is public, so it can be accesible for the ImageAdapter class.
/// It is derived from Shape.
/// </summary>
{
    public class Polygon : Shape
    {
        //A list of the coordinates that define the polygon
        public List<Coordinates> coordinates { get; set; }

        public Polygon()
        {
            coordinates = new List<Coordinates>();
        }
    }
}