using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;

namespace WebATM.Insero_Map
{
    public class ImageAdapter
    {
        public static List<Shape> ConvertToShape(string image)
        {
            ColorConverter colorConverter = new ColorConverter();
            List<String> color = null;
            Style lineStyle = Style.Solid;

            List<Shape> listOfShapes = new List<Shape>();

            var originalLine = String.Empty;

            using (StringReader reader = new StringReader(image))
            {
                var isPolygon = false;
                var isPolyline = false;
                Polygon currentPolygon = null;
                Polyline currentPolyline = null;
                while ((originalLine = reader.ReadLine()) != null)
                {
                    var line = originalLine.ToUpper().Trim();

                    if (String.IsNullOrWhiteSpace(line) ||
                       line.StartsWith("*") ||
                       line.StartsWith("$") ||
                       line.StartsWith("/") ||
                       line.StartsWith("HEADER"))
                    {
                        continue;
                    }
                    
                    if (line.StartsWith("ATB"))
                    {
                        var lineParts = line.Split(' ');
                        foreach (var linePart in lineParts)
                        { 
                            if (linePart.StartsWith("COL"))
                            {
                                color = new List<String>(); 
                                var linePartParts = linePart.Split('=');
                                try
                                {
                                    var colorParted = linePartParts[1].Split(',');
                                    var R = Convert.ToInt32(colorParted[0]);
                                    var G = Convert.ToInt32(colorParted[1]);
                                    var B = Convert.ToInt32(colorParted[2]);
                                    
                                    var colorObject = Color.FromArgb(255, R, G, B);
                                    var hexColor = HexConverter(colorObject);
                                    if (hexColor != null)
                                    {
                                        color.Add(hexColor);
                                    }
                                }
                                catch (Exception)
                                {
                                    color.Add("#ffffff");
                                }
                            }
                        }
                    }
                    else if (line.StartsWith("C (#") && line.Contains("POLYGON")) // Start of polygon
                    {
                        isPolygon = true;

                        var lineParts = line.Split(' ');

                        var polygon = new Polygon();
                        polygon.Color = color;
                        polygon.Style = lineStyle;
                        Coordinates points = new Coordinates();
                        var lat = lineParts[1].Split('#');
                        points.Latitude = Convert.ToDouble(lat[1]);
                        points.Longitude = Convert.ToDouble(lineParts[2]);
                        polygon.coordinates.Add(points);
                        currentPolygon = polygon;
                    }
                    else if (line.StartsWith("C (N") && line.Contains("POLYGON"))
                    {
                        isPolygon = true;
                        var polygon = new Polygon();
                        polygon.Color = color;
                        polygon.Style = lineStyle;
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        var coord = lineParts[1].Split('N');
                        var latParts = coord[1].Split(',');
                        var divider = createDivider(latParts[0].Length-3);
                        points.Latitude = (Convert.ToDouble(latParts[0]))/divider;
                        var longParts = latParts[1].Split('E');
                        points.Longitude = (Convert.ToDouble(longParts[1]))/ createDivider(longParts[1].Length - 3); 
                        polygon.coordinates.Add(points);
                        currentPolygon = polygon;
                    }
                    else if (line.StartsWith("C (") && line.Contains("POLYLINE")) // Start of polyline
                    {
                        isPolyline = true;

                        var lineParts = line.Split(' ');

                        var polyline = new Polyline();
                        polyline.Color = color;
                        polyline.Style = lineStyle;
                        Coordinates points = new Coordinates();
                        points.Latitude = Convert.ToDouble(lineParts[1]);
                        points.Longitude = Convert.ToDouble(lineParts[2]);
                        polyline.coordinates.Add(points);

                        currentPolyline = polyline;
                    }
                    else if (line.StartsWith("C +#") && isPolygon)
                    {
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        var lat = lineParts[1].Split('#');
                        points.Latitude = Convert.ToDouble(lat[1]);
                        points.Longitude = Convert.ToDouble(lineParts[2]);
                        currentPolygon.coordinates.Add(points);
                    }
                    else if (line.StartsWith("C +N") && isPolygon)
                    {
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        var coord = lineParts[1].Split('N');
                        var latParts = coord[1].Split(',');
                        var divider = createDivider(latParts[0].Length - 3);
                        points.Latitude = (Convert.ToDouble(latParts[0])) / divider;
                        var longParts = latParts[1].Split('E');
                        points.Longitude = (Convert.ToDouble(longParts[1])) / createDivider(longParts[1].Length - 3);
                        currentPolygon.coordinates.Add(points);
                    }
                    else if (line.StartsWith("C +") && isPolyline)
                    {
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        points.Latitude = Convert.ToDouble(lineParts[1]);
                        points.Longitude = Convert.ToDouble(lineParts[2]);
                        currentPolyline.coordinates.Add(points); ;
                    }
                    else if (line.StartsWith("C )#") && isPolygon)
                    {
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        var lat = lineParts[1].Split('#');
                        points.Latitude = Convert.ToDouble(lat[1]);
                        points.Longitude = Convert.ToDouble(lineParts[2]);
                        currentPolygon.coordinates.Add(points);
                        currentPolygon.type = "Polygon";
                        listOfShapes.Add(currentPolygon);
                        currentPolygon = null;

                        isPolygon = false;
                    }
                    else if (line.StartsWith("C )N") && isPolygon)
                    {
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        var coord = lineParts[1].Split('N');
                        var latParts = coord[1].Split(',');
                        var divider = createDivider(latParts[0].Length - 3);
                        points.Latitude = (Convert.ToDouble(latParts[0])) / divider;
                        var longParts = latParts[1].Split('E');
                        points.Longitude = (Convert.ToDouble(longParts[1])) / createDivider(longParts[1].Length - 3);
                        currentPolygon.coordinates.Add(points);

                        isPolygon = false;
                    }
                    else if (line.StartsWith("C )") && isPolyline)
                    {
                        var lineParts = line.Split(' ');
                        Coordinates points = new Coordinates();
                        points.Latitude = Convert.ToDouble(lineParts[1]);
                        points.Longitude = Convert.ToDouble(lineParts[2]);
                        currentPolyline.coordinates.Add(points);
                        currentPolyline.type = "Polyline";
                        listOfShapes.Add(currentPolyline);
                        currentPolyline = null;

                        isPolyline = false;
                    }
                    else if (line.StartsWith("CIR")) //Start of circle
                    {
                        var circle = new Circle();
                        circle.Color = color;
                        var lineParts = line.Split(' ');
                        foreach (var linePart in lineParts)
                        {
                            if (linePart.StartsWith("C") && !linePart.StartsWith("CIR"))
                            {
                                var linePartParts = linePart.Split('#');
                                    Coordinates points = new Coordinates();
                                    points.Latitude = Convert.ToDouble(linePartParts[1]);
                                    points.Longitude = Convert.ToDouble(lineParts[2]);
                                    circle.centerCoordinates.Add(points);                              
                            }
                            else if (linePart.StartsWith("R"))
                            {
                                var linePartParts = linePart.Split('=');

                                var radius = default(double);
                                try
                                {
                                    radius = Double.Parse(linePartParts[1], CultureInfo.InvariantCulture);
                                }
                                catch (Exception) { }

                                circle.Radius = radius;
                            }
                        }
                            circle.type = "Circle";
                        listOfShapes.Add(circle);
                    }else if (line.StartsWith("TEXT"))
                        {
                        var text = new Text();
                        text.Color = color;
                        var lineParts = line.Split(' ');
                        foreach (var linePart in lineParts)
                        {

                        }
                        }
                }
            }

            return listOfShapes;
        }

        private static string TrimPoint(string point)
        {
            return point.Replace("(", "").Replace("+", "").Replace(")", "").Replace("#", "");
        }

        private static int createDivider(int length)
        {
            int divider = 1;
            while (length != 0)
            {
                divider = divider * 10;
                length--;
            }
            return divider;
        }

        private static String HexConverter(System.Drawing.Color c)
        {
            return "#" + c.R.ToString("X2") + c.G.ToString("X2") + c.B.ToString("X2");
        }
    }
}