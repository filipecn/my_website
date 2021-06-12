+++
title = "Interplay of Light"
date = "2021-04-13"
# author = "Lorem Ipsum"
# cover = "hello.jpg"
description = "A little (and lazy) introduction to Physically Based Shading."
tags = ["rendering", "real-time"]
toc = true
+++

>This text is just my personal notes on BRDFs. The text is heavily based on these references: [real time rendering book](https://www.realtimerendering.com/), [learn opengl website](https://learnopengl.com/PBR/Theory), [Google's Filament](https://google.github.io/filament/Filament.md.html#materialsystem/diffusebrdf) and [here](http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html). 

Let's consider light modeled as an electromagnetic wave (but treated as a ray when convenient), and
our rendered image as the combination of all light that get into the camera sensors.

 {{<image src="/img/posts/pbr/light.svg" position="center">}}

>An important property of light is the _wavelength_ \\(\lambda\\), because it is 
related to the color of a particular light wave. Humans, for example, can only perceive light with wavelenghts 
ranging from 400 to 700 nanometers.

As light propagate through media, the interaction with matter (molecules)
deviates the direction of propagation and light gets **_scattered_**. Different media will scatter
different light waves in different ways depending on their wavelenghts.
 
 ---

 ## Radiance of Light

In Physically Based Rendering (PBR), the _radiant energy_ carried by light waves plays a 
central role. From radiant energy we obtain:
- **Radiant Flux** \\(\Phi\\) measures the flow of radiant energy carried by light. \\(\Phi\\) is measured in _watts_ (\\(W\\)).
- **Irradiance** \\(E\\) is the density of the radiant flux \\(\Phi\\) with respect to an area \\(A\\), i.e., \\(d\Phi/dA\\). \\(E\\) is measured in \\(W/m^ 2\\).
- **Radiant Intensity** \\(I\\) is the flux density \\(\Phi\\) with respect to a _solid angle_ \\(\omega\\) [^1]. \\(I\\) is measured in watts per steradian [^2] \\(W/sr\\).
- **Radiance** \\(L\\) is the electromagnetic radiation in a single ray of light. It is
the density of radiant flux with respect to both area and solid angle (\\(d^2\Phi/dAd\omega\\)). \\(L\\) is measured in \\(W/(m^2sr)\\).
[^1]: **Solid angle** is the area of a piece of surface projected onto the unitsphere.
[^2]: **Steradian** is the measurement unit of the solid angle. As we measure angles in radians, we measure solid angles in steradians.

The radiance entering the camera is what will produce the final image. Measuring the
incoming radiance in a pixel (film sensor) gives the brightness and color for each
ray of light.

Since light spreads in all directions, the radiance \\(L\\) is actually a distribution function. 
A particular radiance measurement, \\(L(x,d\\)), will depend on a position \\(x\\) and a direction \\(d\\). So what we need is to compute the radiance that leaves the surface point in the 
direction of the camera [^4].
[^4]: Here we assume that there is no participating media in the space lights travel from the surface
and the camera, so its radiance doesn't change.

{{<image src="/img/posts/pbr/brdf.svg" position="center">}}

Given a point \\(p\\) in the surface to where the camera, at position \\(c\\), is looking at.
The vectors \\(l\\) and \\(v\\) represent the light direction and view direction, respectively
-- both pointing away from the surface (figure). We want to compute the radiance that arrives 
from \\(l\\) and leaves \\(p\\) in the \\(v\\) direction.


>If we use the suffix \\((\cdot)_i\\) for incoming directions and \\((\cdot)_o\\) for outgoing directions, 
then our goal is to compute \\(L_o(p,v)\\).

## BRDF

Local reflectance -- the amount of light being reflected in a small region of the surface -- can be
calculated by a **_Bidirectional Reflectance Distribution Function_** (BRDF) 
$$f(l,v) = f_{spec}(l,v) + f_{diff}(l,v),$$ 
made of a diffuse component \\(f_{diff}\\) and a specular component \\(f_{spec}\\). The specular reflection 
component represents light that is reflected directly by the surface of an object. The diffuse component
represents the rest of light that is scattered inside the surface/object before leaving the surface.
For now lets focus on the specular component.

This function depends only on the incoming direction of light \\(l\\) and an outgoing direction 
\\(v\\) for the reflected light. In other words, for a incoming light direction, this function computes 
how much of this light gets reflected into a given outgoing direction. Different BRDFs will
produce different patterns of reflection (see right column in the figure).

To compute the outgoing radiance \\(L_o(p, v)\\), we need to consider all
incident radiances from all incoming directions. These directions are defined by the 
unit hemisphere \\(\Omega\\) centered in the surface point, and aligned to the surface normal (figure). 
Each incoming radiance is then combined with the BRDF to form the **_reflectance equation_**:

$$L_o(p,v) = \int_{l\in \Omega}f(l,v)L_i(p,l) n\cdot l dl$$

> The term \\(n\cdot l\\) scales the radiance based on the incident angle \\(\theta_i\\) --
remember that \\(n\cdot l = \cos \theta_i\\). This term comes from the fact that radiance is 
defined over an area \\(A\\) perpendicular to the light's ray, which is not the case here, as the
tangent plane is perpendicular to the surface normal, and not the light ray (See [Lambert's cosine law](https://en.wikipedia.org/wiki/Lambert%27s_cosine_law)).

In practice, we want to compute the radiance of the 3 wavelengths respective to red, green and 
blue, because pixel colors are stored in RGB. The discrete version of the reflectance equation used in shading is

$$L_o(p,v) = \pi \sum^n_{i=1}f(l_i,v)c_{light_i}(n \cdot l_{i})^+,$$

where \\(n\\) is the number of light sources, \\(c_{light_i}\\) is the color (radiance) of light \\(i\\), 
and \\(l_i\\) its direction. Note that we need
to clamp the cosine value since invalid angles (\\(l \notin\Omega \\)) can appear due to light rays
coming from behind the surface.

---

Essentially the objects in a scene will have different material properties that will
interact with light in different ways. This interaction is defined by the BRDF particular
to each type of material. In the real-time rendering pipeline, we will process a fragment
that represents a piece of surface with a particular BRDF.

## Surfaces

An object surface can be seen as an interface between two different media --
for example, air and metal or water. When light hits such interface, some waves
move forward (called **_transmitted waves_**) and some get reflected (called **_reflected waves_**).
The transmitted waves suffer alteration in their speed, thus direction gets **_refracted_**.

 {{<image src="/img/posts/pbr/snell.svg" position="center">}}

 The new direction of the refracted light can be calculated from the _Snell's law_:
 
 $$\sin \theta_t = \frac{\eta_1}{\eta_2}\sin \theta_i$$

where \\(\eta_1\\) and \\(\eta_2\\) are the _indices of refraction_ [^iof] of the 
initial medium (top region in the figure above) and destination medium, respectively.
All angles are formed with the normal of the surface at the point of intersection. 
The incident angle \\(\theta_i\\), same to the reflection angle, and the angle of refraction 
\\(\theta_t\\).
 [^iof]: **Index of Refraction** (IOF) represents the ration between the wave velocities, 
 original and new, when passing through a medium.

The amount of light reflected is described by the **_Fresnel reflectance_** \\(F\\) function, which 
depends on \\(\theta_i\\). In real-time rendering a typical approximation of the Fresnel
reflectance equation is the Schlick equation

$$F \approx F_0 + (1-F_0)(1-(n\cdot l)^+)^5,$$

where \\(F_0 = ((n-1)/(n+1))^2\\). \\(F_0\\) is usually interpreted as the specular color of the surface.

 >The transmitted waves continue to interact with the medium and part of it gets absorbed. 
 The rest gets scattered back to the outside through a different surface
 point. This light is called the **_subsurface-scattered_**
 light will compose our diffuse component. However, let's keep focusing only on the
 reflected light for now.

## The microgeometry of surfaces

 As you can see, the normal of the surface has a huge influence on the final directions of 
 light rays. When dealing with PBR, we don't consider any surface as perfectly aligned, so even flat
 surfaces present several variations on their normal vectors. Such variations happen in a very small scale of its geometry (much smaller than a pixel actually). They are called the **_microgeometry_**
 of the surface.

 {{<image src="/img/posts/pbr/microgeometry.svg" position="center">}}

 It is infeasible to represent the microgeometry in a mesh, so we rely on the 
 statistical distribution of their normals. The more variation we have, more light is
 reflected in different directions and we get a bigger and smoother specular lobe. This variation will determine the **_roughness_** of the
 surface geometry (more on that later).

 In order to model the microgeometry, we use the _microfacet theory_. The idea is that
 the microgeometry is actually composed of lots of _microfacets_, and each microfacet has a 
 normal \\(m\\) an therefore an individual BRDF \\(f_\mu(l,v,m)\\) attached to it. The combination of all 
 microfacet BRDFs give the global surface BRDF.

 The normals of all microfacets are described by a **_normal distribution function_** (NDF) \\(D(m)\\)
 -- no relation to the same term used in probability.
 Most surfaces have NDFs that show a strong peak at the surface normal \\(n\\). It happens that, 
 several microfacets can be occluded by others depending on the view direction [^5], which 
 impacts directly on the visible surface area, and therefore affects the amount of reflected
 radiance. Thus, we need to define a **_distribution of visible normals_** \\(G_1\\), given
 by Smith as 
$$G_1(m,v) = \frac{\chi^+(m\cdot v)}{1 + \Lambda(v)},$$
where \\(\chi^+\\) is the characteristic function:
$$\chi^+(x) = \begin{cases}1, & x > 0\\\\ 0, & x \leq 0 \end{cases},$$
and \\(\Lambda\\) is specific to each
type of NDF. The final BRDF equation is:
$$f(l,v) = \int_{m\in\Omega}f_\mu(l,v,m)G_2(l,v,m)D(m)\frac{(m\cdot l)^+}{|n\cdot l|}\frac{(m\cdot v)^+}{|n\cdot v|}dm,$$

where \\(G_2\\) is the **_joint masking-shadowing function_**, which incorporates shadowing of 
microfacets, and is defined as

$$G_2(l,v,m) = G_1(v,m)G_1(l,m).$$

Before going any further on NDFs and the \\(\Lambda\\) term in \\(G_1\\), lets put some practical 
observations here. In real-time rendering we don't want to solve an integral in the shader.
However, if we consider each microfacet being a Fresnel mirror -- light being reflected to a single direction from \\(\theta_i\\) -- then, for a given view direction \\(v\\), only microfacets with the 
normal \\(m\\) aligned to the half vector
$$h = \frac{l + v}{\parallel l + v\parallel}$$
will contribute to the outgoing radiance. This way the integral results in the specular BRDF
$$f_{spec}(l,v) = \frac{F(h,l)G_2(l,v,h)D(h)}{4|n\cdot l||n\cdot v|}.$$

>Note that since we assumed microfacets as Fresnel mirrors, then the microfacet BRDF \\(f_\mu\\)
is defined as the Fresnel reflectance \\(F\\). Also, this is the specular
contribution we get, we will also need a diffuse contribution to get a complete model.

 [^5]: Just like big mountains hiding smaller ones from our sight.

 ---
 [Here](http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html) you can find
 a list of NDF, \\(F\\) and \\(G_1\\) functions. 

 ---
The shader code for our specular contribution will be like this:
```cpp
// surface normal at fragment
vec3 n = normalize(fragment_normal);
// view direction
vec3 v = normalize(camera_position - fragmen_position);
// light direction
vec3 l = normalize(light_position - fragment_position);
// half vector
vec3 h = normalize(v + l);
// incoming radiance
vec3 radiance = light_color;
// compute specular BRDF terms
float NDF = normalDistributionFunction(n, h, roughness);
float G2   = geometricShadowing(n, h, v, l, roughness);
vec3 F    = fresnel(v, h, f0);
// compute specular BRDF integral
vec3 nominator    = NDF * G2 * F;
float denominator = 4 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
vec3 specular = nominator / max(denominator, 0.001);
// reflectance equation
vec3 Lo = ...
```
 ## The Diffuse Contribution

Let's now consider the transmitted light that get scattered back to the outside medium.
In this case, we will be interested in how much of the transmitted light is not absorbed.
This quantity is named **_subsurface albedo_** and is represented by the symbol
\\(\rho_{ss}\\). Usually, \\(\rho_{ss}\\) is interpreted as the diffuse color of the surface
and has 3 components, to match the RGB model.

Depending on the distances traveled by transmitted light inside the material before it leaves the
surface a different model must be used. So far we've considered the microfacet theory based models 
for specular reflection, which can be used in cases where light travels small distances 
restricted to microfacet sizes. Such models of local subsurface scattering, based on the
roughness of the surface, are called rough-surface diffuse models.

Using the fact that the Fresnel reflectance \\(F\\) gives us the amount of light that is directly reflected,
we can use its counterpart to compute the diffuse term

$$f_{diff}(l,v) = (1 - F(h,l))\frac{\rho_{ss}}{\pi}.$$
The previous model uses the Lambertian model, which assumes that light is uniformly distributed under the 
surface, which is not the case for several types of material. This model also does not take into account
that light gets refracted when leaving the surface as well. The Shirley model addresses these issues:

$$f_{diff}(l,v) = \frac{21}{20\pi}(1-F_0)\rho_{ss}(1-(1-(n\cdot l)^+)^5)(1-(1-(n\cdot v)^+)^5)$$

In the case where traveled distances are greater than microfacet scales, then smooth-surface diffuse
models should be used. An example is the Hammon diffuse model:

$$f_{diff}(l,v) = \chi^+(n\cdot l)\chi^+(n\cdot v)\frac{\rho_{ss}}{\pi}((1 - \alpha)f_{smooth} + \alpha f_{rough} + \rho_{ss}f_{multi}),$$
where
$$f_{smooth} = \frac{21}{20}(1 - F_0)(1 - (1- n\cdot l)^5)(1 - (1- n\cdot v)^5),$$
$$f_{rough} = k_{facing}(0.9 - 0.4k_{facing})(\frac{0.5 + n\cdot h}{n\cdot h}),$$
$$k_{facing} = 0.5 + 0.5 (l\cdot v),$$
$$f_{multi} = 0.3641\alpha,$$
and \\(\alpha\\) is the GGX specular roughness.