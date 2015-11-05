using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebATM.Insero_Map
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