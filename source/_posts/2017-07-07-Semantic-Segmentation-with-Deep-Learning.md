---
title: 基于深度学习的语义分割综述
date: 2017-07-07 16:57:27
toc: true

categories:
- 机器学习

tags:
- 深度学习
- 图像分割
---

## 问题描述
TBD

## 数据集
[VOC2012](http://host.robots.ox.ac.uk/pascal/VOC/voc2012/)
[MSCOCO](http://mscoco.org/)
[SUN RGB-D](http://rgbd.cs.princeton.edu/)
[KITTI](http://www.cvlibs.net/datasets/kitti/)
[Cityscapes](https://www.cityscapes-dataset.com/)

## 传统方法
TODO
[TextonForest](http://mi.eng.cam.ac.uk/~cipolla/publications/inproceedings/2008-CVPR-semantic-texton-forests.pdf)
[Random Forest based classifiers](http://www.cse.chalmers.se/edu/year/2011/course/TDA361/Advanced%20Computer%20Graphics/BodyPartRecognition.pdf)

TODO：基于深度学习的方法简介

## FCN
Fully Convolutional Networks for Semantic Segmentation, [CVPR 2015](https://arxiv.org/abs/1411.4038), [PAMI 2016](https://arxiv.org/abs/1605.06211), [Caffe](https://github.com/shelhamer/fcn.berkeleyvision.org).

FCN有三个主要贡献。首先，FCN将经典的CNN中最后的全连接模块替换为卷积，形成一个全卷积的网络。这样，整个网络可以接收任意尺寸的图像，并输出对应大小的预测结果，支持了图像分割问题的端到端学习。其次，由于CNN的卷积层有stride，pooling此类的下采样运算，导致输出结果的分辨率降低。为了解决这一问题，FCN使用了反卷积(transpose convolution)。最后，FCN使用了skip connection来利用浅层网络的特征。仅仅使用深层网络的特征通过反卷积得到的分割结果较为粗糙，浅层网络的特征包含更多的细节，可以优化分割结果。

### Fully Convolutional Networks
将CNN最后的全连接层替换为卷积，构成全卷积网络。
TODO：fcn32s network image

### transpose convolution
[A guide to convolution arithmetic for deep learning](https://arxiv.org/abs/1603.07285)描述了反卷积的细节。[这里](https://github.com/vdumoulin/conv_arithmetic)有一个卷积运算的动图举例。
TODO: gif of transpose convolution

### Skip Connections
通过 skip connection 结合浅层网络和深层网络的特征，提高分割的细节效果。
TODO: FCN16s, FCN8s

## Dilated Convolutions
Multi-Scale Context Aggregation by Dilated Convolutions, [ICLR 2016](https://arxiv.org/abs/1511.07122), [Caffe](https://github.com/fyu/dilation)

这篇文章有两个主要贡献。首先，文章详细描述了Dilated Convolution，指出其可以在保持分辨率的同时增大感受野。在此基础上，文章设计了一个Context Module, 通过堆叠dilated convolution，使得模型可以学到不同尺度上的空间信息。

### Dilated Convolutions
Dilated convolution可以看作是使用一个dilated filter进行卷积。Dilated filter有很多0，浪费存储空间和计算。实际的实现中使用的是紧凑的filter，并通过参数控制可以支持任意的dilation factor.
TODO: gif of dilated convolution

### Context Module
文章使用VGG16作为frontend module的原型，将VGG16最后两级的pooling去掉，并将相应的卷积替换为dilated convolution. 在其之后接入一个context module。Context module由多个dilated convolution层组成，使得网络可以学习不同尺度上的上下文信息。
TODO：network

## DeepLabV2
DeepLab: Semantic Image Segmentation with Deep Convolutional Nets, Atrous Convolution, and Fully Connected CRFs, [PAMI 2017](https://arxiv.org/abs/1606.00915)

## RefineNet
RefineNet: Multi-Path Refinement Networks for High-Resolution Semantic Segmentation, [CVPR 2017](https://arxiv.org/abs/1611.06612), [MatConvNet](https://github.com/guosheng/refinenet)

使用Dilated convolution可以保持分辨率，这同时也意味着中间结果将占用大量的内存和计算量。文章精心设计了一种decoder框架RefineNet，通过fuse不同层次的encoder输出来解决精细分割的问题。文章使用ResNet作为主干网，通过级联RefineNet一步步fuse浅层特征到高层特征。

TODO：refinenet module， refinenet whole

## PSPNet
Pyramid Scene Parsing Network, [CVPR 2017](https://arxiv.org/abs/1612.01105), [Caffe](https://github.com/hszhao/PSPNet)

这篇文章分析了FCN网络的预测结果，发现很多错误是由于上下文信息利用不当导致的。文章使用ResNet作为主干网，并用dilated convolution替代了pooling。文章提出了一个pyramid pooling module, 类似于基于特征点的空间金字塔匹配模型，使用超大kernel对主干网络的feature map进行pooling，得到不同尺度的空间特征表示。

TODO：network

## GCN
Large Kernel Matters -- Improve Semantic Segmentation by Global Convolutional Network, [2017](https://arxiv.org/abs/1703.02719), Caffe

文章指出image segmentation需要对pixel同时进行localization和classification。基于FCN的网络着重解决了localization的问题，但是classification的问题并没有很好的解决。文章强调大kernel的重要性。对一个pixel进行分类，需要一个尽可能丰富的描述，越大的kernel意味着越大的感受野，也就意味着更多的上下文信息和更加丰富的特征描述。大kernel会带来计算性能的问题，文章提出了GCN(Global Convolutional Network)模块，通过近似大kernel解决了此问题。

下图为GCN模块，用于近似一个k*k的大kernel。
TODO：GCN module

TODO: network

## DeepLabV3
Rethinking Atrous Convolution for Semantic Image Segmentation, [2017](https://arxiv.org/abs/1706.05587)

## U-Net
U-Net Convolutional Networks for Biomedical Image Segmentation, [MICCAI 2015](https://arxiv.org/abs/1505.04597)


## ParseNet
ParseNet Looking Wider to See Better, [ICLR 2016](https://arxiv.org/abs/1506.04579)

## CRFasRNN
Conditional Random Fields as Recurrent Neural Networks, [ICCV 2015](https://arxiv.org/abs/1502.03240)

Efficient Inference in Fully Connected CRFs with Gaussian Edge Potentials, [NIPS 2011](https://arxiv.org/abs/1210.5644)

## DPN
Semantic Image Segmentation via Deep Parsing Network, [ICCV 2015](https://arxiv.org/abs/1509.02634)


