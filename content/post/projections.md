+++
title = "Coordinate Systems and _their_ Projections"
date = "2021-04-01"
# author = "Lorem Ipsum"
# cover = "hello.jpg"
description = "An intro to projection transforms used Computer Graphics. "
+++

The fundamental tool we use to render our virtual world from different points of view is 
the coordinate system. We can define a coordinate system for each model,
for each light, for the camera, and one to arrange objects in the scene. Each of these 
coordinate systems define a coordinate space where we can compute position, orientation 
and size of our objects. We can also jump between different coordinate spaces. Each different space will fit best for each kind of situation.

There are many different types of coordinate systems. Here we will pay attention to two of them:
the **_Cartesian coordinate system_** and the **_Homogeneous coordinate system_**. Then we will see 
how they can be used in Computer Graphics.

### Cartesian Coordinates
Perhaps the most used coordinate system, the Cartesian 
coordinate system defines perpendicular planes (\\(\textbf{yz}\\),\\(\textbf{xz}\\) and \\(\textbf{xy}\\)) from an orthogonal base (\\(\textbf{x}\\),\\(\textbf{y}\\),\\(\textbf{z}\\)) in the Euclidean space and describes positions by 
their signed distances (\\(x\\),\\(y\\),\\(z\\)) to each of the planes, respectively -- that is our usual 3D coordinate space. Depending on how you pick the planes you may end up with a left-handed or right-handed
system, as depicted here, respectively:

{{<image src="/img/posts/projections/lhrh.svg" position="center">}}

> The handedness of you system is very important, because it will determine the orientation of
objects when jumping from one coordinate space to the other. We will dive into it soon.


### Homogeneous Coordinates
Another coordinate system of great importance for us is the Homogeneous coordinate system. 
Homogeneous coordinates (also called projective coordinates) are used in the projective 
space. In 2D, the triple (\\(xw\\),\\(yw\\),\\(w\\)), for \\(w \neq 0\\), is the set of homogeneous coordinates for the point (\\(x\\),\\(y\\)) in cartesian space.

> Note that now each point (\\(x\\),\\(y\\)) in Euclidean space is represented by the infinity set of homogeneous coordinates defined by \\(w\\). In the particular case of \\(w = 1\\) we recover the cartesian coordinate (\\(x\\),\\(y\\),\\(1\\)).

Roughly (and informally) speaking, you can imagine points in Euclidean space _sliding_ over the lines that connect them to a point at infinity (at the origin). The extra coordinate \\(w\\) gives you the projection of your geometry for that particular value of \\(w\\). In a way, \\(w\\) scales our space. For \\(w < 1\\) we get smaller objects, for \\(w > 1\\) we get bigger objects:

{{<image src="/img/posts/projections/homog.svg" position="center">}}

> In 3D we have a 4-dimensional coordinate system (\\(xw\\),\\(yw\\),\\(zw\\),\\(w\\)). And the projection given by \\(w = 1\\) gives the Cartesian space we are used to. 

Homogeneous coordinates allow us to perform operations -- such as translation, rotation and scaling -- on vectors and points in a unified manner. Such operations are described by a 4x4 matrix and the same matrix works for both vectors and points. In fact, 
GPUs use homogeneous coordinates to describe geometry in their processors, so we will use too. 

### Coordinate Spaces in Graphics
As mentioned before, every object in a scene lives in its
own coordinate system, the scene has a global coordinate
system to arrange all the objects, and the camera itself 
also uses a coordinate system to _view_ the world. 

Before producing the final image, other coordinate systems come into play, such as the **_normalized device coordinate system_** (NDC) that puts everything into a box \\([-1,-1,-1] \times [1,1,1]\\) and finally a screen coordinate system where the image takes its final form. 

All this sequence of different coordinate spaces describes the path of a vertex into the rendering pipeline until its final position in the screen. The figure bellow depicts an example of a scene containing a sphere and a camera looking at it:

{{<image src="/img/posts/projections/pipeline.svg" position="center">}}

