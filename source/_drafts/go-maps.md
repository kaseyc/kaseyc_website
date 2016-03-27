---
title: go-maps
comments: false
intro: Test 2 3
---
abc
<script src="http://d3js.org/d3.v3.js"></script>

<div id=my_div></div>
<script src="{% asset_path render_map.js %}"></script>
<script src="{% asset_path freq_maps.js %}"></script>
<script>
plot_freq_map(compute_freq_map(freq_maps, [1600,2000]), "my_div");
</script>
