using System;
using System.Collections.Generic;

namespace WebATM.Insero_Map
/// <summary>
/// The Map model is created in this class.
/// This class is public, so it can be accesible for the MapReader class.
/// </summary>
{
    public class Map
    {
        public String groupname;
        public String name;
        public String image;
        public String altitude;
        public String active;
        public String startdate;
        public String starttime;
        public String endtime;
        public String enddate;
        public List<Shape> shapes; 
    }
}