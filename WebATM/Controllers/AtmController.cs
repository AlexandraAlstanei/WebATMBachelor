using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebATM.Models;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Sockets;
using AsterixExtractor.model;
using System.IO;
using AsterixExtractor.categories.CAT062;
using AsterixExtractor.geoCalculations;

namespace WebATM.Controllers
{
    /// <summary>
    /// The business logic of the application will be placed in this class.
    /// It was created as a singleton because we only need one instance. 
    /// </summary>
    public class AtmController
    {
        private static AtmController atmControllerInstance;

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
            List<Flight> flightList = new List<Flight>();
            List<CAT62Data> list = GetExtractedDataFromBroadCast();
            foreach (var item in list)
            {
                Flight flight1 = new Flight();
                Plot plot = new Plot();
                flight1.Plots = new List<Plot>();
                foreach (var element in item.CAT62DataItems)
                {
                    if (element.ID == "040")
                    {
                        if (element.value != null)
                        {
                            flight1.TrackNumber = Convert.ToInt32(element.value);
                        }
                    }
                    if (element.ID == "070")
                    {
                        if (element.value != null)
                        {
                            flight1.TimeOfTrack = ((AsterixExtractor.categories.CAT062.CAT62070ElapsedTimeSinceMidnight)element.value).ElapsedTimeSinceMidnight;
                        }
                    }
                    if (element.ID == "060")
                    {
                        if (element.value != null)
                        {
                            flight1.SSRCode = ((CAT62060Mode3UserData)element.value).Mode3A_Code;
                        }
                    }
                    if (element.ID == "136")
                    {
                        if (element.value != null)
                        {
                            flight1.MeasuredFlightLevel = Convert.ToInt32(element.value);
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
                            //flight1.AircraftType = ((CAT62I390Types.Type_Of_AirCraft_Type)element.value).Aircraft_Type.ToString();
                            //flight1.CallSign = ((CAT62I390Types.CAT62CallSign_Type)element.value).callSign_String.ToString();
                            //flight1.ADEP = ((CAT62I390Types.CAT62Departure_Airport_Type)element.value).ADEP;
                            //flight1.ADES = ((CAT62I390Types.CAT62Destination_Airport_Type)element.value).ADES;
                            //flight1.WTC = ((CAT62I390Types.CAT62Wake_Turbulence_Category_Type)element.value).WTC;
                        }
                    }
                }
                flight1.Plots.Add(plot);
                flightList.Add(flight1);
            }
            return flightList;
        }

        //public static IEnumerable<Flight> GetAllFlights()
        //{
        //    XmlReader s_XmlReader = new XmlReader();
        //    var flights = s_XmlReader.ReadFromFile();
        //    return flights;
        //}

        public static List<CAT62Data> GetExtractedDataFromBroadCast()
        {
            UdpClient receiver = new UdpClient(2222);
            IPEndPoint endPoint = new IPEndPoint(IPAddress.Parse("10.52.229.131"), 2222);

            byte[] data = null;
            data = receiver.Receive(ref endPoint);
            receiver.Close();

            AsterixExtractor.model.AsterixExtractor extractor = new AsterixExtractor.model.AsterixExtractor();
            return extractor.ExtractAndDecodeDataBlock(data);
        }



    }
}