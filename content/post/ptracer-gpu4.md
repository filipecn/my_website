+++
title = "A path tracer with CUDA - prt 4"
date = "2021-10-02"
# author = "Lorem Ipsum"
# cover = "/img/posts/pbrt-cuda/render.png"
description = "Memory: CPU pointers -> GPU pointers!"
tags = ["rendering", "gpu"]
toc = true
draft = false
+++

**What we have so far:**
- Polymorphism is now forbidden! Instead, we store a pointer to the _child_ object and cast properly before access ([part 3]({{< ref "/post/ptracer-gpu3" >}}))
- In practice, I'll be casting objects with [macros]({{< ref "/post/vtables-vs-switches" >}})

## Relations between classes

In PBRT you have a class `Shape` that is inherited by classes such as `Sphere` and `Cylinder`. A `Shape` child stores the geometric information
for a particular shape -- vertices, faces, position, scale, etc. -- and provides ray intersection tests.

Different objects in the scene can use the same shape with different sizes, rotations and so on. 
Recalling from the [previous post]({{< ref "/post/ptracer-gpu3" >}}), here is our `Shape` struct:
```cpp
struct Shape {
  hermes::Transform o2w;                 //!< object space to world space transform
  hermes::Transform w2o;                 //!< world space to object space transform
  hermes::bbox3 bounds;                  //!< world space bounds
  void *shape_data{nullptr};             //!< pointer to the child
  ShapeType type{ShapeType::CUSTOM};     //!< child type
  shape_flags flags{shape_flags::NONE};  //!< some useful flags
};
```
In our case, the `Shape` struct _puts_ the shape in the scene through its world transform. 
The geometrical description of the shape
is stored in the object deferred by the pointer `shape_data`. Multiple `Shape` instances may point to the same geometry.

{{<image src="/img/posts/pbrt-cuda/shape_rel.svg" position="center">}}

The PBRT uses the `Primitive` class to connect the shape to the shading. So each primitive has a `Shape` reference. Also, 
`Primitive` is an interface, since there are different types of primitives and the child class `GeometricPrimitive`
is the one that uses a `Shape`. 

{{<image src="/img/posts/pbrt-cuda/prim_rel.svg" position="center">}}

The scene is composed by a collection of different types of primitives. Our `Primitive` struct follows the same idea of the `Shape` struct,
and in the end we will also have the following relation:

{{<image src="/img/posts/pbrt-cuda/prim_rel2.svg" position="center">}}

The `GeometricPrimitive` also has a reference to a type of `Material` and other objects, that are also designed as the `Shape` type. 

>As you can see, there will be lots of pointers to manage :)

## So, what is the problem?

Well, create a scene with all those pointers is not hard ... at most inconvenient. But one thing is for sure, its easier to 
do all this setup in the CPU (even more if you want to create an interactive application).

The real problem with pointers is that once you transfer all your data to the GPU the pointers are not valid anymore.
Once the data is stored in the GPU memory the same objects will be stored in totally different memory addresses.

For the sake of fun and experiment, I'll try to use **offset pointers** instead. Instead of storing the raw pointer,
each object will store the offset of the deferred object based on the initial address of the buffer. In other
words, all data will be stored in a single buffer -- just like people do with _memory manager_ classes -- and each address
inside this buffer will be written as the offset to the buffer address.

This way, we can build and maintain the entire scene in the CPU and send it to the GPU without worrying about all these pointers.

## The Memory Arena

PBRT uses a class called `MemoryArena` to manage allocations. Here I'll (at least for now) use
the `MemoryStackAllocator` (which I talk about [here]({{< ref "/post/gpu_memory_allocator" >}})), that will serve to the same purposes -- although with some limitations.

Instead of pointers then, my `MemoryStackAllocator` return an `AddressIndex` for 
each allocated object, that can be used interchangeably between CPU and GPU.

However I go one step further, and define a `Ptr` struct, that will hold the `AddressIndex` **and** the actual pointer:

```cpp
struct Ptr {
    Ptr(hermes::AddressIndex address_index);
    // retrieve the actual pointer
    void *get();
    // computes and stores the pointer
    void update(hermes::StackAllocatorView m) {
      ptr = m.get<void>(address_index);
    }
  private:
    hermes::AddressIndex address_index;
    void *ptr{nullptr};
  };
```

Storing the pointer saves us the time of computing it every time we call `get()`. But wait, so what is the point of using 
this `AddressIndex` in the first place? It is just a convenient way of keeping track of our pointers. Sending the entire 
`MemoryStackAllocator` data to the GPU and just calling an `update` for all objects is much easier. Otherwise you would need
to keep different object references at the same time when updating your pointers. 

>The common method though, is to create everything in GPU side. No `AddressIndex` stuff, much easier! 

Anyways, here is the updated `Shape` struct:

```cpp
struct Shape {
  ...
  Ptr shape_data{nullptr};             //!< pointer to the child
  ...
};
```

## Notes
- [source code](https://github.com/filipecn/helios) 

> The [next]({{< ref "/post/ptracer-gpu3" >}}) post talks about ... TODO: no next post yet :)
