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
            List<Color> color = null;
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
                                var linePartParts = linePart.Split('=');
                                try
                                {
                                    var colorParted = linePartParts[1].Split(',');
                                    String colorString = string.Format("#{0:X}{1:X}{2:X}", colorParted[0], colorParted[1], colorParted[2]);

                                    var colorObject = colorConverter.ConvertFromString(colorString);
                                    if (colorObject != null)
                                    {
                                        var colorTemp = (Color)colorObject;
                                        color.Add(colorTemp);
                                    }
                                }
                                catch (Exception)
                                {
                                    color.Add(Color.Black);
                                }
                            }
                        }
                    }
                    else if (line.StartsWith("C (") && line.Contains("POLYGON")) // Start of polygon
                    {
                        isPolygon = true;

                        var lineParts = line.Split(' ');

                        var polygon = new Polygon();
                        polygon.Color = color;
                        polygon.Style = lineStyle;
                        polygon.Points.Add(TrimPoint(lineParts[1] + "," + lineParts[2]));

                        currentPolygon = polygon;
                    }
                    else if (line.StartsWith("C (")) // Start of polyline
                    {
                        isPolyline = true;

                        var lineParts = line.Split(' ');

                        var polyline = new Polyline();
                        polyline.Color = color;
                        polyline.Style = lineStyle;
                        polyline.Points.Add(TrimPoint(lineParts[1] + "," + lineParts[2]));

                        currentPolyline = polyline;
                    }
                    else if (line.StartsWith("C +") && isPolygon)
                    {
                        var lineParts = line.Split(' ');
                        currentPolygon.Points.Add(TrimPoint(lineParts[1] + "," + lineParts[2]));
                    }
                    else if (line.StartsWith("C +") && isPolyline)
                    {
                        var lineParts = line.Split(' ');
                        currentPolyline.Points.Add(TrimPoint(lineParts[1] + "," + lineParts[2]));
                    }
                    else if (line.StartsWith("C )") && isPolygon)
                    {
                        var lineParts = line.Split(' ');
                        currentPolygon.Points.Add(TrimPoint(lineParts[1] + "," + lineParts[2]));

                        listOfShapes.Add(currentPolygon);
                        currentPolygon = null;

                        isPolygon = false;
                    }
                    else if (line.StartsWith("C )") && isPolyline)
                    {
                        var lineParts = line.Split(' ');
                        currentPolyline.Points.Add(TrimPoint(lineParts[1] + "," + lineParts[2]));

                        listOfShapes.Add(currentPolyline);
                        currentPolyline = null;

                        isPolyline = false;
                    }
                    else if (line.StartsWith("CIR"))
                    {
                        var circle = new Circle();

                        var lineParts = line.Split(' ');
                        foreach (var linePart in lineParts)
                        {
                            if (linePart.StartsWith("C") && !linePart.StartsWith("CIR"))
                            {
                                var linePartParts = linePart.Split('=');
                                circle.Center = linePartParts[1];
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

                        listOfShapes.Add(circle);
                    }else if{

                    }
                }
            }

            return listOfShapes;
        }

        private static string TrimPoint(string point)
        {
            return point.Replace("(", "").Replace("+", "").Replace(")", "").Replace("#", "");
        }
    }
}