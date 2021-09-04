+++
title = "A path tracer with CUDA - prt 1"
date = "2021-07-04"
# author = "Lorem Ipsum"
# cover = "hello.jpg"
description = "First thoughts on how pixels will be grouped and rendered."
tags = ["rendering", "gpu"]
toc = true
draft = false
+++


This will be my next journey. I finally organized my self to get into the [PBRT](https://www.pbr-book.org/) book.
The idea for this project is to implement it (well.. at least part of it). Also, to make thinks even harder I decided
to make use of the GPU. _Hopefully_, it will be my own _version_ of PBRT in CUDA.

> **Important note:** this will be my learning exercise, not only about rendering but also about CUDA. It will be more of an experiment than anything else. If you would like to get a more practical and better inspiration I super recommend [Peter Shirley's book series](https://raytracing.github.io/), you will quickly get something done with his books, they are amazing!

My idea is to read the PBRT book and re-implement it as I advance through the pages (PBRT code is available at [github](https://github.com/mmp/pbrt-v3) and the new version, with GPU support is also [there](https://github.com/mmp/pbrt-v4)). I'll simply implement the code presented in the book. However, 
I want to let my self diverge from the book as well -- to experiment different design and ideas, but in the end of the day most of the code 
will be very similar (if not the same) to the book.

My code will be [here](https://github.com/filipecn/helios).

## Algorithm
First of all, let me put the general algorithm and some initial considerations about the GPU implementation.

A bunch of rays must be spawned for each pixel in order to compute it's color. Let's say we want to generate 4 rays 
for each pixel, so in a 512x512 image we will shoot 1M rays (and each of these rays will bounce through the scene 
spawning more rays). The idea is basic, subdivide the image into sub-regions, called `tiles`, and render each 
tile in parallel. Each tile is a square region of 16x16 pixels, and the pixels of a tile are rendered sequentially.

The CPU `main` loop goes as follows:
```cpp
// Subdivide image into tiles
auto tiles = generateTiles(image);
parallel_for(auto tile : tiles) 
    renderTilePixels(tile);
```
This strategy works very well is you want to use CPU threads. It also works well on the GPU, but not so easy. Although
the GPU has way more processors than our humble number of CPU processors, we need to be aware of some rules and 
conditions imposed by the GPU architecture.
In the CUDA context, GPU threads are grouped into block of threads, which are then arranged in a grid of thread blocks. Each block
is executed by a single streaming multi-processor (SM). Each SM has its own registers, L1 cache and local memory.

As you may expect, the memory of a SM is shared by its threads. Also, there is a maximum number of threads that can compose a 
single block. So, depending on our design, we may not be able to run all tiles in parallel. Larger tiles require more 
computational effort and memory, which may violate our memory restrictions. Smaller tiles require larger blocks (grids),
which may not be support by the GPU. 

My current solution is to use **super tiles**, which are just tiles of tiles. The figure bellow shows an example of this tile hierarchy: 
pixels are grouped into tiles of 3x3 pixels, that are in turn grouped into super tiles of 2x2 tiles. So each super tile covers a image
region of 6x6 pixels.

{{<image src="/img/posts/pbrt-cuda/tiles.svg" position="center">}}

Each super tile is sent separately to the GPU and all its tiles are rendered in parallel. The CPU `main` code now becomes:
```cpp
// Subdivide image into tiles
auto tiles = generateTiles(image);
// Subdivide tiles into tile groups (tiles of tiles)
auto super_tiles = generateSuperTiles(tiles);
for(auto super_tile : super_tiles)
    // render on the gpu all tiles inside this super tile
    renderRegion(super_tile);
```

## Notes
- For now I'll keep things simple. I want to make things work first and only then make things better.
- Memory usage is actually the central point of the whole thing. It will dictates how our threads will access the scene elements 
and limit the size of tiles. Memory access has a huge impact in efficiency and I believe there are lots of
cool ideas to experiment with shared and texture memories. But for now, let's go easy and simple.

>The [next]({{< ref "/post/ptracer-gpu2" >}}) post talks about how tiles are actually processed and how pixel samples are generated.