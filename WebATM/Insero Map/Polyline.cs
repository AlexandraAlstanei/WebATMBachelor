using System.Collections.Generic;

namespace WebATM.Insero_Map
/// <summary>
/// The Polyline model is created in this class.
/// This class is public, so it can be accesible for the MapReader class.
/// It is derived from Shape.
/// </summary>

{
    public class Polyline : Shape
    {
        //A list of the coordinates that define the polygon
        public List<Coordinates> coordinates { get; set; }

        public Polyline()
        {
            coordinates = new List<Coordinates>();
        }
    }
}