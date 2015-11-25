using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Web;
using AsterixExtractor.model;
using System.IO;
using AsterixExtractor.categories.CAT062;
using AsterixExtractor.geoCalculations;
using WebATM.Controllers;

namespace WebATM.Models
/// <summary>
/// The Extractor is a helper class that initiate a thread for receiving the data through Asterix.
/// This class is public, so it can be accesible for the AtmController class.
/// </summary>
{
    public class Extractor
    {
        private Thread thread;

        public void StartThread(IPAddress ip, int port)
        {
            thread = new Thread(new ThreadStart(() =>
            {
                while (true)
                {
                    UdpClient receiver = new UdpClient(2222);
                    IPEndPoint endPoint = new IPEndPoint(IPAddress.Parse("192.168.87.101"), 2222);

                    byte[] data = null;
                    data = receiver.Receive(ref endPoint);
                    receiver.Close();

                    AsterixExtractor.model.AsterixExtractor extractor = new AsterixExtractor.model.AsterixExtractor();
                   
                    List<CAT62Data> list = new List<CAT62Data>();
                    if (data != null)
                    {
                        list = extractor.ExtractAndDecodeDataBlock(data);

                        for (int i = 0; i < list.Count; i++)
                        {
                            AtmController.bufferList.Add(list[i]);
                        }
                    }
                }

            }));

            thread.Start();
        }

        public void StopThread()
        {
            if (thread != null)
            {
                thread.Abort();
            }
        }

    }
}