---
title: Procedural Island Generation in WebGL
categories:
  - WebGL
  - Procedural Generation
date: 2014-01-06 00:14:37
tags: WebGL,
comments: false
intro: Building islands with WebGL.
---

UCLA's 3D graphics class, CS 174A, had a final project to build a nontrivial, interative 3D graphics project in ~ 4 weeks. Four friends and I created a multiplayer third-person tank shooter using WebGL. Each player controls a tank and attempts to be the last tank standing. My contribution was creating the map for the game. We decided to make the map an island, as it allowed us to limit the playing field without resorting to invisible walls or other obvious barriers. To make things interesting, I decided to make the island procedurally generated, to provide a unique experience each time the game is played. About 60% of my time was spent working on getting the map generated and draw-able, and the other 40% was spent tweaking values on the generator to get results that looked nice and made for good gameplay. This post covers the latter portion and details the steps I took to go from nothing to the the island seen below.

{% asset_img final.png  Finished island. %}

**1\. Making the terrain**
To start, I generated a heightmap using a simplex noise function (an improved version of Perlin noise). I used banksean's Javascript implementation, which can be found on [this page](https://gist.github.com/banksean/304522). The heightmap is represented as a square array of vertices, and each [z][x] in the array was set to the output of the noise generator for that point. This gives the simplest possible heightmap. The result was pretty underwhelming :(

{% asset_img terrain-1.png Early version. %}

To improve the terrain, I smoothed the transitions by sampling points that were closer together, which was accomplished by multiplying each coordinate by a small value. By reducing the distance between samples, the height variations are reduced (since we are using a smooth distribution) and the resulting hills are less jagged.

While changing the "frequency" that heights are sampled at made the heightmap significantly better in terms of smoothness, it still left a lot to be desired. The downside of sampling points so close together was that it reduced the amount of variance in the map, creating a set of boring hills that were roughly the same size and shape.

{% asset_img generated_terrain2.png %}

To give give more shape to the map, I took a weighted sum of several noise values at different sampling frequencies rather than only using one. By combining multiple frequencies I was able to give the map more variance in shape while still preventing height changes from being too jagged. Using different weights for each frequency allowed me to fine tune the general shape of the map by allowing some frequencies to have a greater impact. I chose to give more weight to lower frequencies in order to create large rolling hills with a bit of variance, rather than the flat bumpy terrain I had before. The gist below shows the final implementation of the noise generation function.