In the figure each numbered white arrow represents one step down the pipeline. In this example we have:
1. The sphere is described in its **_local coordinate space_** (also called object space) -- in this case defined by a right-handed coordinate space -- which is transformed into the scene space (world space) -- defined by a left-handed coordinate system.
2. All world objects are then transformed into camera space -- defined by a right-handed coordinate system. This transformation is usually called the **_look at transform_**.
3. All space enclosed by the camera view (the frustrum) is then projected into the normalized device coordinate space. The two most common types of projection used here are the **perspective** and the **orthographic** projections.
4. Geometry is then projected into a 2D plane in screen space (pixels) and we have our final image.

The diagram above is just an example. We choose the set of coordinate systems the way we want. As long as we be careful to make the right transformations everything will
work just fine.

> Different game engines and modelling applications use different coordinate systems to describe their coordinate spaces.

### Transformation Matrices

From the graphics pipeline we can notice that our geometry 
will suffer several deformations and translations until
it get into the final screen space. Although most of these
transformations are linear maps, we also have
translations and perspective projection, which can't be expressed as matrix multiplications. It means that we can't combine linear maps and translation into a single matrix.

> In practice we want to be able to combine all the sequence of transformations in the pipeline in a single matrix. Which is much more efficient, because doing so would require us to compute a single matrix and apply it to each vertex, instead of applying several matrices to each vertex.

Here is where homogeneous coordinates come in handy. By _extending_ our cartesian coordinates with the extra \\(w\\) we are able to represent affine transformations by matrices. Affine transformations comprise all types of transformations we encounter in the graphics pipeline :)
Not only we can represent any transformation by a matrix, but we can also combine transformations by multiplying their matrices! 

> For example, imagine you want to translate (move) you vertex \\(p\\) using matrix \\(T\\) and rotate it with \\(R\\) (in that order). You could do it one transformation a time: \\(p = Tp\\) and then \\(p = Rp\\). Or you could just combine both matrices and do \\(p = RTp\\). It really makes the difference when you suddnely have hundreds of thousands of vertices.

Remember, now we must use homogeneous coordinates with \\(w = 1\\), a vertex \\(p\\) will have coordinates 
\\([x \quad y \quad z \quad 1]^T\\).

Alright, enough of theory, here are the operations for translation \\(T\\), scaling \\(S\\) and rotation \\(R_x\\), \\(R_y\\) and \\(R_z\\) around axis \\(x\\), \\(y\\), and \\(z\\), respectively:

 $$T(t_x,t_y,t_z)\\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 1 & 0 & 0 & t_x
 \\\\0 & 1 & 0 & t_y
 \\\\0 & 0 & 1 & t_z
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix} \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 x + t_x
 \\\\y + t_y
 \\\\z + t_z
 \\\\1
 \\end{bmatrix}$$

 $$S(s_x,s_y,s_z)\\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 s_x & 0 & 0 & 0
 \\\\0 & s_y & 0 & 0
 \\\\0 & 0 & s_z & 0
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix} \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 x\cdot s_x
 \\\\y\cdot s_y
 \\\\z\cdot s_z
 \\\\1
 \\end{bmatrix}$$ 


 $$R_x(\theta)\\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 1 & 0 & 0 & 0
 \\\\0 & \cos\theta & \sin \theta & 0
 \\\\0 & -\sin\theta & \cos\theta & 0
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix} \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 x
 \\\\y\cos\theta + z\sin\theta
 \\\\-y\sin\theta + z\cos\theta
 \\\\1
 \\end{bmatrix}$$ 
 
 $$R_y(\theta) \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix}= \\begin{bmatrix}
 \cos\theta & 0 & -\sin\theta & 0
 \\\\0 & 1 & 0 & 0
 \\\\\sin \theta & 0 & \cos\theta & 0
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix} \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 x \cos\theta -z\sin\theta
 \\\\y
 \\\\x\sin\theta + z\cos\theta
 \\\\1
 \\end{bmatrix}$$ 
 

 $$R_z(\theta) \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix}= \\begin{bmatrix}
 \cos\theta & -\sin\theta & 0 & 0
 \\\\\sin \theta & \cos\theta & 0 & 0
 \\\\0 & 0 & 1 & 0
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix} \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 x \cos\theta -y\sin\theta
 \\\\x\sin\theta + y\cos\theta
 \\\\z
 \\\\1
 \\end{bmatrix}$$

 > There are other cool transformations as well, such as the shear transform. In the case of rotation, a better approach is the use of quaternions -- I recommend checking that out.

 Now that we now how to deform and move things around, let's see how to jump between coordinate systems with a transformation matrix \\(M\\). What \\(M\\) does is to map each axis of the orgin coordinate system to an axis of the destination system. For example, suppose we want to move from
 a left-handed coordinate system \\(LH\\) to a right-handed system \\(RH\\), as represented in the first figure, and do the map \\(LH_x \rightarrow RH_x\\), \\(LH_y \rightarrow RH_y\\), and \\(LH_z \rightarrow -RH_z\\):
 
 $$LH = \\begin{bmatrix}
 x \quad (\textbf{right})
 \\\\y \quad (\textbf{up})
 \\\\z \quad (\textbf{front})
 \\end{bmatrix} \\rightarrow \\begin{bmatrix}
 x \quad (\textbf{right})
 \\\\y \quad (\textbf{up})
 \\\\-z \quad (\textbf{back})
 \\end{bmatrix} = RH \\therefore M = \\begin{bmatrix}
 1 & 0 & 0 & 0
 \\\\0 & 1 & 0 & 0
 \\\\0 & 0 & -1 & 0
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix}$$ 


