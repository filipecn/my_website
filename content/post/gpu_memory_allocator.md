+++
title = "GPU/CPU Memory Stack Allocator"
date = "2021-10-01"
# author = "Lorem Ipsum"
# cover = "/img/posts/pbrt-cuda/render.png"
description = "Memory: CPU pointers -> GPU pointers!"
tags = ["c++", "gpu", "storage"]
toc = true
draft = false
+++

In this post I'll experiment an idea to keep pointers of a memory block
between CPU and GPU. The motivation here is to allow ourselves
to allocate memory and instantiate objects on CPU side and be able
to use their _memory addresses_ in GPU. 

Of course addresses change after we copy our data to the GPU! But I want
to use a very basic idea: store memory address offsets instead of 
actual memory addresses.

To make things easier (or possible) I'll will use my own memory allocator, which will provide offsets instead of addresses whenever you allocate new 
blocks of memory.

## Memory Stack Allocator

There are several types of memory allocators out there with lots of 
cool features, I'll pick one of the simplest: the **Stack Allocator**.

The Stack Allocator works just like a stack. Memory blocks are allocated
contiguously, one after the other. The image bellow shows 3 allocated blocks,
with indices `0`, `1` and `2`. The pointer `3` represents what will be the
location of the next allocated block. `c` is the total capacity of the stack.

{{<image src="/img/posts/stackmemory/stack1.svg" position="center">}}

Being a stack, you are not allowed to free any block that is not in 
the top. So if we want to free the block `1`, `2` will be also destroyed.
If the stack never changes in size or move in memory, we could just return
the actual address of each block. But that is not our goal here.

## Memory Offsets

Remember, we want to send data to the GPU and be able to use the same 
_indices_ to access our data (just like if we had an array). The solution 
here is to return the offset (in bytes) of the allocated block.

Imagine our previous example: If block `0` has 64 bytes in size, block `1` 
has 640 bytes, and block `2` has 100 bytes. The _pointers_ to these blocks
will be respectively `0`, `64` and `704`.

{{<image src="/img/posts/stackmemory/stack2.svg" position="center">}}

## Implementation

So now, instead of a pointer we may have an `AddressIndex` (this is just
an arbitrary name) that will store the stack offset:

```cpp
struct AddressIndex {
  AddressIndex(std::size_t id) : id(id) {}
  const std::size_t id;
};
```

Notice that we could define some rules, such as an address index with id `0` 
representing `nullptr` (given the proper modifications).

We will need to access the stack whenever we access our allocated objects
 -- unless we store the pointer as well. It is ok for me, since the goal here 
 is to ease the task of keeping the relations between data.

The `MemoryStackAllocator` class interface goes like this:

```cpp
class MemoryStackAllocator {
public:
  MemoryStackAllocator(std::size_t capacity_in_bytes);
  // The "push" method of our stack
  template<typename T, class... P>
  AddressIndex allocate(P &&... params);
  // The "pop" method, free all blocks down to the given marker
  void freeTo(AddressIndex handle);
  // The access for a given stack element (not just "top")
  template<typename T>
  T *get(AddressIndex handle);
private:
  // Stack memory
  u8 * data_;
  // Total stack memory size in bytes
  std::size_t capacity_;
  // Index to the top of the stack
  std::size_t marker_;
};
```

We could reproduce our example this way:
```cpp
struct A {...}; // 64 bytes
struct B {...}; // 640 bytes
struct C {...}; // 100 bytes

// create a stack with 1kB of capacity
MemoryStackAllocator stack_allocator(1024);
// allocate our objects
auto a = stack_allocator.allocate<A>(/*A ctor params*/);
auto b = stack_allocator.allocate<B>(/*B ctor params*/);
auto c = stack_allocator.allocate<C>(/*C ctor params*/);
// Now, if we want to access each object we do
stack_allocator.get<A>(a)->... // A method, field..
stack_allocator.get<B>(b)->... // B method, field..
stack_allocator.get<C>(c)->... // C method, field..
```

I know, that is not convenient. But this is just as simple as it can be.

## CPU -> GPU

The cool thing is that we can easily allocate and prepare our memory 
in CPU side and send it all to the GPU (as normally happens), but 
access data the exact same way.

Again, this is just an alternative. There are a bunch of creative ways 
to access data in GPU. It really depends on your goals here. 

