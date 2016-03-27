// Compute stone radius based off the closeness to the max
// Interpolate based on the natural log to compensate for large outliers
function compute_radius(num, max) {
    var x0 = Math.log(1),
        x1 = Math.log(max),
        y0 = 0.1,//0.1,
        y1 = 0.45,//1.0,
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
    var fmap = data.board;
    var samples = data.samples;
    var margin = {
            top: 20,
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

    var boardColor = "#bb9966";

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
        .attr("x", margin.left)
        .attr("y", margin.top - 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "black")
        .style("font-size", "16px")
        .text("Number of samples: " + samples);

    svg = svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Fill with brown background
    svg.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", boardColor);

    // Add a transform to reset the origin to inside the margin
    svg = svg.append('g').attr("transform",
        "translate(" + board.left + "," + board.top + ")");

    var lineColor = "#454545"
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
            "stroke": lineColor,
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
            "stroke": lineColor,
            "stroke-width": "1px"
        });

    var max_val = d3.max(fmap, function(d) {
        return Math.abs(d);
    });

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
        .data(fmap)
        .enter()
        .append("circle")
        .select(function(d) {
            return d ? this : null;
        })
        .attr("cx", function(d, i) {
            return xScale(i % 19);
        })
        .attr("cy", function(d, i) {
            return yScale(Math.floor(i / 19));
        })
        .attr("r", function(d) {
            return xScale(compute_radius(d, max_val));
        })
        .attr("fill", function(d) {
            return d < 0 ? "black" : "white";
        }).on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(Math.abs(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

Array.prototype.elemAdd = function(other) {
    for (i = 0; i < this.length; i++) {
        this[i] += other[i];
    }
}

function compute_freq_map(data, years, ranks) {
    var fmap = Array.apply(null, Array(19*19)).map(Number.prototype.valueOf, 0);
    var samples = 0;
    var bset = data.first
    for (year in bset) {
        if (year >= years[0] && year <= years[1]) {
            for (rank in bset[year]) {
                samples += bset[year][rank].samples;
                fmap.elemAdd(bset[year][rank].board);
            }
        }
    }
    return {board: fmap, samples: samples };
}