I put some the directions in each axis points to relative to the figure: _right_, _left_, _up_, etc. However they do not really make sense, since they pretty much depend on our point of view (or from what angle we are looking at our hands). The important thing is: which axis is mapped to which axis and in what direction.

A second example: `Blender` uses a right-handed coordinate system \\(B\\) with \\(z\\) pointing upwards and \\(y\\) front, lets convert our previous \\(LH\\) system to this one following the map (check the figure bellow):

$$B = \\begin{bmatrix}
 x \quad (\textbf{right})
 \\\\y \quad (\textbf{front})
 \\\\z \quad (\textbf{up})
 \\end{bmatrix} \\rightarrow \\begin{bmatrix}
 x \quad (\textbf{right})
 \\\\z \quad (\textbf{front})
 \\\\y \quad (\textbf{up})
 \\end{bmatrix} = LH \\therefore M = \\begin{bmatrix}
 1 & 0 & 0 & 0
 \\\\0 & 0 & 1 & 0
 \\\\0 & 1 & 0 & 0
 \\\\0 & 0 & 0 & 1
 \\end{bmatrix}$$ 

 {{<image src="/img/posts/projections/blender.svg" position="center">}}

An example coordinate system change is the so called _look at_ transform. This transform performs a coordinate change followed by a translation. It is very useful in graphics because that is how we define the coordinate system used by the camera. The idea is put the camera in the origin of the new coordinate system, and align it to one of the axis (usually \\(z\\) or \\(-z\\)):

 {{<image src="/img/posts/projections/camera.svg" position="center">}}

Given a target position \\(t\\) to look at and camera position \\(p\\), the camera space is then defined by the 3 orthogonal vectors:
1. the direction \\(d\\) the camera is looking at (\\(t - p\\)).
2. the _up_ vector \\(u\\), that defines the lateral tilt, orthogonal to \\(d\\).
3. the _right_ vector \\(r\\), orthogonal to the other two.

```cpp
// There is a little catch here. You need to start with an 
// arbitrary up vector (usually (0,1,0)) and produce the
// right vector. The initial up vector may not be orthogonal
// to the direction vector, so you need to correct it by
// taking the cross product of the other two.
vec3 direction = normalize(target - camera_position);
vec3 up = {0,1,0};
vec3 right = cross(direction, up);
up = cross(direction, right);
```

This transform translates objects by \\(-p\\), so the camera takes the origin position, then it align the axis to form the camera space. It is important to notice once more that handedness also must be taken into account, in the example above (figure) both camera space and world space use right-handed coordinate systems, but it might not be true for other occasions.

The general form of the look at transform is:

$$lookAt \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix}= \\begin{bmatrix}
 r_x & r_y & r_z & -p_x
 \\\\ u_x & u_y & u_z & -p_y
 \\\\ d_x & d_y & d_z & -p_z
  \\\\ 0 & 0 & 0 & 1
 \\end{bmatrix} \\cdot \\begin{bmatrix}
 x 
 \\\\y
 \\\\z
 \\\\1
 \\end{bmatrix} = \\begin{bmatrix}
 (x,y,z)\cdot r - p_x
 \\\\(x,y,z)\cdot u - p_y
 \\\\(x,y,z)\cdot d - p_z
 \\\\1
 \\end{bmatrix} $$ 

