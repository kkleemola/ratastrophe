function renderCveTimeline(url) {

d3.json(url, function (data) {
    var dateFormat = d3.time.format("%Y-%m-%d");
    data.forEach(function(d) {
        d.threat_dd = dateFormat.parse(d.threat_date);
        d.cve_dd = dateFormat.parse(d.cve_date);
    });

    var minDate = d3.min(data, function(d) { return d.threat_dd; });
    var maxDate = d3.max(data, function(d) { return d.threat_dd; });
    var datePadding = (1000 * 60 * 60 * 24) * 14;
    var timeDomain = [new Date(minDate.getTime() - datePadding),
                      new Date(maxDate.getTime() + datePadding)];

    var cves = d3.keys(d3.nest().key(function(d) { return d.cve; }).map(data)).sort();

    var width = 800;
    var height = cves.length * 24;
    var margins = {top: 10, right: 120, bottom: 80, left: 120};
    var svg = d3.select('#cve-timeline')
        .append('svg')
        .attr('width', width + margins.right + margins.left)
        .attr('height', height + margins.top + margins.bottom)
        .attr('class', 'chart')
      .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    var x = d3.time.scale()
      .domain(timeDomain)
      .range([0, width]);

    var y = d3.scale.ordinal()
      .domain(cves)
      .rangeBands([0, height]);

    var xTickFormat = d3.time.format("%d %b %Y");
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(xTickFormat);
    svg.append('g')
        .attr("id", "xAxis")
        .attr("class", "axis")
        .attr("transform", "translate(0,"+ height +")")
        .call(xAxis);
    svg.selectAll("#xAxis text")
        .style('text-anchor', 'end')
        .attr('dx', '-1.2em')
        .attr('dy', '0.4em')
        .attr("transform", "rotate(-45)");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    svg.append('g')
        .attr("id", "yAxis")
        .attr("class", "axis")
        .call(yAxis);

    var bands = svg.selectAll("rect.band")
      .data(cves)
      .enter().append("rect")
        .attr("class", function(d, i) { return "band " + (i % 2 === 0 ? "evenBand" : "oddBand"); })
        .attr("x", 0)
        .attr("y", function(d, i) { return y.rangeBand() * i; })
        .attr("width", width)
        .attr("height", y.rangeBand());

    var nestedCves = d3.nest().key(function(d) { return d.cve; }).entries(data);
    var cveMarkers = svg.selectAll(".cveMarker")
      .data(nestedCves)
      .enter().append("svg:line")
        .attr("class", "cveMarker")
        .attr("x1", function(d, i) { return x(d.values[0].cve_dd); })
        .attr("y1", function(d, i) { return y(d.key); })
        .attr("x2", function(d, i) { return x(d.values[0].cve_dd); })
        .attr("y2", function(d, i) { return y(d.key) + y.rangeBand(); })
        .attr("stroke-width", 2)
        .attr("opacity", function(d, i) { return x(d.values[0].cve_dd) < 0 ? 0 : 1; })
        .append("title").text(function(d, i) {
          return d.key +" created: " + d.values[0].cve_date + " (" + d.values.length + " threats)";
        });

    // var sources = d3.keys(d3.nest().key(function(d) { return d.source; }).map(data)).sort();
    // var color = d3.scale.category10()
    //   .domain(sources);

    // svg.selectAll(".legendShape")
    //     .data(sources)
    //   .enter().append("circle")
    //     .attr("class", "legendShape")
    //     .attr("cx", function(d, i) { return width + 24; })
    //     .attr("cy", function(d, i) { return 12 + 20*i; })
    //     .attr("r", 5)
    //     .attr("stroke", "lightgrey")
    //     .attr("fill", function(d, i) { return color(d); })
    //     .attr("stroke-width", 0.5)
    //     .attr("opacity", 0.5);
    // svg.selectAll(".legendText")
    //     .data(sources)
    //   .enter().append("text")
    //     .attr("class", "legendText")
    //     .attr("x", function(d, i) { return width + 32; })
    //     .attr("y", function(d, i) { return 16 + 20*i; })
    //     .attr("fill", function(d, i) { return color(d); })
    //     .text(function(d, i) { return d; });

    svg.selectAll("threatShape")
        .data(data)
      .enter().append("svg:a")
        .attr("xlink:href", function(d) { return "/threats/" + d.threat_id; })
      .append("circle")
        .attr("class", "threatShape")
        .attr("cx", function(d) { return x(d.threat_dd); })
        .attr("cy", function(d) { return y(d.cve) + y.rangeBand()/2; })
        .attr("r", 5)
        .attr("stroke", "lightgrey")
        // .attr("fill", function(d) { return color(d.source); })
        .attr("fill", "#ff7f0e")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.5)
        .append("title").text(function(d) {
            return d.threat_date + ': ' + d.subject +
              " (" + d.source +" / " + d.days_since_cve + " days since " + d.cve + ")";
        });


});
}
