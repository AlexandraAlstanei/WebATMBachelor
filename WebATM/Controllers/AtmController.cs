using System;
using System.Collections.Generic;
using WebATM.Models;
using System.Net;
using AsterixExtractor.model;
using AsterixExtractor.categories.CAT062;
using AsterixExtractor.geoCalculations;

namespace WebATM.Controllers
{
    /// <summary>
    /// The business logic of the application will be placed in this class. 
    /// </summary>
    public class AtmController
    {
        //This variable holds the list of flights.
        private static List<Flight> flightList = new List<Flight>();
        //This variable holds the list of CAT62Data.
        public static List<CAT62Data> bufferList = new List<CAT62Data>();
        //The flag holds the state of the system. 
        public static Boolean systemStarted = false;

        /*
        * Starts the data broadcast when the system is started.
        * and sets the flag to true.
        * */
        public static void startMethod()
        {
            if (!systemStarted)
            {
                Extractor extractor = new Extractor();
                extractor.StartThread(IPAddress.Parse("192.168.87.101"), 2222);
                systemStarted = true;
            }
        }

        /*
        * Iterates through the CAT62Data elements and creates the list of flights.
        * If the flights receive updates, it also creates the history of plots.
        * */
        public static List<Flight> GetAllFlights()
        {
            List<CAT62Data> list = new List<CAT62Data>();
            for (int i = 0; i < bufferList.Count; i++)
            {
                list.Add(bufferList[i]);
            }
            bufferList.Clear();
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
    }
}