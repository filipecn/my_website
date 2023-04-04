+++
title = "RenderMan + Katana on Ubuntu"
date = "2022-02-24"
description = "Setting up RenderMan and Katana in Ubuntu 20.04"
tags = ["vfx"]
toc = true
+++

Here I'll quickly show how to set up RenderMan and Katana in a no CentOS distribution. In my case, Ubuntu 20.04. Remember, **these are just my personal notes**.


If you, like me, is just starting to get your hands on those softwares, here are some usefull links:
- [VFX Platform](http://vfxplatform.com/): List of versions of libraries/tools commonly used by the VFX industry.
- [RenderMan documentation](https://rmanwiki.pixar.com/) 
- [RenderMan tutorials](https://renderman.pixar.com/learn_tutorials)
- [RenderMan resources](https://renderman.pixar.com/community_resources)
- [Katana Developer Guide](https://learn.foundry.com/katana/dev-guide/index.html)

## RenderMan 
You can download a non-commercial version of RenderMan [here](https://renderman.pixar.com/store). You will get an `.rpm` file like this:

```shell
RenderMan-InstallerNCR-24.3.0_2208291-linuxRHEL7_gcc63icc190.x86_64.rpm
```
The versions in the filename may vary depending on your linux distribution and the version of RenderMan you download. Anyways, if you try to install it right away it will probably **NOT** work. That is because RenderMan is originaly built for the CentOS linux distribution, and it uses some specific libs your system does not have.

You will need to add the missing files to the `rpm` package. First, extract the contents of the `rpm` package and dive into the extracted tree of directories. We will be interested in the `Qt` lib folder, 
```shell
/opt/pixar/RenderMan-Installer-ncr-24.3/lib/3rdparty/Qt-5.12.6/lib
```
that is where we will put the missing lib files.

In my case I didn't have `libicu`. You can download the binaries [here](https://centos.pkgs.org/7/centos-x86_64/libicu-50.2-4.el7_7.x86_64.rpm.html) 
(scroll down to Download section, and get the binary package link). It is also a `rpm` file
```shell
libicu-50.2-4.el7_7.x86_64.rpm
```
Extract the contents and copy all libraries (`*.so`), located in the extracted folders `usr/lib64`, into the Qt lib folder I mentioned earlier.

That should do. In order to install RenderMan you don't need to pack everything back to a `rpm` file. You can just run (with sudo)
```shell
sudo ./opt/pixar/RenderMan-Installer-ncr-24.3/bin/RenderManInstaller
```
and just login with your renderman website account (the same you used to be able to download RenderMan). The installer will allow you to choose what components to install, **please remember to check the Katana plugin**. 

In case you encouter this error:

{{<image src="/img/posts/rendermankatana/ssh.png" position="center">}}

Then there are big chances that the versions of `libssl.so` and `libcrypto.so` in your system are not compatible to RenderMan. In my case, I had the version `1.1.1` of those libraries, and RenderMan required an older version `1.0.2`. 

To avoid making a downgrade in your system libraries and end up breaking things, you can simply download the file [openssl_1.0.2g.orig.tar.gz](https://launchpad.net/ubuntu/+source/openssl/1.0.2g-1ubuntu4.17) and do:
```shell
# extract files
tar -xf openssl_1.0.2g.orig.tar.gz
# jump into the makefile folder
cd openssl_1.0.2g.orig/openssl-1.0.2g
# configure with another install location
./config --prefix=/my/location --openssldir=/my/location/openssl shared
# build and install
make
make install
```
If everything works fine, you should find the `*.so` files in `/my/location/openssl`. Copy both `libcrypto.so*` and `libssl.so*` into the Qt lib folder.

Hopefully your login should work now!

### Arch Linux
In Arch I got an extra error when running `prman`:
```shell
...libtinfo.so.5: ... No such file or directory
```
In this case I installed the package from the AUR called `ncurses5-compat-libs`. When installing it with `makepkg` you may get an error about signature keys, in this case run
```shell
gpg --recv-keys <KEYID - See 'validpgpkeys' array in PKGBUILD>
```

## Katana

The installation of Katana itself didn't got me any trouble. However, Katana complained about 
the version of `libffi.so` and didn't open. My current version was the version `7.1.0` and 
Katana was requiring version `6`.

My solution (maybe not the best one) was to download the `deb` package through the mirror
[link](http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb), and
install 
```shell
sudo apt install ./libffi6_3.2.1-8_amd64.deb
```

Depending on the language settings of your system, mine are
```shell
env | grep LC
LC_ADDRESS=pt_BR.UTF-8
LC_NAME=pt_BR.UTF-8
LC_MONETARY=pt_BR.UTF-8
LC_PAPER=pt_BR.UTF-8
LC_IDENTIFICATION=pt_BR.UTF-8
LC_TELEPHONE=pt_BR.UTF-8
LC_MEASUREMENT=pt_BR.UTF-8
LC_CTYPE=pt_BR.UTF-8
LC_TIME=pt_BR.UTF-8
LC_NUMERIC=pt_BR.UTF-8
```
you may get another error on openning Katana:
```shell
RuntimeError: The specified transform file '...srgb.spi1d' could not be loaded. 
Invalid 'From' Tag
```

It happens because the numbers in the file use `.` as decimal separator and your language uses `,`.
The lazy solution is to setup the `LC_ALL` enviroment variable right before launching katana:
```shell
env LC_ALL=C ./katanaBin 
```

## RenderMan for Katana
The final step is to let Katana know where RenderMan is. In my case,
RenderMan was installed at `/opt/pixar`. Now we need to define the
following enviroment variables with their respective values 
(based on your installation paths):
```shell
# you may want to append to ${KATANA_RESOURCES} here
export KATANA_RESOURCES=/opt/pixar/RenderManForKatana-24.3/plugins/katana5.0
export RMANTREE=/opt/pixar/RenderManProServer-24.3
export RMAN_SHADERPATH=$RMANTREE/lib/shaders
export RMAN_RIXPLUGINPATH=$RMANTREE/lib/plugins
```

Again, remember to adapt the paths for the versions you installed.