{% codeblock lang:javascript %}
function getNoise(generator, xVal, zVal) {
    //Generates the noise value using a combination of amplitudes and frequencies
    var n = (8/15)*(generator.noise(xVal, zVal))
            + (4/15)*(generator.noise(xVal*2, zVal*2)
            + (2/15)*(generator.noise(4*xVal, 4*zVal))
            + (1/15)*(generator.noise(8*xVal, 8*zVal));

    //Clamps the value to [0,1]
    return (1+n)/2;
}
{% endcodeblock %}
While this produced much better results, it still tended to be a little jagged. To fix this, I smoothed the terrain by applying a box blur to the heightmap. This produces the final heightmap that will be used.

**2\. Making the Island**

With a working heightmap generator I was ready to move onto the next phase. I had rectangles, but I needed islands. First, for there to be an island, there needed to be an ocean. That part was easy - I just drew a blue square at the height I wanted the water level (cheap, but effective). After that, I needed to force the outer edges of the map underwater, leaving a contiguous region intact. While there are a number of ways to do this, I based mine off of amitp's excellent answer to [this post](http://gamedev.stackexchange.com/a/22203). His example uses a step function that either leaves the height alone, scales it down by a fixed amount, or sets it to 0, based on the distance from the center of the island and the height at the point. So the further from the center of the island you get, the taller you need to be in order to remain above water. I used the same approach, but modified it to use a continuous function to scale down values as it gave a smoother transition down to the water level. My version is given below.

```javascript
//Generate a mask to shape the terrain into an island
var dx = (((2 * x) / dimension) - 1);
var dz = (((2 * z) / dimension) - 1);
var d = (dx*dx)+(dz*dz);

var mask = height - (.4+.8*d)
var maskRange = (0.1 - (-0.5));
var maskWeight = (maskRange - Math.abs(0.1-mask))/maskRange;

if (x == 0 || z == 0 || x >= dimension-2 || z >= dimension-2) {
    height = 0; //Force edges of the terrain into the ocean
} else {
    if (mask > 0.1) {
        height = height; //No change
    } else if (mask > -0.5) {
        height *= maskWeight;
    } else {
        height = 0;
    }
}
```

The reasons I chose this method were how straightforward it was to implement and the quality of the results. The mask gives a nice slope down to the water level, without looking too flat or artificial. Additionally, it allows for lakes on secondary islands to exist depending on the magic numbers used to compute the mask value.

At this point, I now had a fully functional island. An example of what the island looked like at this stage is shown below.

{% asset_img island1.png %}

There was still one last piece of the puzzle before the island was complete. The green and red coloring had to go. At first I tried using a simple grass texture, but it was too uniform, making it hard to see terrain changes. However, by taking advantage of WebGL's multitexturing capabilities, I was able to get some pretty cool results.

**3\. Multi-texturing**

I used multitexturing to make the terrain appear to change based on elevation. For the game, we used 5 different textures - sand, dirt, grass, rock, and snow (the island has extreme microclimates). These were applied and blended together in the fragment shader based on predefined texture regions. Many online tutorials talk about using splatting or using another texture to encode data about what texture to show, those were rather overcomplicated for my purposes. My method applies the proper texture based on the height of the terrain. Additionally, in areas where two textures overlap, the two textures are blended to provide a smooth transition. Part of the fragment shader code is provided below:

```javascript
function TerrainRegion(min, max) {
    this.min = min;
    this.max = max;
}

var regions = [
    new TerrainRegion(0, 8),
    new TerrainRegion(5, 18),
    new TerrainRegion(14, 42),
    new TerrainRegion(38, 54),
    new TerrainRegion(51, 70)
];

//Region 1
if (height <= region1.max)
{
        if (height < region2.min)
                            regionWeight = 1.0;

        else
        {
            regionRange = region1.max - region2.min;
            regionWeight = (regionRange - abs(height - region2.min)) / regionRange;
        }
}

        else
            regionWeight = 0.0;

        textureColor += regionWeight * texture2D(region1Texture, vec2(vTextureCoord.s, vTextureCoord.t));

//Region 2
if (isBetween(height, region2.min, region2.max))
{
    if (height <= region1.max)
    {
        regionRange = region1.max - region2.min;
        regionWeight = (regionRange - abs(region1.max - height)) / regionRange;
    }

    else if (height >= region3.min)
    {
        regionRange = region2.max - region3.min;
        regionWeight = (regionRange - abs(height - region3.min)) / regionRange;
    }

    else
        regionWeight = 1.0;
}

else
    regionWeight = 0.0;

    textureColor += regionWeight * texture2D(region2Texture, vec2(vTextureCoord.s, vTextureCoord.t));
```

While this method is not as powerful using splatting or other methods, it is trivial to implement, looks decent, and is easily tweakable. By changing the overlap between regions, I was able to change how fast the transition happened, and in what regions the textures would appear.

{% asset_img island_multi.png %}

This final result is what we used in our game, and is what can be seen in the first picture in this post. Although this is not the most sophisticated or powerful generator it served our needs well and allowed for rapid prototyping, which was important given the time contraints we had.

If you would like to see more please check out the [source code](https://github.com/pcrumm/tank-project), and check out one of my partners' [blog](http://www.ryanhansberry.com/blog/tanks.html). Even better, grab some friends and try it out [here](http://tanks.ryanhansberry.com/). Unfortunately, that version does not fully utilize the procedurally generated terrain, as it uses the same seed every game, instead of changing the seed.

Note: This project was the first time I used Javascript, and we did not have a huge amount of time, so some of the code will probably not be particularly pretty or idiomatic. Additionally, there are a couple bugs and shortcuts still in that that didn't get fixed due to time constraints.
