+++
title = "Generating a tetrahedron meshes in Blender"
date = "2021-09-14"
description = "Calling TetGen from python and running it in Blender"
tags = ["python", "c++", "blender"]
toc = true
draft = true
+++

In this post I want to present a simple example of:
- how to use `c++` objects in python,
- and how to code a simple [Blender](https://www.blender.org/) add-on.

I'll try to imagine a simple case to use these two features. My idea is to write a Blender add-on that 
produces a volumetric mesh (made of tetrahedra) from the selected object in the scene.

First let's see how to generate a tetrahedron mesh in `c++`, then learn how to make `python` and `c++` talk,
so we can call our mesh generation code from `python`. Then, let's put it all together in a Blender add-on.

## TetGen

There are many tools out there that we can use to generate a tetrahedron mesh. Here are 3 **free** / **open-source** 
very good options:
- [TetGen](http://wias-berlin.de/software/index.jsp?id=TetGen&lang=1)
- [NetGen](https://ngsolve.org/)
- [TetWild](https://github.com/Yixin-Hu/TetWild)

Each of these alternatives use a different class of algorithm and has its own advantages that 
will suit you best depending on your needs.

>Here I will pick **TetGen** for no particular reason :)

TetGen can be compiled as a standalone executable that takes files as input and produces files that 
describe the resulting mesh. TetGen can also be compiled into a library that we can use in a `c`/`c++` code,
which offers two main advantages:
- callbacks to control some algorithmic / geometrical operations;
- and access to its mesh structures directly without the need to parse any file.

Let's go on with the library option. TetGen offers the following function:
```cpp
void tetrahedralize(tetgenbehaviour *b, tetgenio *in, tetgenio *out, ...);
```
The `tetgenbehaviour` is a struct you use to configure the mesh generation process. For example: you can
choose mesh constraints, maximum volume or angles permitted
in the output mesh, etc. The `tetgenio` is the struct that holds the mesh data for the input and output. The input can be comprised 
of vertices and faces. The output holds a list of tetrahedra and anything else you ask TetGen to compute.

Basically, you need to setup a `tetgenbehaviour` with the options you want and fill a `tetgenio` object with your input mesh. The
result is stored in the third argument `out`. Please refer to the [manual](http://wias-berlin.de/software/tetgen/1.5/doc/manual/manual007.html)
to see how it is done.

## `c++` and `python`

Now that we _know_ how to generate a mesh with `c++`, we want to call our `c++` code from `python`.

I decided to use the [pybind11](https://github.com/pybind/pybind11) library because it offers
a convenient way to make the interface between both languages. Basically, what we will do here is 
to generate a shared library from our `c++` code that will be imported into `python` like any other module.


In order to use `pybind11`, you will need to define your module interface in a `.cpp` file like this:
```cpp
#include <pybind11/pybind11.h>

namespace py = pybind11;

PYBIND11_MODULE(tetgenpy, m) {
  // here you put the interface definitions of the classes
  // functions, variables and everythig you want to expose
  // in this module
}
```

The name `tetgenpy` is the name of the module (notice that it is not `"tetgenpy"`, no `""`) and the `m` object is the 
handle for your module that is used in the definitions you put inside the macro. I'll show how to 
define our module functions soon.

>**Important note**: The name of your shared library object file must be the same as your module's name.

Now, suppose we have our mesh stored in the `std::vector` objects:
```cpp
std::vector<std::vector<float>> vertices;
std::vector<std::vector<int>> tetrahedra;
```
and that we expect to store `vertices` and `tetrahedra` into a `numpy.array` in `python`'s side. Then we need a function that 
translates the `std::vector` data into `numpy.array` data.

## Passing matrices with pybind11

`pybind11` offers helper classes for `numpy` object translations, that can be included with 
```cpp
#include <pybind11/numpy.h>
```
The representation of the `numpy.array` in the `c++` side is called `py::array`. In our case the conversion will 
happen like this:
```cpp
std::vector<std::vector<float>> vertices -> py::array_t<float>
std::vector<std::vector<int>> tetrahedra -> py::array_t<int>
```

Suppose you have a matrix `n` x `m` -- like `vertices` and `tetrahedra` matrices.
You can copy your vertex data, for example, into the `py::array` like this:
```cpp 
size_t n = vertices.size();
size_t m = vertice[0].size();

// create an py::array object with the correct shape
py::array_t<float, py::array::c_style> arr({n, m});

// create an auxiliary object to index arr data 
auto ra = arr.mutable_unchecked();

// copy data
for(size_t i = 0; i < n; ++i)
  for(size_t j = 0; j < n; ++j)
    ra(i, j) = vertices[i][j];
```
The same goes with `tetrahedra`.

## Creating a TetGen `python` module

I decided to expose TetGen to `python` through a class called `TMesh`, which I intend to use like this:
```python
import numpy as np
import tetgenpy as tg

vertices = np.array([[0,0,0], [...]])
faces = np.array([[0,1,2], [...]])

tet_mesh = TMesh(vertices, faces)

# get vertices
tet_mesh.points()
# get tetrahedron list
tet_mesh.tetrahedra()
```
So, in `c++` it is:
```cpp
class TMesh {
  public:
    TMesh(py::array_t<float> vertices, py::array_t<int> faces) {
      tetgenbehaviour b;
      tethenio in, out;
      ...
      tetrahedralize(&b, &in, &out);
      vertices_ = ...
      tetrahedra_ = ...
    }
    py::array_t<float> points() const {
      ...
      return arr;
    }
    py::array_t<int> tetrahedra() const {
      ...
      return arr;
    }
  private:
    std::vector<std::vector<float>> vertices_;
    std::vector<std::vector<int>> tetrahedra_;
};
```

Putting all together into a single `.cpp` file, and defining our class in the module we get:
```cpp 
#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <tetgen.h>

namespace py = pybind11;

class TMesh {
  ...
};

PYBIND11_MODULE(tetgenpy, m) {
  m.doc() = "tetgen wrapper";

  py::class_<TMesh>(m, "TMesh")
      .def(py::init([](py::array_t<float> vertices, py::array_t<int> faces) {
        return new TMesh(vertices, faces);
      }))
      .def("points", &TMesh::points, "mesh vertices")
      .def("tetrahedra", &TMesh::tetrahedra, "mesh tetrahedra");
}
```
