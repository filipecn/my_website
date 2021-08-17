Projects
---

{{< arts title="Physically Based Simulations" >}}

{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/rbf.gif" backimage="/img/projects/rbf2.gif">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/sim.gif" backimage="/img/projects/sim2.gif">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/up.gif" backimage="/img/projects/down.gif">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/maccormick.gif" backimage="/img/projects/drop.gif">}}

{{< arts title="BRDF Explorer" >}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/brdfexpl.gif" backimage="/img/projects/brdfexpl.png">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/brdf.png" backimage="/img/projects/brdfexpl3.png">}}

A [tool](https://github.com/filipecn/brdf-explorer) to experiment and test different models of brdfs for PBR rendering. 
Here you can choose between different implementations for the _normal distribution function_, _joint masking-shadowing function_ and _Fresnel reflectance_
components. Some parameters can be controlled as well.

## Comming up

- [ ] Disney diffuse model
- [ ] Anisotropic models

{{< arts title="GLSL Editor" >}}
A simple [shader editor](https://github.com/filipecn/glsl-experiments) tool that provides a convenient and quick way to test shader ideas. Here you can edit shader files and see the results in real time.

{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/topo.png" backimage="/img/projects/topo_back.png">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/cell.png" backimage="/img/projects/cell_back.png">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/normal.png" backimage="/img/projects/normal_back.png">}}
{{< flipcard fronttitle="" backtitle="" backtext="" link="" frontimage="/img/projects/pbr.png" backimage="/img/projects/pbr_back.png">}}

Everything can be done inside the application screen, from code editing to uniform value setting. Code uniforms are parsed and the GUI is updated automatically. Here is the list of current features:
* Continuous compilation (error listing)
* Save/Load shader files (including a configuration file containing values of light/material)
* Visual cues for debugging (point light, directional light)
* Custom uniforms support (you can create uniforms (uniform arrays are supported as well))

## Comming up

- [ ] Add other useful uniforms: time, mouse position, camera position
- [ ] Pass other mesh information to the shader as well.
- [ ] Incorporate ImGuizmo.
- [ ] Skybox/sphere allowing environment mapping.
- [ ] Shadows (add a floor to the scene).
- [ ] Save custom uniform values in config file.
- [ ] Load obj files.


{{< arts title="Vulkan" >}}

TODO

{{< arts title="Rust Experiments" >}}

Small [projects](https://github.com/filipecn/rust-experiments) to help me get involved with the rust language. Right now I only have one :)

In order to get into rust I started implementing a ray tracer following Peter Shirley's ray tracing [book series](https://drive.google.com/drive/folders/14yayBb9XiL16lmuhbYhhvea8mKUUK77W).

![](/img/projects/render.png)

> I’ve also been packing everything I do into a set of libraries that eventually serve me as frameworks to new projects 
(and hopefully help anyone who might use them). 

{{< arts title="hermes" >}}

[Hermes](https://github.com/filipecn/hermes) is a C++ utility lib containing a wide range of classes and algorithms. It serves as a swiss-knife for several types of projects.
Most of hermes features are also implemented in `CUDA`, which can be optionally enabled.

 Currently hermes comprises the following pieces:
* **Geometry**: points, vectors, matrices, transformations, intersection tests, quaternions, etc;

* **Storage**: memory blocks, multi-dimensional arrays, array of structures, texture memory regions;

```cpp
    // Example of an Array of Structures usage 
    hermes::AoS aos;
    auto vec3_field_id = aos.pushField<vec3>("v");
    auto f32_field_id = aos.pushField<f32>("f");
    aos.resize(4);
    auto acc = aos.accessor();
    for (int i = 0; i < aos.size(); ++i) {
      acc.valueAt<vec3>(vec3_field_id, i) = {1.f + i, 2.f + i, 3.f + i};
      acc.valueAt<f32>(f32_field_id, i) = 1.f * i;
    }
```

* **Numeric**: interpolation, differential operators, staggered grids, finite difference matrices;
* **BLAS**: Linear Algebra stuff, PCG, RBF;
* **Structures**: octree, BVH, half-edge meshes, morton code ordering; 
* **Common**: file system (bash-like) methods, string utils, reduce methods, marching cubes;

and other utilities such as thread pools, colored console output, memory dumper, fast sweep algorithms, etc. 

## Comming up
- [x] color struct fields in a memory dump inside the console.

{{< arts title="circe" >}}
[Circe](https://github.com/filipecn/circe) is a graphics engine written on top of OpenGL (and Vulkan in the future).
Initially, the goal was just to produce some lib to help me on building visualizations of my research data, 
but now there is a lot more I can do with it than I previously expected :)

![](/img/projects/shadows.png)

That is what Circe can provide for now:
* **UI**: imgui integration, gizmos, trackball, reference grids;
* **Graphics**: shader management, compute shaders, uniform buffers, post effects, shadow map;
* **IO**: texture, viewport displays, text, buffers, render buffers, framebuffer access;

and other useful utilities such as color palettes, mesh loading, primitive intersection, mouse picking, BVH, etc.

## Comming up
- [ ] improve the scene graph.
- [ ] add procedural methods for terrain generation

{{< arts title="odysseus" >}}
[Odysseus](https://github.com/filipecn/odysseus) is an ongoing project, on its early steps, of a data driven game engine.

## Comming up
- [x] Pool Allocator 
- [x] Stack and Double Stack Allocators 
- [x] mem singleton 
- [ ] add memory contexts

