using System;
using System.Collections.Generic;

namespace WebATM.Insero_Map
/// <summary>
/// The Text model is created in this class.
/// This class is public, so it can be accesible for the XmlReader class.
/// It is derived from Shape
/// </summary>
{
    public class Text : Shape
    {
        public List<Coordinates> coordinates { get; set; }
        public String textString;

        public Text()
        {
            coordinates = new List<Coordinates>();
        }
    }
}