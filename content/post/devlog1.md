+++
title = "devlog 1"
date = "2021-05-22"
# author = "Lorem Ipsum"
# cover = "hello.jpg"
description = "Some updates on cubemap textures."
tags = ["devlog"]
# toc = true
+++



I decided to register my coding activities in this series of _devlog_ blog posts.

### Cubemap textures
Now circe has some convenient functions to handle cubemap textures. Loading from 
separate files is easily done by
```cpp
auto cubemap = circe::gl::Texture::fromFiles({  ".../skybox/right.jpg",
                                                ".../skybox/left.jpg",
                                                ".../skybox/top.jpg",
                                                ".../skybox/bottom.jpg",
                                                ".../skybox/front.jpg",
                                                ".../skybox/back.jpg"   });
```
A single file containing an equirectangular mapped texture, for example, can be 
loaded as a cubemap :  
```cpp
auto cubemap = circe::gl::Texture::fromFile(".../image.hdr",
                                           circe::texture_options::equirectangular |
                                               circe::texture_options::hdr,
                                           circe::texture_options::cubemap);
```
* HDR textures are now supported as well.

---

If you want to debug and visualize an unfolded cubemap, 

 {{<image src="/img/posts/devlog1/cubemap.png" position="center">}}

just convert the texture like this
```cpp
auto unfolded = circe::gl::Texture::fromTexture(cubemap);
```
Irradiance maps and filtered environment maps can be produced from cubemap textures 
as well (also a brdf integration map).

```cpp
auto irradiance_map = circe::gl::IBL::irradianceMap(cubemap, {32, 32});
auto prefilter_map = circe::gl::IBL::preFilteredEnvironmentMap(cubemap, {128, 128});
auto lut = circe::gl::IBL::brdfIntegrationMap({512, 512});
```

