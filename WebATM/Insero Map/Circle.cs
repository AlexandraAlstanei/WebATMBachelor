

namespace WebATM.Insero_Map
/// <summary>
/// The Circle model is created in this class.
/// This class is public, so it can be accesible for the ImageAdapter class.
/// It is derived from Shape.
/// </summary>
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