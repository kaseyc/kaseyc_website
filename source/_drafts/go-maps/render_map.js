function t(data) {
    var margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        padding = {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60
        },
        outerWidth = 960,
        outerHeight = 500,
        innerWidth = outerWidth - margin.left - margin.right,
        innerHeight = outerHeight - margin.top - margin.bottom,
        width = innerWidth - padding.left - padding.right,
        height = innerHeight - padding.top - padding.bottom;

    var xScale = d3.scale.linear()
        .domain([0, 18])
        .range([0, width]);

    var yScale = d3.scale.linear()
        .domain([0, 18])
        .range([0, height]);

    var svg = d3.select("#my_div")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append('g').attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d[0]);
        })
        .attr("cy", function(d) {
            return yScale(d[1]);
        })
        .attr("r", Math.min(xScale(.3), yScale(.3)));

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
}
