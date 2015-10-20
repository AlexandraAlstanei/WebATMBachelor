using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebATM.Models;
using System.Net;
using System.Net.Sockets;
using AsterixExtractor.model;
using System.IO;
using AsterixExtractor.categories.CAT062;
using AsterixExtractor.geoCalculations;
using System.Xml;
using System.Xml.Serialization;

namespace WebATM.Controllers
{
    /// <summary>
    /// The business logic of the application will be placed in this class.
    /// It was created as a singleton because we only need one instance. 
    /// </summary>
    public class AtmController
    {
        private static AtmController atmControllerInstance;
        private static List<Flight> flightList = new List<Flight>();
        //  private static List<Flight> flightListCopy = flightList;

        private AtmController()
        {
        }
        public static AtmController Instance
        {
            get
            {
                if (atmControllerInstance == null)
                {
                    atmControllerInstance = new AtmController();
                }
                return atmControllerInstance;
            }

        }

        public static List<Flight> GetAllFlights()
        {
            List<CAT62Data> list = GetExtractedDataFromBroadCast();
            foreach (var item in list)
            {
                Flight flight = new Flight();
                Plot plot = new Plot();
                flight.Plots = new List<Plot>();
                foreach (var element in item.CAT62DataItems)
                {
                    if (element.ID == "040")
                    {
                        if (element.value != null)
                        {
                            flight.TrackNumber = Convert.ToInt32(element.value);
                        }
                    }
                    if (element.ID == "070")
                    {
                        if (element.value != null)
                        {
                            flight.TimeOfTrack = ((AsterixExtractor.categories.CAT062.CAT62070ElapsedTimeSinceMidnight)element.value).ElapsedTimeSinceMidnight;
                        }
                    }
                    if (element.ID == "060")
                    {
                        if (element.value != null)
                        {
                            flight.SSRCode = ((CAT62060Mode3UserData)element.value).Mode3A_Code;
                        }
                    }
                    if (element.ID == "136")
                    {
                        if (element.value != null)
                        {
                            flight.MeasuredFlightLevel = Convert.ToInt32(element.value);
                        }
                    }
                    if (element.ID == "105")
                    {
                        if (element.value != null)
                        {
                            var lat = ((LatLongClass)element.value).GetLatLongDecimal();
                            plot.Latitude = lat.LatitudeDecimal;
                            plot.Longitude = lat.LongitudeDecimal;
                        }
                    }
                    if (element.ID == "390")
                    {
                        if (element.value != null)
                        {
                            flight.AircraftType = ((CAT62I390Data)element.value).AirCraftType.Aircraft_Type;
                            flight.CallSign = ((CAT62I390Data)element.value).CallSign.callSign_String;
                            flight.ADEP = ((CAT62I390Data)element.value).Departure_Airport.ADEP;
                            flight.ADES = ((CAT62I390Data)element.value).Destination_Airport.ADES;
                            flight.WTC = ((CAT62I390Data)element.value).Wake_Turbulence_Category.WTC;
                        }
                    }
                }
                  if (flightList.Exists(x => x.TrackNumber == flight.TrackNumber))
                    {
                         Flight foundFlight = flightList.Find(x => x.TrackNumber == flight.TrackNumber);
                         foundFlight.Plots.Insert(0, plot);
                    }
                    else
                    {
                        flight.Plots.Add(plot);
                        flightList.Add(flight);
                    }
                }
            return flightList;           
        }

        public static void writeToFile<Flight>(Flight serializableObject, string fileName)
        {
            if (serializableObject == null) { return; }

            try
            {
                XmlDocument xmlDocument = new XmlDocument();
                XmlSerializer serializer = new XmlSerializer(serializableObject.GetType());
                using (MemoryStream stream = new MemoryStream())
                {
                    serializer.Serialize(stream, serializableObject);
                    stream.Position = 0;
                    xmlDocument.Load(stream);
                    xmlDocument.Save(fileName);
                    stream.Close();
                }
            }
            catch (Exception e)
            {
                
            }
        }

        //private static bool isTrackId(CAT62Data item, int v)
        //{
        //    foreach (var element in item.CAT62DataItems)
        //    {
        //        if (element.ID == "040")
        //        {
        //            if (element.value != null)
        //            {
        //                return v == Convert.ToInt32(element.value);
        //            }
        //        }
        //    }
        //    return false;
        //}

        //public static List<Flight> GetUpdatedFlights()
        //{
        //    List<Flight> updatedFlightList = new List<Flight>();
        //    updatedFlightList = GetAllFlights();

        //    foreach (var item in updatedFlightList.ToList())
        //    {
        //        if (flightListCopy.Contains(item))
        //        {
        //            Flight foundFlight = flightListCopy.Find(x => x.TrackNumber == item.TrackNumber);
        //        if (!foundFlight.Plots.Contains(item.Plots[0]))
        //            {
        //                foundFlight.Plots.Insert(0, item.Plots[0]);
        //            }
        //        }
        //        else
        //        {
        //            flightListCopy.Add(item);
        //        }
        //    }
        //    flightList = flightListCopy;
        //    return flightList;
        //}

        //public static IEnumerable<Flight> GetAllFlights()
        //{
        //    XmlReader s_XmlReader = new XmlReader();
        //    var flights = s_XmlReader.ReadFromFile();
        //    return flights;
        //}

        public static List<CAT62Data> GetExtractedDataFromBroadCast()
        {
            UdpClient receiver = new UdpClient(2222);
            IPEndPoint endPoint = new IPEndPoint(IPAddress.Parse("10.0.0.27"), 2222);
            // IPEndPoint endPoint = new IPEndPoint(IPAddress.Parse("10.52.228.14"), 2222);

            byte[] data = null;
            data = receiver.Receive(ref endPoint);
            receiver.Close();

            AsterixExtractor.model.AsterixExtractor extractor = new AsterixExtractor.model.AsterixExtractor();
            return extractor.ExtractAndDecodeDataBlock(data);
        }



    }
}