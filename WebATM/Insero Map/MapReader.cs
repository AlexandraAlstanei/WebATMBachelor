using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml.Linq;

namespace WebATM.Insero_Map
{
    public class MapReader
    {

        public static List<Map> ReadMapElements()
        {
            List<Map> mapElements = null;

            try
            {
                XDocument xml = null;
                using (StreamReader oReader = new StreamReader(System.Web.HttpContext.Current.Server.MapPath(@"~/Maps.xml"), Encoding.GetEncoding("ISO-8859-1")))
                {
                    xml = XDocument.Load(oReader);
                }
                //Uses a relative path  @"~/Maps.xml".
                mapElements = (from e in xml.Root.DescendantsAndSelf("maps").Elements("map")
                               select new Map
                               {
                                   groupname = (string)e.Element("groupname"),
                                   name = (string)e.Element("name"),
                                   image = (string)e.Element("image"),
                                   altitude = (string)e.Element("altitude"),
                                   active = (string)e.Element("active"),
                                   startdate = (string)e.Element("startdate"),
                                   starttime = (string)e.Element("starttime"),
                                   enddate = (string)e.Element("enddate"),
                                   endtime = (string)e.Element("endtime"),
                               }).ToList();
            }
            catch (Exception e)
            {
                throw new Exception("File not found.");

            }
            return mapElements;
        }
    }
}