> Sometimes just matching the handedness is not enough. Look the picture again and note that, in world space, the \\(z\\) axis is the _vertical_ direction, so objects will sit in the \\(xy\\) plane. But the camera in this case, considers the \\(y\\) axis as the vertical direction ... even worse, it considers \\(y\\) points downards! If you don't take it into account when constructing the \\(lookAt\\) matrix things might appear upside-down or inverted.

### Projection Matrices 
Let's finish this post with the set of projections we need to complete the graphics pipeline: the perspective and orthographic projections. Both transforms serve to project the visible geometry into the box shaped volume \\([-1,-1,-1] \times [1,1,1] \\) [^1], which later gets projected into the plane to form the final image. The figure bellow shows the working process of both orthographic and perspective projections, respectively:

[^1]: The output of the perspective, or orthographic, projection is called the normalized device coordinate system. The limits of this box shaped region depend on what graphics system we are using. OpenGL expects the volume to be \\([-1,-1,-1] \times [1,1,1]\\), while DirectX expects it to be \\([-1,-1,0] \times [1,1,1]\\).

 {{<image src="/img/posts/projections/projections.svg" position="center">}}

 Both projections work on top of a _view volume_ (in blue) -- the region of the scene that will be rendered. In the camera's view direction the view volume is clipped by the _near_ and _far_ planes. The volume is later projected into a _projection plane_ to form the final image.

 Each of theses projections produce a different effect. The orthographic projection, also called _parallel projection_, \\(P_o\\) keeps all angles and distances regardless the position of the objects. Because it already starts with a box shaped region \\([l,b,n] \times [r,t,f]\\) -- standing for the axis limits [left, bottom, near] x [right, top, far] -- , the region only needs to be resized and translated:

$$P_o = \\begin{bmatrix}
 2 / (r-l) & 0 & 0 & -(r+l)/(r-l)
 \\\\ 0 & 2 / (b-t) & 0 & -(b+t)/(b-t)
 \\\\ 0 & 0 & 2/(f-n) & -(n+f)/(f-n)
  \\\\ 0 & 0 & 0 & 1
 \\end{bmatrix}$$ 

 > Attention: all projection matrices here follow the coordinate system used in the figure.

 
The perspective projection on the other hand gives the 3D effect, making objects closer to the camera appear bigger than objects far away. This happens because now we start with a truncated pyramid like region, called frustrum, that gets deformed into the box shape. Note that when the deformation happens, the _thinner_ region gets streched. The shape of the frustrum is given by the _field of view_ angle (**fov**)[^2] and the position of the projection plane.

[^2]: There are two fov angles actually, one vertical, called **fovy** and one horizontal, called **fovx**. 

What the perspective projection is doing is to "calculate" 
where in the projection plane each vertex gets projected onto. The projection plane sits in the \\(z\\) coordinate value where \\(y\\) ranges from \\(-1\\) to \\(1\\), if we use the vertical fov. The range of \\(x\\) at
this point will depend on the aspect ratio of the clipping planes.

I'll not enter in details, but it involves a division by the \\(z\\) coordinate of the camera position, \\(p_z\\), called the _perspective divide_. The \\(p_z\\) is the value of \\(w\\) in our homogeneous coordinates after the projection into the projection plane. When \\(w = 1\\), the frustrum becomes a box shaped region and we get the desired result.

Given the \\(z\\) coordinates for the near plane \\(n\\) and 
for the far plane \\(f\\), the aspect ration \\(a\\) and vertical 
fov \\(\textbf{fovy}\\), the perspective matrix \\(P_p\\) :

$$P_p = \\begin{bmatrix}
 k / s & 0 & 0 & 0
 \\\\ 0 & k & 0 & 0
 \\\\ 0 & 0 & (f+n)/(f-n) & -2nf/(f-n)
  \\\\ 0 & 0 & 1 & 0
 \\end{bmatrix}$$
 where \\(k = 1 / \tan(\textbf{fovy} / 2)\\). 