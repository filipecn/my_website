+++
title = "A path tracer with CUDA - prt 1"
date = "2021-07-04"
# author = "Lorem Ipsum"
# cover = "hello.jpg"
description = "Some thoughts during my implementation."
tags = ["devlog"]
# toc = true
draft = true
+++

I decided to write a path tracer with CUDA. Here we go.

## The big picture
An efficient and robust path tracer is a complex system that 
comprises several techniques that get improved everyday with lots of
research papers. Here I'll start with the very basics and add new features
as time permit. 

>The general algorithm is: shoot rays from camera, detect the interaction of these rays with objects and compute shading. 


