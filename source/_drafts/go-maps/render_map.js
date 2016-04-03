// Compute stone radius based off the closeness to the max
// Interpolate based on the natural log to compensate for large outliers
function compute_radius(num, max) {
    if (num == 0) { return 0;}
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

// Generates a board
// Returns an object with the board and some metadata (scales, etc)
function init_board(location) {
    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
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


    svg = svg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Fill with brown background
    svg.append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", boardColor);

    // Add a transform to reset the origin to inside the margin
    svg = svg.append('g').attr("transform",
        "translate(" + board.left + "," + board.top + ")");

    var lineColor = "#454545";

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

    return {svg: svg, xScale: xScale, yScale: yScale, textHeight: innerHeight };
}

// Draws the stones on the board according to frequency.
function plot_freq_map(data, svg_info) {
    var fmap = data.board;
    var samples = data.samples;
    var svg = svg_info.svg;
    var xScale = svg_info.xScale;
    var yScale = svg_info.yScale;
    var textHeight = svg_info.textHeight;

    var max_val = d3.max(fmap, function(d) {
        return Math.abs(d);
    });

    var stones = svg.selectAll("circle").data(fmap);

    //Transition stones that changed values
    stones.enter().append("circle");

    stones
        .transition().duration(1200)
        .attr("cx", function(d, i) {
            return xScale(i % 19);
        })
        .attr("cy", function(d, i) {
            return yScale(Math.floor(i / 19));
        })
        .attr("r", function(d) {
            return xScale(compute_radius(d, max_val));
        }).filter(function(d) {
            return d != 0;
    })
        .attr("fill", function(d) {
            if (d < 0) {
                return d3.hcl("black");
            } else if (d > 0) {
                return d3.hcl("white");
            } else {
                return null;
            }
        });
    stones.exit().transition().duration(800).attr("r", 0).remove();    // Add metadata
    // svg.append("text")
    //     .attr("x", 0)
    //     .attr("y", textHeight)
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", "10px")
    //     .attr("fill", "black")
    //     .style("font-size", "10px")
    //     .text("Number of samples: " + samples);
}

Array.prototype.elemAdd = function(other) {
    for (i = 0; i < this.length; i++) {
        this[i] += other[i];
    }
}

function compute_freq_map(data, years, ranks) {
    var fmap = Array.apply(null, Array(19*19)).map(Number.prototype.valueOf, 0);
    var samples = 0;
    for (year in data) {
        if (year >= years[0] && year <= years[1]) {
            for (rank in data[year]) {
                samples += data[year][rank].samples;
                fmap.elemAdd(data[year][rank].board);
            }
        }
    }
    return {board: fmap, samples: samples };
}

function cycle(svg_info) {
    names = ['all', 'win', 'first'];
    idx = 0;

    return function() {
        plot_freq_map(compute_freq_map(fmaps[names[idx]], [1600,2000]), svg_info);
        idx = (idx+1) % 3;
    };
}
