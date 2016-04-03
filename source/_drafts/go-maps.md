---
title: go-maps
comments: false
intro: Test 2 3
---
abc
<script src="http://d3js.org/d3.v3.js"></script>
<link rel="stylesheet" type="text/css" href="/vendor/nouislider.min.css">
{% vendor nouislider.min.js %}
<div>
<div id=all_board></div>
<div id=all_slider></div>
</div>
<div id=win_div></div>
<div id=first_div></div>
<script src="{% asset_path render_map.js %}"></script>
<script src="{% asset_path freq_maps.js %}"></script>
<script>
create_board("all");
</script>
