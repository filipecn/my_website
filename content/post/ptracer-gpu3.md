+++
title = "A path tracer with CUDA - prt 3"
date = "2021-09-05"
# author = "Lorem Ipsum"
# cover = "/img/posts/pbrt-cuda/render.png"
description = "Object handling avoiding polymorphism and a first render!"
tags = ["rendering", "gpu"]
toc = true
draft = false
+++

**What we have so far:**
- The image will be rendered in the GPU in groups of tiles. Each tile covers a sub-region of the image with 16x16 pixels. ([part 1]({{< ref "/post/ptracer-gpu" >}}))
- A set of rays is generated for each pixel. Each ray direction is based on a random sample of the pixel's area. We pre-compute and store all samples with a `SamplePoll` structure. ([part 2]({{< ref "/post/ptracer-gpu2" >}}))


The next topic is the way we will handle our objects (scene objects, materials, lights, etc...). Ray tracers are usually built on top of class hierarchies and PBRT is no different.
The core algorithm will test ray intersection against several types of objects (spheres, cubes, meshes, ...) and polymorphism just fits in. However, I'll experiment something here: **avoid polymorphism**.

For no particular reason though. I could argue that I wanted to avoid the indirection caused by virtual methods, but I believe that as CUDA get new versions this kind of indirection would not be such an overhead. BUT let's see how a bunch of `if`s go.

> The idea is simple: There are no virtual methods on the base class anymore, the base class just holds the data common to its children and a pointer to the child. Children classes are assumed to provide the methods they are expected to do. During iteration, the pointer to the child is casted to the correct child type.

## _C_-like polymorphism

Let's get an actual example to make it more clear. The scene is composed by a set of scene objects of different shapes -- spheres, boxes and meshes of triangles. Each shape in the scene has its own position, rotation and scale for example. So we can define a base structure for all shapes as so:

```cpp
enum class ShapeType {
  SPHERE,
  MESH,
  CUSTOM
};

struct Shape {
  hermes::Transform o2w;                 //!< object space to world space transform
  hermes::Transform w2o;                 //!< world space to object space transform
  hermes::bbox3 bounds;                  //!< world space bounds
  void *shape_data{nullptr};         //!< pointer to the child
  ShapeType type{ShapeType::CUSTOM};     //!< child type
  shape_flags flags{shape_flags::NONE};  //!< some useful flags
};
```

Now we can have a list of shapes `vector<Shape>` on which we can iterate and check ray intersection:

```cpp
vector<Shape> shapes;
// iterate over shapes
for (auto shape : shapes) {
  // check shape type
  switch (shape.type) {
    case ShapeType::SPHERE:
      // cast pointer properly
      reinterpret_cast<Sphere*>(shape.shape_data)->intersect(...);
      break;
    case ShapeType::MESH: ... break;
    case ShapeType::CUSTOM: ... break;
  }
}
```

> The same idea may be extended to template functions and classes.

I'll use this design mostly in classes I judge to be more intensively accessed and iterated over.
In fact, everything that goes over the ray interaction with the scene will receive this same treatment.

Right now, I've applied this logic to:
- **ray**: The `RayDifferential` no longer inherits from `Ray`, but holds a `Ray` object in it.
- **interaction**: Same happens with `SurfaceInteraction`, that now holds an `Interaction` object in it.

Also, `Material`, `Primitive`, `BSDF` and `BSSRDF` will be like this as well. 

## First Result
Putting all together we now have this general algorithm:
```cpp
device_vector<Shapes> shapes;
... // setup scene with shapes and shape types
// Subdivide image into tiles
auto tiles = generateTiles(image);
// Subdivide tiles into tile groups (tiles of tiles)
auto super_tiles = generateSuperTiles(tiles);
for(auto super_tile : super_tiles) {
  StratifiedSampler sampler;
  ... // pre-compute samples for tiles in super_tile
  // render on the gpu all tiles inside this super tile
  for_gpu_threads(auto tile : super_tile) {
    ... // compute bounds for tile x0, y0 ...
    bounds2i tile_bounds({x0, y0}, {x1, y1});
    auto film_tile = film.getFilmTile(tile_bounds);
    // loop over pixels in tile
    for(auto ij : tile_bounds) {
        // initiate sampler to generate the pixel samples
        sampler.startPixel(ij);
        do {
            // retrieve pixel samples
            auto sample = sampler.sample(ij);
            // compute camera ray
            auto ray = camera.generateRayDifferential(sample);
            // traces ray through the scene and computes its radiance
            Spectrum L = scene.intersect(ray); // iterate over shapes
            // register radiance into film tile
            film_tile.addSample(sample, L);
        } while(sampler.startNextSample());
    }
    // store final film tile radiances into final film 
    film.mergeFilmTile(film_tile);
  }
}
```
It is actually a lot already :), but we are still in the basics. There is no shading yet. No materials or lights.
I only made the `Sphere` as the only available `Shape` type and its intersection returns the full radiance.
I set up the camera looking straight to the sphere and voilà! Our first render!

{{<image src="/img/posts/pbrt-cuda/render.png" position="center">}}


## Notes
- Just a reminder of the [link](https://github.com/filipecn/helios) of the source code.
- There are other parts and details I had to implement in order to get the first render that I've not mentioned. I'll only put the things that diverge most from the PBRT code for now.
- There is no filtering going on in the film as well (just the box filter).

> The [next]({{< ref "/post/ptracer-gpu3" >}}) post talks about ... TODO: no next post yet :)