+++
title = "USD + Katana"
date = "2022-02-24"
description = "Setting up USD in Ubuntu 20.04"
tags = ["vfx"]
toc = true
draft=true
+++

For a second round of Katana + RenderMan, let's check how to use **USD** files in Katana.

Some usefull links first:
- [USD](https://graphics.pixar.com/usd/release/index.html): USD documentation

## USD

The USD library can be found in [github](https://github.com/PixarAnimationStudios/USD), there you will find 
the instructions for installation. 

In my case (Ubuntu 20.04), the build and install was very straightforward. I used their python script

```shell
python build_scripts/build_usd.py /usr/local/USD
```
to install, and it helps you though the dependencies.

Just remember to add the USD python modules to your python path
```shell
export PYTHONPATH="${PYTHONPATH}:/usr/local/USD/lib/python"
```

If everything goes well, you should be able to run
```shell
/usr/local/USD/bin/usdview USD/extras/usd/tutorials/convertingLayerFormats/Sphere.usda
```

{{<image src="/img/posts/rendermankatana/ssh.png" position="center">}}



