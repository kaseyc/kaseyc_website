// Compute transparency based off the closeness to the max
// Interpolate based on the natural log to compensate for large outliers
function compute_alpha(num, max) {
    if (num == 0) {
        return 0;
    }
    var x0 = 0,
        x1 = Math.log(max),
        y0 = 0.15,
        y1 = 1.0,
        x = Math.log(Math.abs(num));

    return y0 + ((y1 - y0) * ((x - x0) / (x1 - x0)));
}

function rgba(c, a) {
    var res = "rgba(";
    for (var i = 0; i < 3; i++) {
        res += c + ", ";
    }
    return res + a + ")";

}

function plot_freq_map(data, location) {
    var margin = {
            top: 50,
            right: 20,
            bottom: 20,
            left: 20
        },
        board = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        outerWidth = 500,
        outerHeight = 500,
        innerWidth = outerWidth - margin.left - margin.right,
        innerHeight = outerHeight - margin.top - margin.bottom,
        width = innerWidth - board.left - board.right,
        height = innerHeight - board.top - board.bottom;

    var xScale = d3.scale.linear()
        .domain([0, 18])
        .range([0, width]);

    var yScale = d3.scale.linear()
        .domain([0, 18])
        .range([0, height]);

    var svg = d3.select("#" + location)
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight);

    // Add metadata
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Value vs Date Graph");

    svg = svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Fill with brown background
    svg.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "#bb9966");

    // Add a transform to reset the origin to inside the margin
    svg = svg.append('g').attr("transform",
        "translate(" + board.left + "," + board.top + ")");

    svg.selectAll("line.horizontalGrid").data(yScale.ticks(19)).enter()
        .append("line")
        .attr({
            "class": "horizontalGrid",
            "x1": 0,
            "x2": width,
            "y1": function(d) {
                return yScale(d);
            },
            "y2": function(d) {
                return yScale(d);
            },
            "fill": "none",
            "shape-rendering": "crispEdges",
            "stroke": "black",
            "stroke-width": "1px"
        });

    svg.selectAll("line.verticalGrid").data(yScale.ticks(19)).enter()
        .append("line")
        .attr({
            "class": "verticalGrid",
            "y1": 0,
            "y2": height,
            "x1": function(d) {
                return xScale(d);
            },
            "x2": function(d) {
                return xScale(d);
            },
            "fill": "none",
            "shape-rendering": "crispEdges",
            "stroke": "black",
            "stroke-width": "1px"
        });

    var max_val = d3.max(data, function(d) {
        return Math.abs(d);
    });

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return xScale(i % 19);
        })
        .attr("cy", function(d, i) {
            return yScale(Math.floor(i / 19));
        })
        .attr("r", Math.min(xScale(.4), yScale(.4)))
        .attr("fill", function(d) {
            var c = d < 0 ? 0 : 255;
            var a = compute_alpha(d, max_val);
            return rgba(c, a);
        });
}
